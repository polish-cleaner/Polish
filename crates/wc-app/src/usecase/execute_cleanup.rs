//! Execute a previewed cleanup. Real impl will take port refs.

use wc_core::pipeline::{Executed, Previewed};
use wc_core::Cleanup;

pub fn run(plan: Cleanup<Previewed>) -> Cleanup<Executed> {
    plan.execute()
}
