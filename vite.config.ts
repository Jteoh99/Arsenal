import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === "production" ? "/Arsenal/" : "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5500,
    host: true,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
