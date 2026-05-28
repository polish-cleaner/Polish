//! `.pq` quarantine bundle writer adapter.
//!
//! Implements [`wc_core::ports::pq_port::PqPort`] using a segmented
//! sub-archive layout with BLAKE3 verify-on-restore. See
//! [`writer`] for the full format specification.

mod atomic;
mod hash;
mod journal;
mod writer;

pub use writer::PqWriterAdapter;
