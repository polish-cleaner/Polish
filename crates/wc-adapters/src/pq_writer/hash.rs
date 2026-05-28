//! Streaming BLAKE3 hashing of files on disk.
//!
//! Used at pack time to record content digests in the manifest and at
//! restore time to verify each extracted file.

use std::fs::File;
use std::io::{self, Read};
use std::path::Path;

/// Read `path` in 64 KiB chunks and return the lowercase BLAKE3 hex digest.
pub fn blake3_file(path: &Path) -> io::Result<String> {
    let mut file = File::open(path)?;
    let mut hasher = blake3::Hasher::new();
    let mut buf = [0u8; 64 * 1024];
    loop {
        let n = file.read(&mut buf)?;
        if n == 0 {
            break;
        }
        hasher.update(&buf[..n]);
    }
    Ok(hasher.finalize().to_hex().to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn blake3_of_known_input() {
        let tmp = TempDir::new().expect("tempdir");
        let p = tmp.path().join("a.bin");
        fs::write(&p, b"hello").expect("write");
        let hex = blake3_file(&p).expect("hash");
        // 64-hex digits
        assert_eq!(hex.len(), 64);
        assert!(hex.chars().all(|c| c.is_ascii_hexdigit()));
    }

    #[test]
    fn blake3_changes_when_content_changes() {
        let tmp = TempDir::new().expect("tempdir");
        let a = tmp.path().join("a.bin");
        let b = tmp.path().join("b.bin");
        fs::write(&a, b"foo").expect("write");
        fs::write(&b, b"bar").expect("write");
        assert_ne!(
            blake3_file(&a).expect("hash a"),
            blake3_file(&b).expect("hash b")
        );
    }
}
