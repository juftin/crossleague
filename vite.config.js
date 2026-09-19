import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: "src",
  publicDir: "../public",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    open: false,
    cors: true,
    allowedHosts: true
  },
  build: {
    outDir: "../dist",
    emptyOutDir: false,
    sourcemap: true,
    cssMinify: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
});
