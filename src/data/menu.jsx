// Lista de tarjetas del menú. Para añadir, quitar o reordenar tarjetas, edita solo este archivo.
//
// Campos de cada tarjeta:
//   id        identificador único (obligatorio)
//   titulo    texto grande que aparece al seleccionarla
//   icono     un icono de ../icons/iconos  (para tarjetas de sistema)
//   imagen    ruta a una portada en public/ (para juegos; reemplaza al icono)
//   etiqueta  texto pequeño dentro de la tarjeta cuando no está seleccionada
//   color     fondo de la tarjeta (color o degradado CSS)

import {
  IconoTienda,
  IconoInicio,
  IconoBiblioteca,
  IconoGaleria,
  IconoTV,
  IconoWeb,
  IconoMusica,
  IconoAjustes,
} from "../icons/iconos";

export const menu = [
  {
    id: "tienda",
    titulo: "Tienda",
    icono: <IconoTienda />,
    etiqueta: "Tienda",
    color: "linear-gradient(160deg, #1d5be0, #06257a)",
  },
  { id: "novedades", titulo: "Novedades", icono: <IconoInicio /> },
  { id: "biblioteca", titulo: "Biblioteca", icono: <IconoBiblioteca /> },
  { id: "galeria", titulo: "Galería", icono: <IconoGaleria /> },
  { id: "tv", titulo: "TV y vídeo", icono: <IconoTV /> },
  { id: "web", titulo: "Navegador", icono: <IconoWeb /> },
  { id: "musica", titulo: "Música", icono: <IconoMusica /> },
  { id: "ajustes", titulo: "Ajustes", icono: <IconoAjustes /> },

  // Ejemplo de tarjeta con portada (pon la imagen en public/portadas/):
  // { id: "juego1", titulo: "Mi juego", imagen: "/portadas/juego1.jpg" },
];
