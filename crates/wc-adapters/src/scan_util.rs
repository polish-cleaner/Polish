//! Shared filesystem walk for category scans. Returns one `Finding` per
//! regular file under `root`. Silently skips entries we can't `stat`.

use std::path::Path;
use walkdir::WalkDir;
use wc_core::Finding;

pub fn scan_dir(root: &Path, category_id: &'static str) -> Vec<Finding> {
    if !root.is_dir() {
        return Vec::new();
    }
    WalkDir::new(root)
        .into_iter()
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.file_type().is_file())
        .filter_map(|entry| {
            let size = entry.metadata().ok()?.len();
            Some(Finding {
                path: entry.into_path(),
                size,
                category_id: category_id.to_string(),
            })
        })
        .collect()
}

/// Convenience for categories with multiple cache roots — concatenates
/// findings across each.
pub fn scan_many(roots: &[&Path], category_id: &'static str) -> Vec<Finding> {
    roots
        .iter()
        .flat_map(|r| scan_dir(r, category_id))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    fn write(path: &Path, bytes: &[u8]) {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).expect("mkdir");
        }
        fs::write(path, bytes).expect("write");
    }

    #[test]
    fn scan_dir_missing_root_returns_empty() {
        let tmp = TempDir::new().expect("tempdir");
        assert!(scan_dir(&tmp.path().join("nope"), "x").is_empty());
    }

    #[test]
    fn scan_dir_walks_recursively() {
        let tmp = TempDir::new().expect("tempdir");
        write(&tmp.path().join("a/b/c.bin"), &[0u8; 10]);
        write(&tmp.path().join("a/d.bin"), &[0u8; 5]);
        let f = scan_dir(tmp.path(), "x");
        assert_eq!(f.len(), 2);
    }

    #[test]
    fn scan_many_concats_across_roots() {
        let a = TempDir::new().expect("tempdir");
        let b = TempDir::new().expect("tempdir");
        write(&a.path().join("x.bin"), &[0u8; 1]);
        write(&b.path().join("y.bin"), &[0u8; 1]);
        let f = scan_many(&[a.path(), b.path()], "x");
        assert_eq!(f.len(), 2);
    }
}
