// Modo infinito — Endless Dachshund. Cada ronda pide 10 premios y sube la dificultad.

export const ENDLESS = {
  name: 'Endless Dachshund',
  target: 10,
  cols: 20,
  rows: 14,
  start: { x: 4, y: 7, dir: 'right', length: 3 },
  baseTickMs: 172,
  tickDecayPerRound: 9,
  minTickMs: 78, // velocidad máxima
  obstaclesPerRound: 3,
  maxObstacles: 26,
  themes: ['park', 'garden', 'core'],
};

export function endlessRoundConfig(round) {
  const r = Math.max(1, Math.floor(round));
  const tickMs = Math.max(ENDLESS.minTickMs, ENDLESS.baseTickMs - (r - 1) * ENDLESS.tickDecayPerRound);
  const obstacleCount = Math.min(ENDLESS.maxObstacles, (r - 1) * ENDLESS.obstaclesPerRound);
  return {
    round: r,
    tickMs,
    obstacleCount,
    theme: ENDLESS.themes[(r - 1) % ENDLESS.themes.length],
    scoreMultiplier: 1 + (r - 1) * 0.25,
    target: ENDLESS.target,
  };
}
