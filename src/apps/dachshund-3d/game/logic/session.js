// Sesión de juego: une el movimiento, los premios, los obstáculos y las reglas
// de cada modo (nivel normal o modo infinito). No sabe nada de Three.js ni de React.
import { cellKey, createSnake, growSnake, snakeLength, stepSnake, queueDirection, clearQueue } from './gameLogic';
import { PRIZES, spawnPrize } from './food';
import { getLevel, BASE_TICK_MS } from './levels';
import { ENDLESS, endlessRoundConfig } from './endlessMode';
import { addObstaclesDuringPlay, generateRandomObstacles, isLayoutValid, sanitizeLayout, toKeySet } from './obstacles';
import { createRng } from './rng';

/**
 * def: { mode: 'level', levelId } | { mode: 'endless' }
 */
export function createSession(def, { rng = createRng() } = {}) {
  const session = {
    mode: def.mode,
    levelId: def.mode === 'level' ? getLevel(def.levelId).id : null,
    rng,
    round: 1,
    score: 0,
    progress: 0,
    target: 0,
    totalCollected: 0,
    maxLength: 0,
    elapsedMs: 0,
    roundElapsedMs: 0,
    tickMs: 0,
    cols: 0,
    rows: 0,
    theme: 'park',
    scoreMultiplier: 1,
    start: null,
    obstacles: [],
    obstacleSet: new Set(),
    snake: null,
    foods: [],
    nextFoodId: 1,
    status: 'running', // running | dead | objective
    deathCause: null,
    roundsCompleted: 0,
    dynamicDone: new Set(),
  };
  setupBoard(session);
  return session;
}

export function levelDef(session) {
  return session.mode === 'level' ? getLevel(session.levelId) : null;
}

/** Prepara tablero, perro y premios de la ronda/nivel actual. Conserva puntuación y ronda. */
export function setupBoard(session) {
  let obstacles;
  if (session.mode === 'level') {
    const lv = getLevel(session.levelId);
    session.cols = lv.cols;
    session.rows = lv.rows;
    session.start = { ...lv.start };
    session.tickMs = lv.tickMs;
    session.target = lv.target;
    session.theme = lv.theme;
    session.scoreMultiplier = lv.scoreMultiplier;
    obstacles = sanitizeLayout(lv.obstacles(), lv.cols, lv.rows, lv.start);
    // Seguridad: si un diseño manual fuese inválido, se juega sin obstáculos antes que con un tablero imposible
    if (!isLayoutValid(lv.cols, lv.rows, toKeySet(obstacles, lv.cols), lv.start)) obstacles = [];
  } else {
    const cfg = endlessRoundConfig(session.round);
    session.cols = ENDLESS.cols;
    session.rows = ENDLESS.rows;
    session.start = { ...ENDLESS.start };
    session.tickMs = cfg.tickMs;
    session.target = cfg.target;
    session.theme = cfg.theme;
    session.scoreMultiplier = cfg.scoreMultiplier;
    obstacles = generateRandomObstacles({
      cols: session.cols,
      rows: session.rows,
      count: cfg.obstacleCount,
      start: session.start,
      rng: session.rng,
    });
  }
  session.obstacles = obstacles;
  session.obstacleSet = toKeySet(obstacles, session.cols);
  session.snake = createSnake(session.start);
  session.foods = [];
  session.progress = 0;
  session.roundElapsedMs = 0;
  session.status = 'running';
  session.deathCause = null;
  session.dynamicDone = new Set();
  session.maxLength = Math.max(session.maxLength, snakeLength(session.snake));
  spawnNextPrize(session);
}

function spawnNextPrize(session) {
  const prize = spawnPrize({
    cols: session.cols,
    rows: session.rows,
    obstacleSet: session.obstacleSet,
    snake: session.snake,
    foods: session.foods,
    rng: session.rng,
    id: session.nextFoodId++,
  });
  if (prize) session.foods.push(prize);
  return prize;
}

export function turn(session, dir) {
  if (session.status !== 'running') return false;
  return queueDirection(session.snake, dir);
}

/**
 * Avanza un paso lógico. Devuelve la lista de eventos producidos:
 *  { type: 'move' } | { type: 'eat', prize, points } | { type: 'spawn', prize }
 *  { type: 'obstacles', cells } | { type: 'death', cause } | { type: 'objective' }
 */
export function tickSession(session) {
  const events = [];
  if (session.status !== 'running') return events;
  const world = { cols: session.cols, rows: session.rows, obstacleSet: session.obstacleSet };
  const res = stepSnake(session.snake, world);
  if (res.dead) {
    session.status = 'dead';
    session.deathCause = res.cause;
    events.push({ type: 'death', cause: res.cause, at: res.head });
    return events;
  }
  events.push({ type: 'move' });

  const head = res.head;
  const idx = session.foods.findIndex((f) => f.x === head.x && f.y === head.y);
  if (idx >= 0) {
    const prize = session.foods[idx];
    session.foods.splice(idx, 1);
    growSnake(session.snake, 1);
    const points = Math.round(PRIZES[prize.type].points * session.scoreMultiplier);
    session.score += points;
    session.progress++;
    session.totalCollected++;
    session.maxLength = Math.max(session.maxLength, snakeLength(session.snake));
    events.push({ type: 'eat', prize, points });

    const lv = levelDef(session);
    if (lv && lv.tickStep) session.tickMs = Math.max(lv.minTickMs, session.tickMs - lv.tickStep);

    if (session.progress >= session.target) {
      session.status = 'objective';
      clearQueue(session.snake);
      events.push({ type: 'objective' });
      return events;
    }

    if (lv) {
      for (const dyn of lv.dynamicObstacles) {
        if (session.progress >= dyn.atProgress && !session.dynamicDone.has(dyn.atProgress)) {
          session.dynamicDone.add(dyn.atProgress);
          const occupied = new Set();
          for (const s of session.snake.segments) occupied.add(cellKey(s.x, s.y, session.cols));
          for (const f of session.foods) occupied.add(cellKey(f.x, f.y, session.cols));
          const cells = addObstaclesDuringPlay({
            cols: session.cols,
            rows: session.rows,
            obstacleSet: session.obstacleSet,
            occupied,
            head,
            dir: session.snake.dir,
            count: dyn.count,
            rng: session.rng,
            start: session.start,
          });
          if (cells.length) {
            session.obstacles.push(...cells);
            events.push({ type: 'obstacles', cells });
          }
        }
      }
    }

    const next = spawnNextPrize(session);
    if (next) events.push({ type: 'spawn', prize: next });
    else if (!session.foods.length) {
      // Tablero lleno: no quedan casillas libres. Se da el objetivo por cumplido.
      session.status = 'objective';
      events.push({ type: 'objective', boardFull: true });
    }
  }
  return events;
}

/** Modo infinito: pasa a la siguiente ronda conservando puntuación, ronda y estadísticas. */
export function startNextRound(session) {
  if (session.mode !== 'endless') return;
  session.roundsCompleted++;
  session.round++;
  setupBoard(session);
}

export function hudSnapshot(session, best = 0) {
  const lv = levelDef(session);
  return {
    mode: session.mode,
    levelId: session.levelId,
    title: lv ? lv.name : ENDLESS.name,
    difficulty: lv ? lv.difficulty : `Ronda ${session.round}`,
    round: session.round,
    score: session.score,
    length: snakeLength(session.snake),
    progress: session.progress,
    target: session.target,
    speed: BASE_TICK_MS / session.tickMs,
    best: Math.max(best, 0),
    totalCollected: session.totalCollected,
  };
}
