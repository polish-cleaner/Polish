//! Top-level orchestrator that wires use cases. Stub.

use wc_core::Environment;
use wc_core::Finding;

use crate::usecase::scan_disk;

pub fn full_scan(env: Environment) -> Vec<Finding> {
    scan_disk::run(env)
}
