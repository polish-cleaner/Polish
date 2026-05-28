//! Detected environment facts. Used by [`crate::Category::supports`].

use serde::{Deserialize, Serialize};

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct Environment {
    pub has_npm: bool,
    pub has_pnpm: bool,
    pub has_cargo: bool,
    pub has_wsl: bool,
    pub has_chrome: bool,
    pub has_edge: bool,
    pub has_firefox: bool,
    pub windows_build: Option<u32>,
}

impl Environment {
    pub fn has_npm(&self) -> bool {
        self.has_npm
    }
    pub fn has_pnpm(&self) -> bool {
        self.has_pnpm
    }
    pub fn has_cargo(&self) -> bool {
        self.has_cargo
    }
    pub fn has_wsl(&self) -> bool {
        self.has_wsl
    }
    pub fn has_chrome(&self) -> bool {
        self.has_chrome
    }
    pub fn has_edge(&self) -> bool {
        self.has_edge
    }
    pub fn has_firefox(&self) -> bool {
        self.has_firefox
    }
}
