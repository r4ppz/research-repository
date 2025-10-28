import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Use different base URL based on environment
const base = process.env.DEPLOY_ENV === "github-pages" ? "/research-repository/" : "/";

export default defineConfig({
  plugins: [react()],
  base,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
