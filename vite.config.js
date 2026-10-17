import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import htmlPorIdioma from "./scripts/htmlPorIdioma.js";

// https://vite.dev/config/
export default defineConfig({
  // htmlPorIdioma: una página HTML por idioma (/, /en/, /it/) para buscadores y redes sociales
  plugins: [react(), htmlPorIdioma()],
  // El juego (Three.js) va en su propio chunk de ~700 kB que solo se descarga al abrirlo
  build: { chunkSizeWarningLimit: 1000 },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    css: false,
  },
});
