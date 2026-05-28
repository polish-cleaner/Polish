//! Build a Previewed cleanup from a list of findings.

use wc_core::pipeline::{Previewed, Scanned};
use wc_core::{Cleanup, Finding};

pub fn run(findings: Vec<Finding>) -> Cleanup<Previewed> {
    Cleanup::<Scanned>::new(findings).preview()
}
