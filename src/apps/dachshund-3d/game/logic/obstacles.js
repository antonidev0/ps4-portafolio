// Obstáculos: diseño de niveles, validación y generación procedimental.
import { DIRS, cellKey } from './gameLogic';
import { randInt, pick } from './rng';

export function rect(x, y, w, h) {
  const cells = [];
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) cells.push({ x: x + i, y: y + j });
  return cells;
}

export function toKeySet(cells, cols) {
  const set = new Set();
  for (const c of cells) set.add(cellKey(c.x, c.y, cols));
  return set;
}

/**
 * Zona de salida que nunca se ocupa: la fila de salida y sus vecinas,
 * desde detrás de la cola hasta varias casillas por delante de la cabeza.
 */
export function startSafeZone(start, cols, rows, ahead = 6) {
  const set = new Set();
  const d = DIRS[start.dir];
  const len = start.length ?? 3;
  for (let k = -(len + 1); k <= ahead; k++) {
    for (let side = -1; side <= 1; side++) {
      const x = start.x + d.x * k + (d.y !== 0 ? side : 0);
      const y = start.y + d.y * k + (d.x !== 0 ? side : 0);
      if (x >= 0 && y >= 0 && x < cols && y < rows) set.add(cellKey(x, y, cols));
    }
  }
  return set;
}

function freeNeighbours(x, y, cols, rows, blocked) {
  let n = 0;
  for (const d of Object.values(DIRS)) {
    const nx = x + d.x;
    const ny = y + d.y;
    if (nx >= 0 && ny >= 0 && nx < cols && ny < rows && !blocked.has(cellKey(nx, ny, cols))) n++;
  }
  return n;
}

/**
 * Un tablero es válido si:
 *  - todas las casillas libres están conectadas con la salida (no hay premios inalcanzables),
 *  - ninguna casilla libre es un callejón sin salida (al menos 2 vecinas libres),
 *  - la zona de salida está despejada.
 */
export function isLayoutValid(cols, rows, obstacleSet, start) {
  const safe = startSafeZone(start, cols, rows);
  for (const k of safe) if (obstacleSet.has(k)) return false;

  let freeCount = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (obstacleSet.has(cellKey(x, y, cols))) continue;
      freeCount++;
      if (freeNeighbours(x, y, cols, rows, obstacleSet) < 2) return false;
    }
  }

  const startKey = cellKey(start.x, start.y, cols);
  const seen = new Set([startKey]);
  const stack = [{ x: start.x, y: start.y }];
  while (stack.length) {
    const c = stack.pop();
    for (const d of Object.values(DIRS)) {
      const nx = c.x + d.x;
      const ny = c.y + d.y;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      const k = cellKey(nx, ny, cols);
      if (seen.has(k) || obstacleSet.has(k)) continue;
      seen.add(k);
      stack.push({ x: nx, y: ny });
    }
  }
  return seen.size === freeCount;
}

/** Elimina celdas fuera del tablero, duplicadas o dentro de la zona de salida. */
export function sanitizeLayout(cells, cols, rows, start) {
  const safe = startSafeZone(start, cols, rows);
  const out = [];
  const seen = new Set();
  for (const c of cells) {
    if (c.x < 0 || c.y < 0 || c.x >= cols || c.y >= rows) continue;
    const k = cellKey(c.x, c.y, cols);
    if (seen.has(k) || safe.has(k)) continue;
    seen.add(k);
    out.push({ x: c.x, y: c.y });
  }
  return out;
}

const SHAPES = [
  [[0, 0]],
  [[0, 0], [1, 0]],
  [[0, 0], [0, 1]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [1, 0], [0, 1]],
  [[0, 0], [1, 0], [1, 1], [0, 1]],
];

/**
 * Coloca bloques aleatorios uno a uno y descarta los que invalidan el tablero.
 * El número de intentos está limitado, así que nunca entra en un bucle infinito:
 * si no cabe más, devuelve menos celdas de las pedidas.
 */
export function generateRandomObstacles({ cols, rows, count, start, rng, maxAttempts = 400 }) {
  const cells = [];
  const set = new Set();
  const safe = startSafeZone(start, cols, rows, 7);
  let attempts = 0;
  while (cells.length < count && attempts < maxAttempts) {
    attempts++;
    const shape = pick(rng, SHAPES);
    // Margen de 1 casilla con los bordes para no crear pasillos pegados a la pared
    const ox = randInt(rng, 1, cols - 3);
    const oy = randInt(rng, 1, rows - 3);
    const candidate = [];
    let ok = true;
    for (const [dx, dy] of shape) {
      const x = ox + dx;
      const y = oy + dy;
      const k = cellKey(x, y, cols);
      if (x < 1 || y < 1 || x >= cols - 1 || y >= rows - 1 || set.has(k) || safe.has(k)) {
        ok = false;
        break;
      }
      candidate.push({ x, y, k });
    }
    if (!ok || cells.length + candidate.length > count) continue;
    candidate.forEach((c) => set.add(c.k));
    if (isLayoutValid(cols, rows, set, start)) {
      candidate.forEach((c) => cells.push({ x: c.x, y: c.y }));
    } else {
      candidate.forEach((c) => set.delete(c.k));
    }
  }
  return cells;
}

/**
 * Añade obstáculos durante la partida (Nivel 3) lejos de la cabeza,
 * sin pisar al perro ni a los premios y manteniendo el tablero válido.
 */
export function addObstaclesDuringPlay({ cols, rows, obstacleSet, occupied, head, dir, count, rng, start }) {
  const added = [];
  const d = DIRS[dir];
  for (let attempt = 0; attempt < 200 && added.length < count; attempt++) {
    const x = randInt(rng, 1, cols - 2);
    const y = randInt(rng, 1, rows - 2);
    const k = cellKey(x, y, cols);
    if (obstacleSet.has(k) || occupied.has(k)) continue;
    if (Math.abs(x - head.x) + Math.abs(y - head.y) < 5) continue;
    // Nunca en la trayectoria inmediata de la cabeza
    let inPath = false;
    for (let s = 1; s <= 8; s++) if (head.x + d.x * s === x && head.y + d.y * s === y) inPath = true;
    if (inPath) continue;
    obstacleSet.add(k);
    const valid = isLayoutValid(cols, rows, obstacleSet, start);
    if (valid) added.push({ x, y });
    else obstacleSet.delete(k);
  }
  return added;
}
