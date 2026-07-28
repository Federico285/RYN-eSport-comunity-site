import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    proxy: {
      "/apply": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
