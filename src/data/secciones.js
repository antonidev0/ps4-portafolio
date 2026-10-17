// Secciones del portafolio. Cada una es una tarjeta del menú y una página en /<id>.
// Para añadir, quitar o reordenar secciones, edita solo este archivo.
//
// Campos:
//   id           identificador único; también es la ruta (/sobre-mi, /proyectos…)
//   titulo       texto grande que aparece al seleccionar la tarjeta y en la página
//   Icono        componente de ../icons/iconos (para tarjetas con icono)
//   imagen       ruta a una portada en public/ (opcional; reemplaza al icono)
//   color        fondo de la tarjeta (color o degradado CSS; opcional)
//   descripcion  párrafo de introducción de la página
//   items        lista de bloques { titulo, texto?, etiquetas?: [], enlace?: { texto, url } }
//   tipo         "ajustes" para la página de ajustes (no usa items)
//   ruta         si existe, la tarjeta abre esa ruta en lugar de una página de sección
//                (se usa para los juegos y apps integrados)
//
// Los textos entre [corchetes] son de ejemplo: sustitúyelos por los tuyos.

import {
  IconoAjustes,
  IconoCodigo,
  IconoCorreo,
  IconoMaletin,
  IconoMando,
  IconoPersona,
  IconoProyectos,
} from "../icons/iconos";

export const secciones = [
  {
    id: "sobre-mi",
    titulo: "Sobre mí",
    Icono: IconoPersona,
    color: "linear-gradient(160deg, #1d5be0, #06257a)",
    descripcion:
      "[Preséntate en dos o tres frases: quién eres, a qué te dedicas y qué tipo de proyectos te gustan.]",
    items: [
      { titulo: "Ubicación", texto: "[Tu ciudad o país]" },
      { titulo: "Intereses", texto: "[Desarrollo web, interfaces, videojuegos…]" },
    ],
  },
  {
    id: "proyectos",
    titulo: "Proyectos",
    Icono: IconoProyectos,
    descripcion: "Una selección de cosas que he construido.",
    items: [
      {
        titulo: "Portafolio estilo PS4",
        texto:
          "Este mismo sitio: un menú de tarjetas navegable con teclado, ratón y gestos táctiles.",
        etiquetas: ["React", "Vite", "Tailwind CSS", "React Router", "Zustand"],
        enlace: { texto: "Ver código", url: "https://github.com/antonidev0/ps4-portafolio" },
      },
      {
        titulo: "Dachshund 3D",
        texto:
          "Un Snake en 3D protagonizado por un perro salchicha, con tres niveles y modo infinito. Se juega desde su tarjeta en el menú.",
        etiquetas: ["React", "Three.js", "Web Audio API", "Vitest"],
        enlace: { texto: "Ver código", url: "https://github.com/antonidev0/dachshund-3d" },
      },
      {
        titulo: "[Otro proyecto]",
        texto: "[Qué hace, qué problema resuelve y qué aprendiste.]",
        etiquetas: ["[Tecnología]"],
      },
    ],
  },
  {
    id: "dachshund-3d",
    titulo: "Dachshund 3D",
    Icono: IconoMando,
    color: "linear-gradient(160deg, #9a5cff, #1e3a9e 55%, #030814)",
    ruta: "/juegos/dachshund-3d",
  },
  {
    id: "habilidades",
    titulo: "Habilidades",
    Icono: IconoCodigo,
    descripcion: "Tecnologías y herramientas con las que trabajo.",
    items: [
      { titulo: "Frontend", etiquetas: ["JavaScript", "React", "Tailwind CSS", "HTML", "CSS"] },
      { titulo: "Herramientas", etiquetas: ["Git", "Vite", "pnpm"] },
    ],
  },
  {
    id: "experiencia",
    titulo: "Experiencia",
    Icono: IconoMaletin,
    descripcion: "[Trabajos, prácticas, formación o proyectos destacados.]",
    items: [{ titulo: "[Puesto · Empresa]", texto: "[Fechas y una línea sobre lo que hiciste.]" }],
  },
  {
    id: "contacto",
    titulo: "Contacto",
    Icono: IconoCorreo,
    descripcion: "¿Hablamos? Puedes encontrarme aquí:",
    items: [
      {
        titulo: "GitHub",
        enlace: { texto: "github.com/antonidev0", url: "https://github.com/antonidev0" },
      },
      {
        titulo: "Correo",
        enlace: { texto: "[tu-correo@ejemplo.com]", url: "mailto:tu-correo@ejemplo.com" },
      },
    ],
  },
  {
    id: "ajustes",
    titulo: "Ajustes",
    Icono: IconoAjustes,
    tipo: "ajustes",
    descripcion: "Personaliza el aspecto del portafolio. Se guarda en este navegador.",
  },
];

// Las tarjetas con ruta propia no tienen página de sección
export const buscarSeccion = (id) => secciones.find((s) => s.id === id && !s.ruta);
