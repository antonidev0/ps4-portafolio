// Secciones del portafolio. Cada una es una tarjeta del menú y una página en /<id>.
// Para añadir, quitar o reordenar secciones, edita solo este archivo.
//
// Los textos se escriben en los tres idiomas: { es: "…", en: "…", it: "…" }.
// Si un texto es igual en todos (un nombre, una URL, "GitHub"), basta con un texto simple.
// Si falta una traducción, se muestra el español.
//
// Campos:
//   id           identificador único; también es la ruta (/sobre-mi, /proyectos…)
//   titulo       texto grande que aparece al seleccionar la tarjeta y en la página
//   Icono        componente de ../icons/iconos (para tarjetas con icono)
//   imagen       ruta a una portada en public/ (opcional; reemplaza al icono)
//   color        fondo de la tarjeta (color o degradado CSS; opcional)
//   descripcion  párrafo de introducción de la página
//   items        lista de bloques { titulo, texto?, etiquetas?: [], enlace?: { texto, url } }
//                (con varios enlaces: enlaces: [{ texto, url }, …]; url también puede
//                cambiar según el idioma: { es, en, it })
//                Los PDF y otros documentos van en public/documentos/
//   tipo         "ajustes" para la página de ajustes (no usa items)
//   ruta         si existe, la tarjeta abre esa ruta en lugar de una página de sección
//                (se usa para los juegos y apps integrados)

import {
  IconoAjustes,
  IconoCodigo,
  IconoCorreo,
  IconoMaletin,
  IconoMando,
  IconoPersona,
  IconoProyectos,
} from "../icons/iconos";

const VER_CODIGO = { es: "Ver código", en: "View code", it: "Vedi il codice" };

export const secciones = [
  {
    id: "sobre-mi",
    titulo: { es: "Sobre mí", en: "About me", it: "Chi sono" },
    Icono: IconoPersona,
    color: "linear-gradient(160deg, #1d5be0, #06257a)",
    descripcion: {
      es: "Soy Antoni, desarrollador frontend en React y JavaScript. Me encanta crear experiencias interactivas que se sienten vivas, desde juegos en 3D hasta interfaces inspiradas en consolas como este portafolio. Disfruto los proyectos donde el diseño, la animación y el código se juntan para sorprender.",
      en: "I'm Antoni, a frontend developer working with React and JavaScript. I love building interactive experiences that feel alive, from 3D games to console-inspired interfaces like this portfolio. I enjoy projects where design, animation and code come together to surprise people.",
      it: "Sono Antoni, sviluppatore frontend con React e JavaScript. Amo creare esperienze interattive che sembrano vive, dai giochi in 3D alle interfacce ispirate alle console come questo portfolio. Mi piacciono i progetti in cui design, animazione e codice si uniscono per sorprendere.",
    },
    items: [
      {
        titulo: { es: "Ubicación", en: "Location", it: "Dove mi trovo" },
        texto: {
          es: "Italia · Originario de Venezuela",
          en: "Italy · Originally from Venezuela",
          it: "Italia · Originario del Venezuela",
        },
      },
      {
        titulo: { es: "Intereses", en: "Interests", it: "Interessi" },
        texto: {
          es: "Desarrollo web, videojuegos y redes sociales",
          en: "Web development, video games and social media",
          it: "Sviluppo web, videogiochi e social network",
        },
      },
    ],
  },
  {
    id: "proyectos",
    titulo: { es: "Proyectos", en: "Projects", it: "Progetti" },
    Icono: IconoProyectos,
    descripcion: {
      es: "Una selección de cosas que he construido.",
      en: "A selection of things I've built.",
      it: "Una selezione di cose che ho realizzato.",
    },
    items: [
      {
        titulo: {
          es: "Portafolio estilo PS4",
          en: "PS4-style portfolio",
          it: "Portfolio in stile PS4",
        },
        texto: {
          es: "Este mismo sitio: un menú de tarjetas navegable con teclado, ratón y gestos táctiles.",
          en: "This very site: a card menu you can browse with the keyboard, mouse or touch gestures.",
          it: "Questo stesso sito: un menu a schede navigabile con tastiera, mouse e gesti touch.",
        },
        etiquetas: ["React", "Vite", "Tailwind CSS", "React Router", "Zustand"],
        enlace: { texto: VER_CODIGO, url: "https://github.com/antonidev0/ps4-portafolio" },
      },
      {
        titulo: "Dachshund 3D",
        texto: {
          es: "Un Snake en 3D protagonizado por un perro salchicha, con tres niveles y modo infinito. Se juega desde su tarjeta en el menú.",
          en: "A 3D Snake game starring a dachshund, with three levels and an endless mode. You can play it from its card in the menu.",
          it: "Uno Snake in 3D con protagonista un bassotto, con tre livelli e una modalità infinita. Si gioca dalla sua scheda nel menu.",
        },
        etiquetas: ["React", "Three.js", "Web Audio API", "Vitest"],
        enlace: { texto: VER_CODIGO, url: "https://github.com/antonidev0/dachshund-3d" },
      },
      {
        titulo: "Flappy Dog",
        texto: {
          es: "Mi versión de Flappy Bird protagonizada por un perro, hecha para practicar lógica de juego en el navegador.",
          en: "My take on Flappy Bird starring a dog, built to practice game logic in the browser.",
          it: "La mia versione di Flappy Bird con protagonista un cane, creata per esercitarmi con la logica di gioco nel browser.",
        },
        etiquetas: ["JavaScript"],
        enlace: { texto: VER_CODIGO, url: "https://github.com/antonidev0/flappydog" },
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
    titulo: { es: "Habilidades", en: "Skills", it: "Competenze" },
    Icono: IconoCodigo,
    descripcion: {
      es: "Tecnologías y herramientas con las que trabajo.",
      en: "Technologies and tools I work with.",
      it: "Tecnologie e strumenti con cui lavoro.",
    },
    items: [
      {
        titulo: "Frontend",
        etiquetas: [
          "JavaScript",
          "TypeScript",
          "React",
          "React Router",
          "Tailwind CSS",
          "HTML",
          "CSS",
          "Three.js",
        ],
      },
      {
        titulo: "Backend",
        etiquetas: ["Node.js", "Express", "SQL"],
      },
      {
        titulo: { es: "Herramientas", en: "Tools", it: "Strumenti" },
        etiquetas: ["Git", "GitHub", "Vite", "pnpm", "Vitest", "Docker", "CI/CD"],
      },
    ],
  },
  {
    id: "experiencia",
    titulo: { es: "Experiencia", en: "Experience", it: "Esperienza" },
    Icono: IconoMaletin,
    descripcion: {
      es: "Formación y proyectos que me han hecho crecer como desarrollador.",
      en: "Training and projects that have helped me grow as a developer.",
      it: "Formazione e progetti che mi hanno fatto crescere come sviluppatore.",
    },
    items: [
      {
        titulo: "JSCamp Bootcamp · Full Stack",
        texto: {
          es: "Programa de Desarrollo Full Stack (octubre 2025 – julio 2026). Completé los 13 proyectos finales: HTML, CSS, JavaScript, React, React Router, Node.js con Express, testing, TypeScript, SQL, CI/CD, Docker e IA.",
          en: "Full Stack Development Program (October 2025 – July 2026). I completed all 13 final projects: HTML, CSS, JavaScript, React, React Router, Node.js with Express, testing, TypeScript, SQL, CI/CD, Docker and AI.",
          it: "Programma di Sviluppo Full Stack (ottobre 2025 – luglio 2026). Ho completato tutti i 13 progetti finali: HTML, CSS, JavaScript, React, React Router, Node.js con Express, testing, TypeScript, SQL, CI/CD, Docker e IA.",
        },
        enlaces: [
          {
            texto: { es: "Ver certificado", en: "View certificate", it: "Vedi il certificato" },
            url: "/documentos/certificado-jscamp.pdf",
          },
          {
            texto: {
              es: "Carta de recomendación",
              en: "Recommendation letter",
              it: "Lettera di referenze",
            },
            // La carta existe en español e inglés; en italiano se abre la inglesa
            url: {
              es: "/documentos/carta-recomendacion-es.pdf",
              en: "/documentos/carta-recomendacion-en.pdf",
              it: "/documentos/carta-recomendacion-en.pdf",
            },
          },
          {
            texto: {
              es: "Verificar en JSCamp",
              en: "Verify on JSCamp",
              it: "Verifica su JSCamp",
            },
            url: "https://certificados.jscamp.dev/040ba557-7f20-4dc8-8f4c-3d84c6bc181c.pdf",
          },
          {
            texto: { es: "Ver repositorio", en: "View repository", it: "Vedi il repository" },
            url: "https://github.com/antonidev0/jscamp-bootcamp",
          },
        ],
      },
    ],
  },
  {
    id: "contacto",
    titulo: { es: "Contacto", en: "Contact", it: "Contatti" },
    Icono: IconoCorreo,
    descripcion: {
      es: "¿Hablamos? Puedes encontrarme aquí:",
      en: "Let's talk! You can find me here:",
      it: "Parliamone! Puoi trovarmi qui:",
    },
    items: [
      {
        titulo: "GitHub",
        enlace: { texto: "github.com/antonidev0", url: "https://github.com/antonidev0" },
      },
      {
        titulo: { es: "Correo", en: "Email", it: "Email" },
        enlace: { texto: "antonibogado43@gmail.com", url: "mailto:antonibogado43@gmail.com" },
      },
    ],
  },
  {
    id: "ajustes",
    titulo: { es: "Ajustes", en: "Settings", it: "Impostazioni" },
    Icono: IconoAjustes,
    tipo: "ajustes",
    descripcion: {
      es: "Personaliza el portafolio. Se guarda en este navegador.",
      en: "Customize the portfolio. Your choices are saved in this browser.",
      it: "Personalizza il portfolio. Le scelte vengono salvate in questo browser.",
    },
  },
];

// Las tarjetas con ruta propia no tienen página de sección
export const buscarSeccion = (id) => secciones.find((s) => s.id === id && !s.ruta);
