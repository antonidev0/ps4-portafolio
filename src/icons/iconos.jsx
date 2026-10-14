// Iconos de línea en SVG. Heredan el color del texto (currentColor),
// así que se ven blancos dentro de las tarjetas y se pueden reutilizar en cualquier sitio.
//
// Uso: import { IconoTienda } from "../icons/iconos";
//      <IconoTienda />            o con props: <IconoTienda width={32} />

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

export const IconoInicio = (p) => (
  <Base {...p}><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /></Base>
);

export const IconoTienda = (p) => (
  <Base {...p}><path d="M5 8h14l-1 12H6z" /><path d="M9 8a3 3 0 0 1 6 0" /></Base>
);

export const IconoBiblioteca = (p) => (
  <Base {...p}>
    <rect x="3" y="3" width="8" height="8" /><rect x="13" y="3" width="8" height="8" />
    <rect x="3" y="13" width="8" height="8" /><rect x="13" y="13" width="8" height="8" />
  </Base>
);

export const IconoGaleria = (p) => (
  <Base {...p}><rect x="3" y="5" width="18" height="14" /><path d="m3 16 5-5 4 4 3-3 6 6" /></Base>
);

export const IconoTV = (p) => (
  <Base {...p}><rect x="3" y="5" width="18" height="12" /><path d="M9 20h6" /></Base>
);

export const IconoWeb = (p) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </Base>
);

export const IconoMusica = (p) => (
  <Base {...p}>
    <path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" />
  </Base>
);

export const IconoAjustes = (p) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
  </Base>
);
