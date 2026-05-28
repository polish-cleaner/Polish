//! Shared test fixtures + mock re-exports.
//!
//! Re-exports `mockall`-generated mocks for every port so downstream test
//! crates can `use wc_test_fixtures::MockFsPort;` without depending on
//! `mockall` directly.

#![forbid(unsafe_code)]
