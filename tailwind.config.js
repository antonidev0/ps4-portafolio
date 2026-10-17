/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Noto Sans", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
        marca: ["Lexend Exa", "Noto Sans", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        // Curva de las transiciones del menú (rápida al inicio, suave al final)
        ps: "cubic-bezier(.2,.8,.2,1)",
      },
      keyframes: {
        aparece: { from: { opacity: "0" } },
        respira: { "50%": { opacity: ".45" } },
        "titulo-entra": { from: { opacity: "0", transform: "translateX(-12px)" } },
        "menu-crece": {
          from: { opacity: "0", transform: "scale(.72)" },
          "60%": { opacity: "1" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "sube-suave": { from: { opacity: "0", transform: "translateY(12px)" } },
        // Al abrir un juego: aparece desde el centro, como al lanzar un juego en la consola
        "abre-juego": {
          from: { opacity: "0", transform: "scale(.6)", filter: "blur(8px)" },
          to: { opacity: "1", transform: "scale(1)", filter: "blur(0)" },
        },
      },
      animation: {
        aparece: "aparece 1.2s ease both",
        respira: "respira 2.6s ease-in-out 1.2s infinite",
        "titulo-entra": "titulo-entra .4s ease both",
        "menu-crece": "menu-crece 1s cubic-bezier(.2,.8,.2,1) .15s both",
        "sube-suave": "sube-suave .35s ease both",
        "abre-juego": "abre-juego .6s cubic-bezier(.2,.8,.2,1) both",
      },
    },
  },
  plugins: [],
};
