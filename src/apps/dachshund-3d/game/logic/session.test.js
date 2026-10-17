import { describe, it, expect } from 'vitest';
import { createSession, tickSession, startNextRound, turn } from './session';
import { snakeLength, DIRS, cellKey } from './gameLogic';
import { LEVELS } from './levels';
import { ENDLESS, endlessRoundConfig } from './endlessMode';
import { createRng } from './rng';

// Piloto automático muy simple: busca el premio por BFS evitando obstáculos y cuerpo.
function autopilot(session) {
  const { cols, rows, snake, foods, obstacleSet } = session;
  const head = snake.segments[0];
  const blocked = new Set(obstacleSet);
  snake.segments.slice(0, -1).forEach((s) => blocked.add(cellKey(s.x, s.y, cols)));
  const goal = foods[0];
  const prev = new Map();
  const startK = cellKey(head.x, head.y, cols);
  const q = [head];
  prev.set(startK, null);
  let found = null;
  while (q.length) {
    const c = q.shift();
    if (goal && c.x === goal.x && c.y === goal.y) { found = c; break; }
    for (const [name, d] of Object.entries(DIRS)) {
      const nx = c.x + d.x, ny = c.y + d.y, k = cellKey(nx, ny, cols);
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || blocked.has(k) || prev.has(k)) continue;
      prev.set(k, { c, name });
      q.push({ x: nx, y: ny });
    }
  }
  if (!found) return;
  let step = found, dir = null;
  while (true) {
    const p = prev.get(cellKey(step.x, step.y, cols));
    if (!p) break;
    dir = p.name;
    if (p.c === head || (p.c.x === head.x && p.c.y === head.y)) break;
    step = p.c;
  }
  if (dir && dir !== snake.dir) turn(session, dir);
}

function playUntil(session, stop, maxTicks = 20000) {
  const all = [];
  for (let i = 0; i < maxTicks && session.status === 'running'; i++) {
    autopilot(session);
    const ev = tickSession(session);
    all.push(...ev);
    // los premios nunca están sobre el perro ni sobre obstáculos
    for (const f of session.foods) {
      expect(session.obstacleSet.has(cellKey(f.x, f.y, session.cols))).toBe(false);
      expect(session.snake.segments.some((s) => s.x === f.x && s.y === f.y)).toBe(false);
    }
    if (stop(ev)) break;
  }
  return all;
}

describe('niveles normales', () => {
  for (const lv of LEVELS) {
    it(`${lv.name}: el objetivo es exactamente ${lv.target} premios`, () => {
      const s = createSession({ mode: 'level', levelId: lv.id }, { rng: createRng(lv.id * 7) });
      expect(s.target).toBe(lv.target);
      const events = playUntil(s, (ev) => ev.some((e) => e.type === 'objective' || e.type === 'death'));
      const eats = events.filter((e) => e.type === 'eat').length;
      expect(s.status).toBe('objective');
      expect(eats).toBe(lv.target);
      expect(s.progress).toBe(lv.target);
      expect(snakeLength(s.snake)).toBe(lv.start.length + lv.target);
    });
  }

  it('el nivel 3 acelera durante la partida', () => {
    const s = createSession({ mode: 'level', levelId: 3 }, { rng: createRng(11) });
    const t0 = s.tickMs;
    playUntil(s, (ev) => ev.some((e) => e.type === 'objective' || e.type === 'death'));
    expect(s.tickMs).toBeLessThan(t0);
    expect(s.tickMs).toBeGreaterThanOrEqual(LEVELS[2].minTickMs);
  });

  it('una colisión termina la partida con estado dead', () => {
    const s = createSession({ mode: 'level', levelId: 1 }, { rng: createRng(1) });
    s.foods = [];
    for (let i = 0; i < 40 && s.status === 'running'; i++) tickSession(s);
    expect(s.status).toBe('dead');
    expect(s.deathCause).toBe('wall');
  });
});

describe('modo infinito', () => {
  it('cada ronda pide 10 premios y conserva puntuación, ronda y totales', () => {
    const s = createSession({ mode: 'endless' }, { rng: createRng(5) });
    expect(s.target).toBe(10);
    playUntil(s, (ev) => ev.some((e) => e.type === 'objective'));
    expect(s.status).toBe('objective');
    const score = s.score, total = s.totalCollected, maxLen = s.maxLength, tick = s.tickMs;
    expect(total).toBe(10);

    startNextRound(s);
    expect(s.round).toBe(2);
    expect(s.score).toBe(score);
    expect(s.totalCollected).toBe(total);
    expect(s.maxLength).toBe(maxLen);
    expect(s.progress).toBe(0);
    expect(s.status).toBe('running');
    // posición y longitud reiniciadas
    expect(s.snake.segments[0]).toEqual({ x: ENDLESS.start.x, y: ENDLESS.start.y });
    expect(snakeLength(s.snake)).toBe(ENDLESS.start.length);
    // dificultad mayor
    expect(s.tickMs).toBeLessThan(tick);
    expect(s.foods.length).toBe(1);
  });

  it('la dificultad sube gradualmente y tiene un máximo', () => {
    let prev = endlessRoundConfig(1);
    for (let r = 2; r < 40; r++) {
      const c = endlessRoundConfig(r);
      expect(c.tickMs).toBeLessThanOrEqual(prev.tickMs);
      expect(c.obstacleCount).toBeGreaterThanOrEqual(prev.obstacleCount);
      expect(c.tickMs).toBeGreaterThanOrEqual(ENDLESS.minTickMs);
      prev = c;
    }
    expect(endlessRoundConfig(100).tickMs).toBe(ENDLESS.minTickMs);
  });

  it('varias rondas seguidas acumulan puntuación', () => {
    const s = createSession({ mode: 'endless' }, { rng: createRng(9) });
    let last = 0;
    for (let r = 0; r < 3; r++) {
      playUntil(s, (ev) => ev.some((e) => e.type === 'objective'));
      expect(s.status).toBe('objective');
      expect(s.score).toBeGreaterThan(last);
      last = s.score;
      startNextRound(s);
    }
    expect(s.round).toBe(4);
    expect(s.totalCollected).toBe(30);
  });
});
