//! Typestate marker structs. Zero-sized; zero runtime cost.

/// Scan complete. Allowed transition: → [`Previewed`].
pub struct Scanned;
/// User confirmed plan. Allowed transition: → [`Executed`].
pub struct Previewed;
/// Files moved into quarantine. Allowed transition: → [`Restorable`].
pub struct Executed;
/// Bundle complete. Allowed transition: terminal (restore consumes).
pub struct Restorable;

mod sealed {
    pub trait Sealed {}
    impl Sealed for super::Scanned {}
    impl Sealed for super::Previewed {}
    impl Sealed for super::Executed {}
    impl Sealed for super::Restorable {}
}

/// Sealed marker. External crates cannot add states.
pub trait State: sealed::Sealed {}
impl<T: sealed::Sealed> State for T {}
