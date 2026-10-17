# Portafolio ToniDev

Portafolio personal con la estética del menú de inicio de una consola: pantalla de bienvenida, fondo animado y un menú horizontal de tarjetas que se navega con teclado, ratón o gestos táctiles. Cada tarjeta abre una sección (sobre mí, proyectos, habilidades, experiencia, contacto y ajustes) o un juego integrado, como Dachshund 3D, que se abre a pantalla completa.

## Stack

- React 19
- Vite 8
- React Router 8 (rutas)
- Zustand 5 (estado global, con el tema y el idioma guardados en `localStorage`)
- Tailwind CSS 3
- Three.js (solo en el juego Dachshund 3D, cargado bajo demanda)
- Oxlint, Prettier y Vitest con Testing Library

## Requisitos

- Node.js >= 20
- pnpm >= 10 (gestor de paquetes del proyecto; no usar npm/yarn)

## Uso

```bash
pnpm install
pnpm dev
```

Comandos disponibles:

- `pnpm dev`: servidor de desarrollo con HMR.
- `pnpm build`: build de producción en `dist/`.
- `pnpm preview`: vista previa del build.
- `pnpm lint`: linting con oxlint.
- `pnpm format` / `pnpm format:check`: formatear o comprobar el formato con Prettier.
- `pnpm test`: tests con Vitest.

## Idiomas

El portafolio está en español, inglés e italiano. La primera vez se elige según el idioma del navegador (español si no coincide ninguno), y después se puede cambiar con los botones ES · EN · IT de la bienvenida y el menú, o desde Ajustes. La elección se guarda en el navegador.

- Textos de la interfaz: `src/i18n/textos.js`.
- Textos de las secciones: `src/data/secciones.js`, escritos como `{ es: "…", en: "…", it: "…" }`.
- Para añadir otro idioma: añádelo en `src/i18n/idiomas.js` y sus textos en los dos archivos anteriores. Lo que no esté traducido se muestra en español.
- El juego Dachshund 3D solo está en español.

## Rutas

| Ruta                   | Página                                 |
| ---------------------- | -------------------------------------- |
| `/`                    | Pantalla de bienvenida                 |
| `/menu`                | Menú de tarjetas                       |
| `/juegos/dachshund-3d` | Juego Dachshund 3D a pantalla completa |
| `/:seccionId`          | Sección (`/sobre-mi`, `/proyectos`, …) |
| otra                   | Página no encontrada                   |

## Estructura

```
src/
  main.jsx                   arranque y router
  routes.jsx                 definición de rutas
  data/secciones.js          contenido del portafolio (edita aquí tus textos)
  store/useAppStore.js       estado global (tema, idioma y tarjeta seleccionada)
  i18n/                      idiomas disponibles, textos de la interfaz y hook useIdioma
  pages/                     una página por ruta
  components/
    Layout.jsx               fondo común + página actual
    Fondo/                   fondo animado en canvas y sus temas
    PantallaBienvenida/      pantalla inicial
    TarjetasMenu/            menú de tarjetas
  hooks/useAnchoVentana.js   ancho de ventana para adaptar el menú
  icons/iconos.jsx           iconos SVG
  apps/dachshund-3d/         copia del juego Dachshund 3D (ver su README)
```

Los estilos están en Tailwind dentro de cada componente; animaciones y fuentes se definen en `tailwind.config.js`. Solo los valores que se calculan en tiempo de ejecución (tamaño de las tarjetas, desplazamiento de la fila) van en `style`.

## Notas

- Para cambiar el contenido, edita `src/data/secciones.js`. Los textos entre `[corchetes]` son de ejemplo.
- Para añadir otro juego o app: copia su código en `src/apps/<nombre>/`, crea su página en `src/pages/`, añade la ruta (con `lazy` y `handle: { sinFondo: true }`) en `src/routes.jsx` y una tarjeta con `ruta` en `src/data/secciones.js`.
- El portafolio no incluye archivos de audio. Los sonidos de Dachshund 3D se generan por código con la Web Audio API. Si añades música o sonidos, usa archivos propios o con licencia libre.
- Al desplegar, configura el servidor para que todas las rutas sirvan `index.html` (necesario para React Router).
