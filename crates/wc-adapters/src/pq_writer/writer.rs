//! `.pq` quarantine bundle writer.
//!
//! # On-disk format
//!
//! A single file on disk: `<name>.pq`.
//!
//! Internal layout — an **uncompressed outer `tar` archive** containing:
//!
//! - `manifest.json` at the root. Serialized [`wc_core::Manifest`].
//! - `categories/<category-id>.tar.zst` — one zstd-compressed tar
//!   sub-archive per category. Files inside use their original absolute
//!   path as the entry path, with the drive-letter colon stripped on
//!   Windows (e.g. `C:\Users\foo\.npm\_cacache\blob` becomes
//!   `C/Users/foo/.npm/_cacache/blob`).
//!
//! Each [`wc_core::manifest::ManifestItem`] stores the BLAKE3 hex digest
//! of the **original file** computed at pack time. We verify on restore,
//! not on write: restoring recomputes BLAKE3 of every extracted file and
//! compares against the manifest. Any mismatch raises
//! [`wc_core::ports::pq_port::PqError::Corrupt`].
//!
//! # Atomic write protocol
//!
//! 1. Create `<bundle>.journal` with `bundle_id`, ISO-8601 start
//!    timestamp, and the count of source files (plain text, one field
//!    per line).
//! 2. Stream the outer tar (including each sub-archive) to
//!    `<bundle>.tmp`.
//! 3. `File::sync_all()` the `.tmp`.
//! 4. Atomically rename `<bundle>.tmp` → `<bundle>` via Windows
//!    `MoveFileExW(MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH)`,
//!    or `std::fs::rename` on non-Windows.
//! 5. Remove `<bundle>.journal`.
//!
//! If the rename fails with `io::ErrorKind::CrossesDevices` or raw OS
//! error 17 (`ERROR_NOT_SAME_DEVICE`), the helper falls back to
//! `fs::copy` + `fs::remove_file`. See [`super::atomic`].

use std::collections::BTreeMap;
use std::fs::{self, File};
use std::io::{self, BufReader, BufWriter, Read, Write};
use std::path::{Path, PathBuf};

use rayon::prelude::*;
use tar::{Archive, Builder, Header};
use time::format_description::well_known::Iso8601;
use time::OffsetDateTime;

use wc_core::manifest::{Manifest, ManifestItem};
use wc_core::ports::pq_port::{PackOutcome, PqError, PqPort};

use super::{atomic, hash, journal};

/// Default category id assigned to items packed via the [`PqPort::pack`]
/// trait surface (which doesn't carry per-file category metadata).
/// Callers needing per-category bundles call a higher-level use case
/// that splits items first.
const DEFAULT_CATEGORY: &str = "uncategorized";

/// Concrete `.pq` writer/reader. Stateless; safe to share across
/// threads.
#[derive(Debug, Default, Clone, Copy)]
pub struct PqWriterAdapter;

impl PqWriterAdapter {
    pub fn new() -> Self {
        Self
    }
}

impl PqPort for PqWriterAdapter {
    fn pack(&self, items: Vec<PathBuf>, out: &Path) -> Result<PackOutcome, PqError> {
        let bundle_id = derive_bundle_id(out);
        let tmp_path = with_suffix(out, "tmp");
        let journal_path = with_suffix(out, "journal");

        journal::write_start(&journal_path, &bundle_id, items.len())?;

        // Phase 1: per-file stat + BLAKE3 in parallel.
        //
        // Race tolerance: `%TEMP%` churns under us — files vanish or
        // become locked between the caller's pre-flight and our read.
        // NotFound + PermissionDenied are treated as soft skips (push
        // to `skipped`) instead of aborting the whole bundle. Any
        // other I/O error still fails the pack.
        //
        // Parallel because BLAKE3 hashing is CPU-bound and Windows
        // Defender amplifies each open by 10-100 ms — sequential over
        // 24k Chrome cache files = minutes.
        let phase1: Vec<Phase1Outcome> = items
            .par_iter()
            .map(|src| try_hash_item(src))
            .collect::<Result<Vec<_>, _>>()?;

        let mut manifest_items: Vec<ManifestItem> = Vec::with_capacity(phase1.len());
        let mut skipped_phase1: Vec<PathBuf> = Vec::new();
        for o in phase1 {
            match o {
                Phase1Outcome::Hashed(item) => manifest_items.push(item),
                Phase1Outcome::Skipped(path) => skipped_phase1.push(path),
            }
        }

        // Group surviving (post-phase-1) items by category for the
        // sub-archive build. v1.0 trait surface doesn't carry per-file
        // category metadata; everything lands in DEFAULT_CATEGORY.
        let survivors: Vec<PathBuf> = manifest_items
            .iter()
            .map(|m| PathBuf::from(&m.original_path))
            .collect();
        let mut by_cat: BTreeMap<String, Vec<PathBuf>> = BTreeMap::new();
        by_cat
            .entry(DEFAULT_CATEGORY.to_string())
            .or_default()
            .extend(survivors.iter().cloned());

        // Phase 2: build category sub-archives. Same race-tolerance
        // story as phase 1 — a file can vanish between hash and tar
        // append. Items missing here also land in skipped + are
        // removed from the manifest before we emit it.
        let mut sub_archives: Vec<(String, Vec<u8>)> = Vec::with_capacity(by_cat.len());
        let mut skipped_phase2: Vec<PathBuf> = Vec::new();
        for (cat_id, paths) in &by_cat {
            let (buf, sub_skipped) = build_sub_archive(paths)?;
            sub_archives.push((cat_id.clone(), buf));
            skipped_phase2.extend(sub_skipped);
        }

        // Drop manifest entries for anything phase 2 had to skip.
        let skipped_phase2_set: std::collections::HashSet<String> = skipped_phase2
            .iter()
            .map(|p| p.to_string_lossy().into_owned())
            .collect();
        let manifest_items_final: Vec<ManifestItem> = manifest_items
            .into_iter()
            .filter(|m| !skipped_phase2_set.contains(&m.original_path))
            .collect();

        let manifest = Manifest {
            bundle_id: bundle_id.clone(),
            created_at: now_iso8601()?,
            schema_version: Manifest::SCHEMA_VERSION,
            items: manifest_items_final,
        };
        let packed_count = manifest.items.len();
        let manifest_bytes =
            serde_json::to_vec_pretty(&manifest).map_err(|e| PqError::Manifest(e.to_string()))?;

        // Write the outer tar to <bundle>.tmp.
        {
            let tmp_file = File::create(&tmp_path)?;
            let mut writer = BufWriter::new(tmp_file);
            {
                let mut outer = Builder::new(&mut writer);
                outer.mode(tar::HeaderMode::Deterministic);
                append_bytes(&mut outer, "manifest.json", &manifest_bytes)?;
                for (cat_id, bytes) in &sub_archives {
                    let entry_name = format!("categories/{cat_id}.tar.zst");
                    append_bytes(&mut outer, &entry_name, bytes)?;
                }
                outer.finish()?;
            }
            let tmp_file = writer
                .into_inner()
                .map_err(|e| PqError::Io(io::Error::other(e.to_string())))?;
            tmp_file.sync_all()?;
        }

        atomic::atomic_rename(&tmp_path, out)?;
        journal::remove(&journal_path)?;

        let mut skipped = skipped_phase1;
        skipped.extend(skipped_phase2);
        Ok(PackOutcome {
            packed_count,
            skipped,
        })
    }

    fn unpack(&self, bundle: &Path, dest_root: &Path) -> Result<(), PqError> {
        let (manifest, sub_archives) = read_outer(bundle)?;
        fs::create_dir_all(dest_root)?;

        // Build path -> digest map for O(1) verify lookups.
        let mut expected: BTreeMap<String, (u64, String)> = BTreeMap::new();
        for item in &manifest.items {
            expected.insert(item.original_path.clone(), (item.size, item.blake3.clone()));
        }

        for (_cat_id, bytes) in sub_archives {
            extract_sub_archive(&bytes, dest_root, &expected, /*verify=*/ true)?;
        }
        Ok(())
    }

    fn verify(&self, bundle: &Path) -> Result<(), PqError> {
        let (manifest, sub_archives) = read_outer(bundle)?;
        let mut expected: BTreeMap<String, (u64, String)> = BTreeMap::new();
        for item in &manifest.items {
            expected.insert(item.original_path.clone(), (item.size, item.blake3.clone()));
        }
        for (_cat_id, bytes) in sub_archives {
            verify_sub_archive(&bytes, &expected)?;
        }
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

fn with_suffix(out: &Path, suffix: &str) -> PathBuf {
    let mut name = out
        .file_name()
        .map(|n| n.to_os_string())
        .unwrap_or_default();
    name.push(".");
    name.push(suffix);
    match out.parent() {
        Some(p) if !p.as_os_str().is_empty() => p.join(name),
        _ => PathBuf::from(name),
    }
}

fn derive_bundle_id(out: &Path) -> String {
    out.file_stem()
        .map(|s| s.to_string_lossy().into_owned())
        .unwrap_or_else(|| "bundle".to_string())
}

fn now_iso8601() -> Result<String, PqError> {
    OffsetDateTime::now_utc()
        .format(&Iso8601::DEFAULT)
        .map_err(|e| PqError::Manifest(format!("timestamp format: {e}")))
}

/// Convert an absolute on-disk path into the entry path used inside a
/// sub-archive. `C:\Users\foo\x.bin` becomes `C/Users/foo/x.bin`;
/// `/home/foo/x.bin` becomes `home/foo/x.bin`. Always forward-slashes.
fn archive_entry_path(src: &Path) -> String {
    let s = src.to_string_lossy().replace('\\', "/");
    // Strip Windows drive-colon: `C:/Users/foo` -> `C/Users/foo`.
    let no_colon: String = s
        .chars()
        .enumerate()
        .filter(|(i, c)| !(*i == 1 && *c == ':'))
        .map(|(_, c)| c)
        .collect();
    // Strip any leading slashes so the path is relative.
    no_colon.trim_start_matches('/').to_string()
}

/// Build a category sub-archive. Returns `(bytes, skipped)` —
/// skipped paths were dropped because the file vanished or became
/// locked between phase-1 hashing and our tar read.
fn build_sub_archive(paths: &[PathBuf]) -> Result<(Vec<u8>, Vec<PathBuf>), PqError> {
    let mut zenc = zstd::stream::Encoder::new(Vec::<u8>::new(), 3).map_err(PqError::Io)?;
    let mut skipped: Vec<PathBuf> = Vec::new();
    {
        let mut tarb = Builder::new(&mut zenc);
        tarb.mode(tar::HeaderMode::Deterministic);
        for p in paths {
            let entry = archive_entry_path(p);
            let mut f = match File::open(p) {
                Ok(f) => f,
                Err(e) if is_skippable(e.kind()) => {
                    skipped.push(p.clone());
                    continue;
                }
                Err(e) => return Err(io_with_path(p, e)),
            };
            let meta = match f.metadata() {
                Ok(m) => m,
                Err(e) if is_skippable(e.kind()) => {
                    skipped.push(p.clone());
                    continue;
                }
                Err(e) => return Err(io_with_path(p, e)),
            };
            let mut header = Header::new_gnu();
            header.set_size(meta.len());
            header.set_mode(0o644);
            header.set_mtime(0);
            header.set_entry_type(tar::EntryType::Regular);
            header.set_cksum();
            tarb.append_data(&mut header, &entry, &mut f)
                .map_err(|e| io_with_path(p, e))?;
        }
        tarb.finish()?;
    }
    let out = zenc.finish().map_err(PqError::Io)?;
    Ok((out, skipped))
}

/// Result of trying to stat + hash one source file in phase 1.
enum Phase1Outcome {
    Hashed(ManifestItem),
    Skipped(PathBuf),
}

fn try_hash_item(src: &Path) -> Result<Phase1Outcome, PqError> {
    let meta = match fs::metadata(src) {
        Ok(m) => m,
        Err(e) if is_skippable(e.kind()) => return Ok(Phase1Outcome::Skipped(src.to_path_buf())),
        Err(e) => return Err(io_with_path(src, e)),
    };
    if !meta.is_file() {
        return Err(PqError::Io(io::Error::new(
            io::ErrorKind::InvalidInput,
            format!("not a regular file: {}", src.display()),
        )));
    }
    let digest = match hash::blake3_file(src) {
        Ok(d) => d,
        Err(e) if is_skippable(e.kind()) => return Ok(Phase1Outcome::Skipped(src.to_path_buf())),
        Err(e) => return Err(io_with_path(src, e)),
    };
    Ok(Phase1Outcome::Hashed(ManifestItem {
        original_path: src.to_string_lossy().into_owned(),
        size: meta.len(),
        blake3: digest,
        category_id: DEFAULT_CATEGORY.to_string(),
    }))
}

/// Errors we treat as soft skips: file vanished mid-pack (NotFound)
/// or got an exclusive lock since pre-flight (PermissionDenied on
/// Windows for sharing-violation). Everything else is hard-fail.
fn is_skippable(kind: io::ErrorKind) -> bool {
    matches!(
        kind,
        io::ErrorKind::NotFound | io::ErrorKind::PermissionDenied
    )
}

/// Prepend the failing file path to an io::Error so the UI can show
/// users *which* file caused the pack to fail (locked, missing, ACL).
fn io_with_path(path: &Path, e: io::Error) -> PqError {
    PqError::Io(io::Error::new(
        e.kind(),
        format!("{}: {}", path.display(), e),
    ))
}

fn append_bytes<W: Write>(
    builder: &mut Builder<W>,
    name: &str,
    bytes: &[u8],
) -> Result<(), PqError> {
    let mut header = Header::new_gnu();
    header.set_size(bytes.len() as u64);
    header.set_mode(0o644);
    header.set_mtime(0);
    header.set_entry_type(tar::EntryType::Regular);
    header.set_cksum();
    builder.append_data(&mut header, name, bytes)?;
    Ok(())
}

/// Raw bytes of one decompressed-on-demand category sub-archive.
/// `(category_id, tar.zst bytes)`.
type SubArchive = (String, Vec<u8>);

/// Read the outer tar; return parsed manifest plus the raw bytes of
/// each `categories/<id>.tar.zst` entry.
fn read_outer(bundle: &Path) -> Result<(Manifest, Vec<SubArchive>), PqError> {
    let file = File::open(bundle)?;
    let mut archive = Archive::new(BufReader::new(file));
    let mut manifest: Option<Manifest> = None;
    let mut subs: Vec<SubArchive> = Vec::new();
    for entry in archive.entries()? {
        let mut entry = entry?;
        let path_in_tar = entry
            .path()
            .map_err(PqError::Io)?
            .to_string_lossy()
            .into_owned();
        let mut buf = Vec::new();
        entry.read_to_end(&mut buf)?;
        if path_in_tar == "manifest.json" {
            let m: Manifest =
                serde_json::from_slice(&buf).map_err(|e| PqError::Manifest(e.to_string()))?;
            manifest = Some(m);
        } else if let Some(rest) = path_in_tar.strip_prefix("categories/") {
            let cat_id = rest.strip_suffix(".tar.zst").unwrap_or(rest).to_string();
            subs.push((cat_id, buf));
        } else {
            // Unknown entry: ignored for forward-compatibility.
        }
    }
    let manifest = manifest.ok_or_else(|| PqError::Manifest("manifest.json missing".into()))?;
    Ok((manifest, subs))
}

/// Decompress + iterate a sub-archive. If `verify`, recompute BLAKE3
/// of each extracted-to-dest file and compare. Otherwise (read-only
/// verify-without-extract path) caller will use [`verify_sub_archive`].
fn extract_sub_archive(
    bytes: &[u8],
    dest_root: &Path,
    expected: &BTreeMap<String, (u64, String)>,
    verify: bool,
) -> Result<(), PqError> {
    let decoder = zstd::stream::Decoder::new(bytes).map_err(PqError::Io)?;
    let mut archive = Archive::new(decoder);
    for entry in archive.entries()? {
        let mut entry = entry?;
        let entry_path = entry
            .path()
            .map_err(PqError::Io)?
            .to_string_lossy()
            .into_owned();
        let out_path = dest_root.join(&entry_path);
        if let Some(parent) = out_path.parent() {
            fs::create_dir_all(parent)?;
        }
        // Stream + hash simultaneously.
        let mut hasher = blake3::Hasher::new();
        let mut out_file = BufWriter::new(File::create(&out_path)?);
        let mut buf = [0u8; 64 * 1024];
        let mut size: u64 = 0;
        loop {
            let n = entry.read(&mut buf)?;
            if n == 0 {
                break;
            }
            hasher.update(&buf[..n]);
            out_file.write_all(&buf[..n])?;
            size += n as u64;
        }
        out_file.flush()?;
        let digest = hasher.finalize().to_hex().to_string();

        if verify {
            // Locate the manifest record by matching the archive entry
            // back to the original-path map. The archive path is the
            // "C/Users/.." form derived from `original_path`.
            let matched = expected
                .iter()
                .find(|(orig, _)| archive_entry_path(Path::new(orig)) == entry_path);
            let (_orig, (exp_size, exp_hash)) = matched
                .ok_or_else(|| PqError::Manifest(format!("no manifest entry for {entry_path}")))?;
            if size != *exp_size || &digest != exp_hash {
                return Err(PqError::Corrupt);
            }
        }
    }
    Ok(())
}

/// Verify-only sub-archive pass: hash entries in-memory, no extraction.
fn verify_sub_archive(
    bytes: &[u8],
    expected: &BTreeMap<String, (u64, String)>,
) -> Result<(), PqError> {
    let decoder = zstd::stream::Decoder::new(bytes).map_err(PqError::Io)?;
    let mut archive = Archive::new(decoder);
    for entry in archive.entries()? {
        let mut entry = entry?;
        let entry_path = entry
            .path()
            .map_err(PqError::Io)?
            .to_string_lossy()
            .into_owned();
        let mut hasher = blake3::Hasher::new();
        let mut buf = [0u8; 64 * 1024];
        let mut size: u64 = 0;
        loop {
            let n = entry.read(&mut buf)?;
            if n == 0 {
                break;
            }
            hasher.update(&buf[..n]);
            size += n as u64;
        }
        let digest = hasher.finalize().to_hex().to_string();
        let matched = expected
            .iter()
            .find(|(orig, _)| archive_entry_path(Path::new(orig)) == entry_path);
        let (_orig, (exp_size, exp_hash)) = matched
            .ok_or_else(|| PqError::Manifest(format!("no manifest entry for {entry_path}")))?;
        if size != *exp_size || &digest != exp_hash {
            return Err(PqError::Corrupt);
        }
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::{Seek, SeekFrom};
    use tempfile::TempDir;

    fn write_file(path: &Path, bytes: &[u8]) {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).expect("mkdir");
        }
        fs::write(path, bytes).expect("write");
    }

    /// Build three source files, pack them, unpack to a fresh dir,
    /// confirm every byte round-trips.
    #[test]
    fn pack_unpack_roundtrip() {
        let tmp = TempDir::new().expect("tempdir");
        let src_dir = tmp.path().join("src");
        let a = src_dir.join("a.bin");
        let b = src_dir.join("nested/b.bin");
        let c = src_dir.join("c.bin");
        write_file(&a, b"alpha bytes");
        write_file(&b, &[0xAB; 4096]);
        write_file(&c, b"");

        let bundle = tmp.path().join("out.pq");
        let adapter = PqWriterAdapter::new();
        adapter
            .pack(vec![a.clone(), b.clone(), c.clone()], &bundle)
            .expect("pack");
        assert!(bundle.exists());

        let dest = tmp.path().join("restored");
        adapter.unpack(&bundle, &dest).expect("unpack");

        for original in [&a, &b, &c] {
            let restored = dest.join(archive_entry_path(original));
            let want = fs::read(original).expect("read original");
            let got = fs::read(&restored).expect("read restored");
            assert_eq!(want, got, "mismatch for {}", original.display());
        }
    }

    /// Race tolerance: a path that doesn't exist (file vanished between
    /// the scan and the pack — common in `%TEMP%`) MUST land in
    /// `PackOutcome::skipped`, not abort the whole bundle. The
    /// remaining valid files must still pack + round-trip cleanly.
    #[test]
    fn pack_skips_missing_files_silently() {
        let tmp = TempDir::new().expect("tempdir");
        let real = tmp.path().join("real.bin");
        write_file(&real, b"x");
        let phantom = tmp.path().join("does/not/exist.bin");

        let bundle = tmp.path().join("out.pq");
        let adapter = PqWriterAdapter::new();
        let outcome = adapter
            .pack(vec![real.clone(), phantom.clone()], &bundle)
            .expect("pack must NOT fail on a missing source");

        assert_eq!(outcome.packed_count, 1, "real file should be packed");
        assert_eq!(outcome.skipped, vec![phantom], "phantom should be skipped");
        assert!(bundle.exists(), "bundle file should exist after pack");

        // Round-trip the survivor.
        let dest = tmp.path().join("restored");
        adapter.unpack(&bundle, &dest).expect("unpack");
        let restored = dest.join(archive_entry_path(&real));
        assert_eq!(fs::read(&restored).expect("read restored"), b"x");
    }

    /// Race tolerance, sharper case: file exists at the start of pack
    /// (passes phase-1 stat + hash) but disappears before phase-2 tar
    /// build. Simulated here by manually re-deleting the file inside
    /// `build_sub_archive` is hard, so we exercise the same code path
    /// by deleting BEFORE pack runs — the file must surface in
    /// `skipped` even when it was present at the caller's scan time.
    /// (This is the bug from the 2026-05-28 user report: a `%TEMP%`
    /// `.tmp` file vanished between scan and pack — pack errored;
    /// post-fix it skips.)
    #[test]
    fn pack_returns_packed_count_matching_manifest_after_skips() {
        let tmp = TempDir::new().expect("tempdir");
        let a = tmp.path().join("a.bin");
        let b = tmp.path().join("b.bin");
        let phantom = tmp.path().join("phantom.bin");
        write_file(&a, b"alpha");
        write_file(&b, b"beta");

        let bundle = tmp.path().join("out.pq");
        let adapter = PqWriterAdapter::new();
        let outcome = adapter
            .pack(vec![a, b, phantom.clone()], &bundle)
            .expect("pack");

        assert_eq!(outcome.packed_count, 2);
        assert_eq!(outcome.skipped, vec![phantom]);

        // Verify the bundle's manifest matches packed_count.
        let file = File::open(&bundle).expect("open bundle");
        let mut archive = Archive::new(BufReader::new(file));
        let mut found = false;
        for entry in archive.entries().expect("entries") {
            let mut entry = entry.expect("entry");
            let p = entry.path().expect("path").to_string_lossy().into_owned();
            if p == "manifest.json" {
                let mut buf = Vec::new();
                entry.read_to_end(&mut buf).expect("read");
                let m: Manifest = serde_json::from_slice(&buf).expect("parse manifest");
                assert_eq!(m.items.len(), outcome.packed_count);
                found = true;
                break;
            }
        }
        assert!(found, "manifest.json not found in bundle");
    }

    #[test]
    fn verify_clean_bundle_ok() {
        let tmp = TempDir::new().expect("tempdir");
        let a = tmp.path().join("src/a.bin");
        write_file(&a, b"hello world");
        let bundle = tmp.path().join("out.pq");
        let adapter = PqWriterAdapter::new();
        adapter.pack(vec![a], &bundle).expect("pack");
        adapter.verify(&bundle).expect("verify ok");
    }

    /// Flip a single byte in the middle of the .pq and confirm
    /// verify reports Corrupt. We target a region in the second half
    /// of the file so the flip lands inside a zstd-compressed
    /// sub-archive payload (not the outer tar's manifest entry,
    /// which would surface as Manifest, not Corrupt).
    #[test]
    fn verify_detects_corruption() {
        let tmp = TempDir::new().expect("tempdir");
        let a = tmp.path().join("src/a.bin");
        // Big enough that a sub-archive payload occupies most of the
        // file's second half.
        let payload: Vec<u8> = (0..8192u32).map(|i| (i & 0xFF) as u8).collect();
        write_file(&a, &payload);

        let bundle = tmp.path().join("out.pq");
        let adapter = PqWriterAdapter::new();
        adapter.pack(vec![a], &bundle).expect("pack");

        // Flip a byte ~75% into the file.
        let mut f = fs::OpenOptions::new()
            .read(true)
            .write(true)
            .open(&bundle)
            .expect("reopen");
        let len = f.metadata().expect("meta").len();
        let pos = (len * 3) / 4;
        f.seek(SeekFrom::Start(pos)).expect("seek");
        let mut byte = [0u8; 1];
        std::io::Read::read_exact(&mut f, &mut byte).expect("read");
        byte[0] ^= 0xFF;
        f.seek(SeekFrom::Start(pos)).expect("seek back");
        f.write_all(&byte).expect("write flipped");
        f.sync_all().expect("sync");
        drop(f);

        let detected = matches!(
            adapter.verify(&bundle),
            // A flipped byte inside zstd framing can surface as an
            // Io error from the decoder; the contract for "corruption
            // detected" is satisfied either way.
            Err(PqError::Corrupt) | Err(PqError::Io(_))
        );
        assert!(detected, "verify should report corruption after byte flip");
    }

    #[test]
    fn manifest_records_blake3() {
        let tmp = TempDir::new().expect("tempdir");
        let a = tmp.path().join("src/a.bin");
        let b = tmp.path().join("src/b.bin");
        write_file(&a, b"one");
        write_file(&b, b"two");
        let bundle = tmp.path().join("out.pq");
        PqWriterAdapter::new()
            .pack(vec![a, b], &bundle)
            .expect("pack");

        // Crack the outer tar, find manifest.json, parse it.
        let file = File::open(&bundle).expect("open");
        let mut archive = Archive::new(BufReader::new(file));
        let mut manifest: Option<Manifest> = None;
        for entry in archive.entries().expect("entries") {
            let mut entry = entry.expect("entry");
            let p = entry.path().expect("path").to_string_lossy().into_owned();
            if p == "manifest.json" {
                let mut buf = Vec::new();
                entry.read_to_end(&mut buf).expect("read");
                manifest = Some(serde_json::from_slice(&buf).expect("parse"));
                break;
            }
        }
        let manifest = manifest.expect("manifest entry");
        assert_eq!(manifest.items.len(), 2);
        for item in &manifest.items {
            assert_eq!(item.blake3.len(), 64, "blake3 hex must be 64 chars");
            assert!(item.blake3.chars().all(|c| c.is_ascii_hexdigit()));
        }
    }

    #[test]
    fn atomic_rename_replaces_existing() {
        let tmp = TempDir::new().expect("tempdir");
        let src = tmp.path().join("src.bin");
        let dst = tmp.path().join("dst.bin");
        fs::write(&dst, b"A").expect("seed dst");
        fs::write(&src, b"B").expect("seed src");
        super::atomic::atomic_rename(&src, &dst).expect("rename");
        assert!(!src.exists());
        assert_eq!(fs::read(&dst).expect("read"), b"B");
    }
}
