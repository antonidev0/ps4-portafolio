// Premios: huesos y galletas. Solo lógica (los modelos 3D están en three/foodModels.js).
import { cellKey } from './gameLogic';

export const PRIZES = {
  bone: { label: 'Hueso', points: 10 },
  cookie: { label: 'Galleta', points: 25 },
};

export function pickPrizeType(rng) {
  return rng() < 0.68 ? 'bone' : 'cookie';
}

/** Casillas donde puede aparecer un premio: sin obstáculos, sin perro y sin otro premio. */
export function freeCells({ cols, rows, obstacleSet, snake, foods = [] }) {
  const blocked = new Set(obstacleSet);
  for (const s of snake.segments) blocked.add(cellKey(s.x, s.y, cols));
  for (const f of foods) blocked.add(cellKey(f.x, f.y, cols));
  const out = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) if (!blocked.has(cellKey(x, y, cols))) out.push({ x, y });
  }
  return out;
}

/**
 * Elige una casilla libre al azar. Si no queda ninguna devuelve null
 * (no se reintenta en bucle: se recorre la lista de libres una sola vez).
 */
export function spawnPrize({ cols, rows, obstacleSet, snake, foods, rng, id }) {
  const cells = freeCells({ cols, rows, obstacleSet, snake, foods });
  if (!cells.length) return null;
  // Evita, si es posible, que el premio aparezca pegado a la cabeza
  const head = snake.segments[0];
  const far = cells.filter((c) => Math.abs(c.x - head.x) + Math.abs(c.y - head.y) > 2);
  const pool = far.length ? far : cells;
  const cell = pool[Math.floor(rng() * pool.length)];
  return { id, x: cell.x, y: cell.y, type: pickPrizeType(rng) };
}
