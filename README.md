# PS4 Exploit Host 9.00

Interfaz web estilo PS4 (React + Vite + Tailwind) para servir payloads y herramientas
para firmware 9.00. Incluye pantalla de inicio tipo PS4, envío simulado de payloads,
toggles de herramientas, información del sistema, guía y créditos.

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

## Notas

- El envío de payloads es **simulado** (UI); no hay backend.
- Gestor de paquetes: **pnpm** (`pnpm-lock.yaml`). Se ignoran `package-lock.json` y `yarn.lock`.
