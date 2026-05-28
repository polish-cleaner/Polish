//! `wc-ipc` — wire types for the polish-svc ↔ polish-ui named-pipe IPC.
//!
//! Depends only on `wc-core` types. Mirrored to TS via codegen in
//! `packages/ipc-types` (planned).

#![forbid(unsafe_code)]

use serde::{Deserialize, Serialize};
use wc_core::Finding;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Request {
    Ping,
    Scan,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Response {
    Pong,
    ScanStarted,
    ScanComplete { findings: Vec<Finding> },
    Error { message: String },
}
