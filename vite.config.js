import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // El juego (Three.js) va en su propio chunk de ~700 kB que solo se descarga al abrirlo
  build: { chunkSizeWarningLimit: 1000 },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    css: false,
  },
});
