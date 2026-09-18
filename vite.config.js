import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: "src",
  publicDir: "../public",
  server: {
    host: true,
    port: 3000,
    open: false,
    cors: true,
    allowedHosts: true
  },
  build: {
    outDir: "../dist",
    emptyOutDir: false,
    minify: "esbuild",
    sourcemap: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
});
