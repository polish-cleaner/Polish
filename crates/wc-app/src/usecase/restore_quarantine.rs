//! Restore a `.pq` bundle. Stub for v1.0 scaffold.

use wc_core::pipeline::Restorable;
use wc_core::Cleanup;

pub fn run(_bundle: Cleanup<Restorable>) {
    // Real impl: unpack via PqPort, restore files via FsPort.
}
