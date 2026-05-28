//! `.pq` bundle manifest schema. Serde-serializable for on-disk + IPC use.

use serde::{Deserialize, Serialize};

/// Top-level manifest written into every `.pq` bundle.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Manifest {
    pub bundle_id: String,
    /// ISO-8601 UTC.
    pub created_at: String,
    pub schema_version: u32,
    pub items: Vec<ManifestItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ManifestItem {
    pub original_path: String,
    pub size: u64,
    /// BLAKE3 hex digest of the original file contents.
    pub blake3: String,
    pub category_id: String,
}

impl Manifest {
    pub const SCHEMA_VERSION: u32 = 1;
}
