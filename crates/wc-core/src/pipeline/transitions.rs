//! State transitions on [`Cleanup`].
//!
//! Execute / restore signatures take port references; concrete plumbing lands
//! when adapters arrive.

use super::states::{Executed, Previewed, Restorable, Scanned};
use super::{Cleanup, Finding};
use std::marker::PhantomData;

impl Cleanup<Scanned> {
    /// Construct a freshly-scanned cleanup from a vec of findings.
    pub fn new(findings: Vec<Finding>) -> Self {
        Self {
            findings,
            _state: PhantomData,
        }
    }

    /// Transition `Scanned → Previewed`.
    pub fn preview(self) -> Cleanup<Previewed> {
        Cleanup {
            findings: self.findings,
            _state: PhantomData,
        }
    }
}

impl Cleanup<Previewed> {
    /// Transition `Previewed → Executed`. Real implementation will move files
    /// into quarantine via [`crate::ports::PqPort`] and [`crate::ports::FsPort`].
    pub fn execute(self) -> Cleanup<Executed> {
        Cleanup {
            findings: self.findings,
            _state: PhantomData,
        }
    }
}

impl Cleanup<Executed> {
    /// Transition `Executed → Restorable`.
    pub fn into_restorable(self) -> Cleanup<Restorable> {
        Cleanup {
            findings: self.findings,
            _state: PhantomData,
        }
    }
}
