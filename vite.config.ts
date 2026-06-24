import { copyFileSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repositoryName = "2026";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? `/${repositoryName}/` : "/",
  plugins: [
    react(),
    {
      name: "spa-fallback",
      closeBundle() {
        if (mode === "production") {
          copyFileSync(
            path.resolve(__dirname, "dist/index.html"),
            path.resolve(__dirname, "dist/404.html"),
          );
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
