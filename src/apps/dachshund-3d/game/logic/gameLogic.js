// Lógica de movimiento del perro por casillas, independiente del renderizado.
// El tablero usa coordenadas enteras (x: columna, y: fila). y crece hacia abajo.

export const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

// Máximo de giros en cola: permite encadenar dos giros rápidos (p. ej. arriba + izquierda)
// sin acumular pulsaciones que se ejecuten mucho después.
export const MAX_QUEUED_TURNS = 2;

export const cellKey = (x, y, cols) => y * cols + x;

export function createSnake({ x, y, dir = 'right', length = 3 }) {
  const d = DIRS[dir];
  const segments = [];
  for (let i = 0; i < length; i++) segments.push({ x: x - d.x * i, y: y - d.y * i });
  return {
    segments,
    prevSegments: segments.map((s) => ({ ...s })),
    dir,
    queue: [],
    pendingGrowth: 0,
    grewLastStep: false,
  };
}

/** Longitud lógica real (incluye el crecimiento pendiente que ya se ha ganado). */
export const snakeLength = (snake) => snake.segments.length + snake.pendingGrowth;

/**
 * Encola un cambio de dirección. Se valida contra la última dirección encolada,
 * no contra la actual, para que dos pulsaciones rápidas nunca produzcan un giro de 180°.
 */
export function queueDirection(snake, dir) {
  if (!DIRS[dir]) return false;
  const last = snake.queue.length ? snake.queue[snake.queue.length - 1] : snake.dir;
  if (dir === last || dir === OPPOSITE[last]) return false;
  if (snake.queue.length >= MAX_QUEUED_TURNS) return false;
  snake.queue.push(dir);
  return true;
}

export function clearQueue(snake) {
  snake.queue.length = 0;
}

/**
 * Comprueba qué ocurriría al entrar en (x, y).
 * world: { cols, rows, obstacleSet:Set<number> }
 */
export function collisionAt(snake, world, x, y) {
  if (x < 0 || y < 0 || x >= world.cols || y >= world.rows) return 'wall';
  if (world.obstacleSet.has(cellKey(x, y, world.cols))) return 'obstacle';
  const segs = snake.segments;
  // Si no crece en este paso, la cola se desplaza y deja libre su casilla.
  const limit = snake.pendingGrowth > 0 ? segs.length : segs.length - 1;
  for (let i = 0; i < limit; i++) {
    if (segs[i].x === x && segs[i].y === y) return 'self';
  }
  return null;
}

/**
 * Avanza una casilla. Devuelve { dead, cause, head }.
 * Si hay colisión el perro no se mueve (la posición visual se queda en la última casilla válida).
 */
export function stepSnake(snake, world) {
  if (snake.queue.length) snake.dir = snake.queue.shift();
  const d = DIRS[snake.dir];
  const head = snake.segments[0];
  const nx = head.x + d.x;
  const ny = head.y + d.y;
  const cause = collisionAt(snake, world, nx, ny);

  // Copia de las posiciones previas para la interpolación visual
  const prev = snake.prevSegments;
  prev.length = snake.segments.length;
  for (let i = 0; i < snake.segments.length; i++) {
    const s = snake.segments[i];
    if (prev[i]) {
      prev[i].x = s.x;
      prev[i].y = s.y;
    } else prev[i] = { x: s.x, y: s.y };
  }

  if (cause) {
    snake.grewLastStep = false;
    return { dead: true, cause, head: { x: nx, y: ny } };
  }

  if (snake.pendingGrowth > 0) {
    snake.pendingGrowth--;
    snake.segments.unshift({ x: nx, y: ny });
    snake.grewLastStep = true;
  } else {
    const tail = snake.segments.pop();
    tail.x = nx;
    tail.y = ny;
    snake.segments.unshift(tail);
    snake.grewLastStep = false;
  }
  return { dead: false, cause: null, head: snake.segments[0] };
}

export function growSnake(snake, amount = 1) {
  snake.pendingGrowth += amount;
}

export function occupiesCell(snake, x, y) {
  return snake.segments.some((s) => s.x === x && s.y === y);
}
