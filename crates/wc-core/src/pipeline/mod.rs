//! Typestate cleanup pipeline: `Scanned → Previewed → Executed → Restorable`.
//!
//! See ARCHITECTURE.md §3. Invalid transitions fail to compile.

pub mod states;
pub mod transitions;

use serde::{Deserialize, Serialize};
use std::marker::PhantomData;
use std::path::PathBuf;

pub use states::{Executed, Previewed, Restorable, Scanned, State};

/// A single artifact a category proposes to clean.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Finding {
    pub path: PathBuf,
    pub size: u64,
    pub category_id: String,
}

/// Cleanup pipeline parameterized by typestate `S`.
pub struct Cleanup<S: State> {
    pub(crate) findings: Vec<Finding>,
    pub(crate) _state: PhantomData<S>,
}

impl<S: State> Cleanup<S> {
    /// Number of findings currently held.
    pub fn len(&self) -> usize {
        self.findings.len()
    }

    /// True if no findings.
    pub fn is_empty(&self) -> bool {
        self.findings.is_empty()
    }
}
