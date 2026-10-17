// Textos para buscadores y redes sociales, uno por idioma.
// Los usa la app (título de la pestaña y descripción) y también vite.config.js,
// que genera dist/en/index.html y dist/it/index.html con estas metaetiquetas
// para que Google, WhatsApp o LinkedIn vean cada idioma sin ejecutar JavaScript.
// Este archivo no puede importar nada de React: lo lee Node al compilar.

export const URL_SITIO = "https://ps4-portafolio.vercel.app";

export const SEO = {
  es: {
    locale: "es_ES",
    nombreSitio: "Portafolio ToniDev",
    titulo: "Portafolio ToniDev | Desarrollador Frontend React",
    descripcion:
      "Portafolio de Antoni (ToniDev), desarrollador frontend en React y JavaScript. Proyectos interactivos, juegos en 3D con Three.js y una interfaz inspirada en la PS4.",
    descripcionCorta: "Proyectos interactivos, juegos en 3D y una interfaz inspirada en la PS4.",
    imagen: "/og-image.png",
    noscript:
      "Portafolio de Antoni (ToniDev), desarrollador frontend en React. Activa JavaScript para verlo.",
  },
  en: {
    locale: "en_US",
    nombreSitio: "ToniDev Portfolio",
    titulo: "ToniDev Portfolio | React Frontend Developer",
    descripcion:
      "Portfolio of Antoni (ToniDev), a frontend developer working with React and JavaScript. Interactive projects, 3D games built with Three.js and a PS4-inspired interface.",
    descripcionCorta: "Interactive projects, 3D games and a PS4-inspired interface.",
    imagen: "/og-image-en.png",
    noscript:
      "Portfolio of Antoni (ToniDev), a React frontend developer. Please enable JavaScript to view it.",
  },
  it: {
    locale: "it_IT",
    nombreSitio: "Portfolio ToniDev",
    titulo: "Portfolio ToniDev | Sviluppatore Frontend React",
    descripcion:
      "Portfolio di Antoni (ToniDev), sviluppatore frontend con React e JavaScript. Progetti interattivi, giochi in 3D con Three.js e un'interfaccia ispirata alla PS4.",
    descripcionCorta: "Progetti interattivi, giochi in 3D e un'interfaccia ispirata alla PS4.",
    imagen: "/og-image-it.png",
    noscript:
      "Portfolio di Antoni (ToniDev), sviluppatore frontend React. Attiva JavaScript per vederlo.",
  },
};
