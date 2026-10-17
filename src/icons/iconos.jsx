// Iconos de línea en SVG. Heredan el color del texto (currentColor),
// así que se ven blancos dentro de las tarjetas y se pueden reutilizar en cualquier sitio.
//
// Uso: import { IconoPersona } from "../icons/iconos";
//      <IconoPersona />            o con props: <IconoPersona width={32} />

function Base({ children, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconoPersona = (p) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </Base>
);

export const IconoProyectos = (p) => (
  <Base {...p}>
    <rect x="3" y="3" width="8" height="8" />
    <rect x="13" y="3" width="8" height="8" />
    <rect x="3" y="13" width="8" height="8" />
    <rect x="13" y="13" width="8" height="8" />
  </Base>
);

export const IconoCodigo = (p) => (
  <Base {...p}>
    <path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />
  </Base>
);

export const IconoMaletin = (p) => (
  <Base {...p}>
    <rect x="3" y="7" width="18" height="13" rx="1" />
    <path d="M9 7V4h6v3M3 13h18" />
  </Base>
);

export const IconoCorreo = (p) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="14" rx="1" />
    <path d="m3 7 9 6 9-6" />
  </Base>
);

export const IconoAjustes = (p) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
  </Base>
);

export const IconoMando = (p) => (
  <Base {...p}>
    <path d="M7 8h10a4 4 0 0 1 4 4v3.5a2.5 2.5 0 0 1-4.6 1.4L15 15H9l-1.4 1.9A2.5 2.5 0 0 1 3 15.5V12a4 4 0 0 1 4-4z" />
    <path d="M8 11v3M6.5 12.5h3" />
    <circle cx="15.5" cy="11.5" r=".6" fill="currentColor" />
    <circle cx="17.5" cy="13.5" r=".6" fill="currentColor" />
  </Base>
);

export const IconoAtras = (p) => (
  <Base {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Base>
);
