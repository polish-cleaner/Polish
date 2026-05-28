import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const TAURI_DEBUG = !!process.env.TAURI_DEBUG;

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: { ignored: ["**/src-tauri/**"] },
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    target: "chrome105",
    minify: TAURI_DEBUG ? false : "esbuild",
    sourcemap: TAURI_DEBUG,
  },
});
