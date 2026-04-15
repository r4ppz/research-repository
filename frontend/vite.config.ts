import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react({
    babel: {
      plugins: ["babel-plugin-react-compiler"],
    },
  }), cloudflare()],
  preview: {
    allowedHosts: true, // for testing
  },
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600, // Increase from default 500 kB
  },
});