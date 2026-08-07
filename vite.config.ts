import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  base: "/rollycube/",
  server: { port: 5000 },
  plugins: [react()],
  build: {
    sourcemap: false,
    outDir: "dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".scss"],
  },
  define: {
    "process.env": {},
  },
  css: {
    modules: {
      localsConvention: "camelCase",
    },
  },
});
