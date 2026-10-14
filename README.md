# PS4 Home (vista web)

Vista del home de PlayStation 4 en el navegador, construida con React + Vite + Tailwind. Incluye fondo animado, música de fondo con control y un menú horizontal de tarjetas estilo consola.

## Stack

- React 19
- Vite 8 (rolldown)
- Tailwind CSS 3
- Oxlint

## Requisitos

- Node.js >= 20
- pnpm >= 10 (gestor de paquetes del proyecto; no usar npm/yarn)

## Uso

```bash
pnpm install
pnpm dev
```

Comandos disponibles:

- `pnpm dev` — servidor de desarrollo con HMR.
- `pnpm build` — build de producción en `dist/`.
- `pnpm preview` — vista previa del build.
- `pnpm lint` — linting con oxlint.

## Estructura relevante

- `src/components/Fondo/OndasFondo.jsx`: fondo animado (ondas/partículas).
- `src/components/audioFondo/AudioFondo.jsx`: audio de fondo con fade y botón de mute.
- `src/components/TarjetasMenu/TarjetasMenu.jsx`: menú horizontal de tarjetas.
- `src/components/HomeScreen.jsx`: pantalla principal del home.
- `public/audio/intro-ps4.mp3`: pista de música.

## Notas

- Gestor de paquetes: **pnpm** (`pnpm-lock.yaml`). Se ignoran `package-lock.json` y `yarn.lock`.
- La música inicia tras la primera interacción del usuario por restricciones del navegador.
