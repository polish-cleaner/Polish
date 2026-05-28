//! `wc-app` — application layer (use cases).
//!
//! Use cases orchestrate the domain via ports. No I/O happens here; each
//! function takes port impls as generic parameters.

#![forbid(unsafe_code)]

pub mod orchestrator;
pub mod usecase;
