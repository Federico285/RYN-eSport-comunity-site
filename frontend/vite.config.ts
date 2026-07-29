import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    base: env.VITE_BASE_PATH ?? "/",
    plugins: [react()],
    server: {
      proxy: {
        "/apply": {
          target: "http://localhost:8787",
          changeOrigin: true,
        },
        "/drafts": {
          target: "http://localhost:8787",
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
