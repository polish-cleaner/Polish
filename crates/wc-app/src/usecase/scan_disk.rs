//! Scan disk → list of findings across every registered category.

use wc_core::{registered_categories, Environment, Finding, ScanContext};

pub fn run(env: Environment) -> Vec<Finding> {
    let ctx = ScanContext::new(env.clone());
    let mut all = Vec::new();
    for cat in registered_categories() {
        if cat.supports(&env) {
            all.extend(cat.scan(&ctx));
        }
    }
    all
}
