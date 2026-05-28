//! Detected environment facts. Used by [`crate::Category::supports`].

#[derive(Debug, Default, Clone)]
pub struct Environment {
    pub has_npm: bool,
    pub has_pnpm: bool,
    pub has_cargo: bool,
    pub has_wsl: bool,
    pub windows_build: Option<u32>,
}

impl Environment {
    pub fn has_npm(&self) -> bool { self.has_npm }
    pub fn has_pnpm(&self) -> bool { self.has_pnpm }
    pub fn has_cargo(&self) -> bool { self.has_cargo }
    pub fn has_wsl(&self) -> bool { self.has_wsl }
}
