// Configuración de los tres niveles normales.
// Para cambiar tamaños, velocidades u obstáculos basta con editar este archivo.
import { rect } from './obstacles';

export const LEVELS = [
  {
    id: 1,
    name: 'Neon Park',
    difficulty: 'Fácil',
    description: 'Un parque limpio bajo luces azules. Ideal para aprender a moverte.',
    target: 10,
    cols: 20,
    rows: 14,
    tickMs: 185,
    minTickMs: 185,
    tickStep: 0,
    scoreMultiplier: 1,
    theme: 'park',
    start: { x: 4, y: 7, dir: 'right', length: 3 },
    tutorial: true,
    obstacles: () => [],
    dynamicObstacles: [],
  },
  {
    id: 2,
    name: 'Cyber Garden',
    difficulty: 'Media',
    description: 'Un jardín de cristal violeta con setos que tendrás que esquivar.',
    target: 15,
    cols: 18,
    rows: 13,
    tickMs: 150,
    minTickMs: 136,
    tickStep: 1,
    scoreMultiplier: 1.5,
    theme: 'garden',
    start: { x: 3, y: 6, dir: 'right', length: 3 },
    obstacles: () => [
      ...rect(5, 2, 3, 1),
      ...rect(10, 2, 3, 1),
      ...rect(5, 10, 3, 1),
      ...rect(10, 10, 3, 1),
      ...rect(11, 5, 2, 3),
      ...rect(15, 3, 1, 2),
      ...rect(15, 8, 1, 2),
      { x: 2, y: 2 },
      { x: 2, y: 10 },
    ],
    dynamicObstacles: [],
  },
  {
    id: 3,
    name: 'Neon Core',
    difficulty: 'Difícil',
    description: 'El núcleo de energía. Más rápido, más estrecho y cada vez más exigente.',
    target: 20,
    cols: 20,
    rows: 14,
    tickMs: 132,
    minTickMs: 96,
    tickStep: 2,
    scoreMultiplier: 2,
    theme: 'core',
    start: { x: 3, y: 4, dir: 'right', length: 3 },
    obstacles: () => [
      ...rect(5, 2, 3, 1),
      ...rect(12, 2, 3, 1),
      ...rect(5, 11, 4, 1),
      ...rect(12, 11, 3, 1),
      ...rect(9, 6, 2, 2),
      ...rect(2, 8, 1, 3),
      ...rect(17, 3, 1, 3),
      ...rect(17, 8, 1, 3),
      ...rect(6, 7, 1, 2),
      ...rect(13, 6, 1, 2),
    ],
    // Progresión durante la partida: al llegar a estos premios aparecen obstáculos nuevos
    dynamicObstacles: [
      { atProgress: 8, count: 2 },
      { atProgress: 14, count: 3 },
    ],
  },
];

export const getLevel = (id) => LEVELS.find((l) => l.id === id) ?? LEVELS[0];

// Velocidad de referencia para mostrar "x1.00" en el HUD
export const BASE_TICK_MS = 185;
