//! Atomic rename helper for `.pq` bundle commits.
//!
//! On Windows the happy path uses `MoveFileExW(MOVEFILE_REPLACE_EXISTING |
//! MOVEFILE_WRITE_THROUGH)` so the rename survives a power loss with a
//! consistent destination. On non-Windows we fall back to `std::fs::rename`.
//!
//! In both cases, when the source and destination live on different
//! volumes the kernel cannot perform an in-place rename. We detect that
//! via `io::ErrorKind::CrossesDevices` (or Windows raw OS error 17,
//! `ERROR_NOT_SAME_DEVICE`) and fall back to a copy + delete sequence.

use std::fs;
use std::io;
use std::path::Path;

/// Atomically replace `dst` with `src`. On cross-volume moves, fall back
/// to copy + remove.
pub fn atomic_rename(src: &Path, dst: &Path) -> io::Result<()> {
    match platform_rename(src, dst) {
        Ok(()) => Ok(()),
        Err(e) if is_cross_volume(&e) => copy_then_remove(src, dst),
        Err(e) => Err(e),
    }
}

#[cfg(windows)]
fn platform_rename(src: &Path, dst: &Path) -> io::Result<()> {
    use std::os::windows::ffi::OsStrExt;
    use windows::core::PCWSTR;
    use windows::Win32::Storage::FileSystem::{
        MoveFileExW, MOVEFILE_REPLACE_EXISTING, MOVEFILE_WRITE_THROUGH,
    };

    fn to_wide(p: &Path) -> Vec<u16> {
        p.as_os_str()
            .encode_wide()
            .chain(std::iter::once(0))
            .collect()
    }

    let src_w = to_wide(src);
    let dst_w = to_wide(dst);

    // SAFETY: Single FFI call into a documented Win32 API. The two
    // PCWSTRs reference local Vec<u16> buffers that outlive the call;
    // both are NUL-terminated by `to_wide`. No memory ownership is
    // transferred to the OS.
    #[allow(unsafe_code)] // single FFI entry point; see SAFETY note above
    let result = unsafe {
        MoveFileExW(
            PCWSTR(src_w.as_ptr()),
            PCWSTR(dst_w.as_ptr()),
            MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH,
        )
    };
    result.map_err(|e| io::Error::from_raw_os_error(e.code().0))
}

#[cfg(not(windows))]
fn platform_rename(src: &Path, dst: &Path) -> io::Result<()> {
    fs::rename(src, dst)
}

fn is_cross_volume(err: &io::Error) -> bool {
    // Stable `io::ErrorKind::CrossesDevices` since Rust 1.85.
    if err.kind() == io::ErrorKind::CrossesDevices {
        return true;
    }
    // Windows raw fallback: ERROR_NOT_SAME_DEVICE (17).
    if err.raw_os_error() == Some(17) {
        return true;
    }
    // POSIX EXDEV (18) for completeness on the std-fallback path.
    if err.raw_os_error() == Some(18) {
        return true;
    }
    false
}

fn copy_then_remove(src: &Path, dst: &Path) -> io::Result<()> {
    fs::copy(src, dst)?;
    fs::remove_file(src)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn rename_into_empty_dst() {
        let tmp = TempDir::new().expect("tempdir");
        let src = tmp.path().join("src.bin");
        let dst = tmp.path().join("dst.bin");
        fs::write(&src, b"payload").expect("write");
        atomic_rename(&src, &dst).expect("rename");
        assert!(!src.exists());
        assert_eq!(fs::read(&dst).expect("read"), b"payload");
    }

    #[test]
    fn copy_then_remove_replaces_existing() {
        // Exercise the cross-volume fallback path directly so the
        // logic is covered on every CI runner (we can't easily fake
        // two volumes in unit tests).
        let tmp = TempDir::new().expect("tempdir");
        let src = tmp.path().join("src.bin");
        let dst = tmp.path().join("dst.bin");
        fs::write(&src, b"new").expect("write src");
        fs::write(&dst, b"old").expect("write dst");
        super::copy_then_remove(&src, &dst).expect("fallback");
        assert!(!src.exists());
        assert_eq!(fs::read(&dst).expect("read"), b"new");
    }
}
