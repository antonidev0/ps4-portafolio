import { describe, it, expect } from 'vitest';
import { LEVELS } from './levels';
import { ENDLESS, endlessRoundConfig } from './endlessMode';
import { generateRandomObstacles, isLayoutValid, sanitizeLayout, toKeySet, startSafeZone } from './obstacles';
import { createRng } from './rng';

describe('diseños de nivel', () => {
  for (const lv of LEVELS) {
    it(`${lv.name} tiene un tablero válido sin celdas eliminadas`, () => {
      const raw = lv.obstacles();
      const cells = sanitizeLayout(raw, lv.cols, lv.rows, lv.start);
      expect(cells.length).toBe(raw.length);
      expect(isLayoutValid(lv.cols, lv.rows, toKeySet(cells, lv.cols), lv.start)).toBe(true);
    });
  }
  it('nivel 1 sin obstáculos; niveles 2 y 3 con obstáculos crecientes', () => {
    const [a, b, c] = LEVELS.map((l) => l.obstacles().length);
    expect(a).toBe(0);
    expect(b).toBeGreaterThan(0);
    expect(c).toBeGreaterThan(b);
  });
});

describe('generación aleatoria', () => {
  it('siempre produce tableros válidos y respeta la zona de salida', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const rng = createRng(seed);
      const round = 1 + (seed % 12);
      const { obstacleCount } = endlessRoundConfig(round);
      const cells = generateRandomObstacles({ cols: ENDLESS.cols, rows: ENDLESS.rows, count: obstacleCount, start: ENDLESS.start, rng });
      const set = toKeySet(cells, ENDLESS.cols);
      expect(cells.length).toBeLessThanOrEqual(obstacleCount);
      expect(isLayoutValid(ENDLESS.cols, ENDLESS.rows, set, ENDLESS.start)).toBe(true);
      for (const k of startSafeZone(ENDLESS.start, ENDLESS.cols, ENDLESS.rows)) expect(set.has(k)).toBe(false);
    }
  });

  it('termina aunque se pidan más obstáculos de los que caben', () => {
    const cells = generateRandomObstacles({ cols: 8, rows: 6, count: 500, start: { x: 3, y: 3, dir: 'right', length: 3 }, rng: createRng(3) });
    expect(cells.length).toBeLessThan(500);
  });

  it('detecta callejones sin salida y zonas desconectadas', () => {
    const start = { x: 1, y: 4, dir: 'right', length: 1 };
    // muro vertical completo que corta el tablero
    const wall = [0, 1, 2, 3, 4, 5, 6, 7].map((y) => ({ x: 8, y }));
    expect(isLayoutValid(12, 8, toKeySet(wall, 12), start)).toBe(false);
    // casilla de la esquina con una sola salida
    expect(isLayoutValid(12, 8, toKeySet([{ x: 1, y: 0 }], 12), start)).toBe(false);
  });
});
