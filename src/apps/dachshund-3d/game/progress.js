// Reglas de progreso y estadísticas. Funciones puras: reciben una partida guardada y devuelven otra.
import { sanitizeSave } from './storage';

const clone = (save) => sanitizeSave(JSON.parse(JSON.stringify(save)));

export function recordGameStarted(save) {
  const s = clone(save);
  s.stats.gamesPlayed++;
  return s;
}

export function markTutorialSeen(save) {
  const s = clone(save);
  s.progress.tutorialSeen = true;
  return s;
}

/**
 * Resultado de un nivel normal.
 * result: { levelId, score, timeMs, maxLength, prizes, completed }
 * Solo desbloquea el siguiente nivel si completed es true (objetivo alcanzado).
 */
export function applyLevelResult(save, result) {
  const s = clone(save);
  const id = result.levelId;
  const previousBest = s.stats.levelBest[id] ?? 0;
  s.stats.totalPrizes += result.prizes;
  s.stats.maxLength = Math.max(s.stats.maxLength, result.maxLength);
  s.stats.levelBest[id] = Math.max(previousBest, result.score);
  if (result.completed) {
    s.stats.wins++;
    if (!s.progress.completed.includes(id)) s.progress.completed.push(id);
    s.progress.unlockedLevel = Math.max(s.progress.unlockedLevel, Math.min(3, id + 1));
    const t = s.stats.levelBestTime[id];
    if (!t || result.timeMs < t) s.stats.levelBestTime[id] = result.timeMs;
  }
  return { save: s, previousBest, isNewRecord: result.score > previousBest };
}

/** Resultado del modo infinito. result: { score, round, prizes, maxLength } */
export function applyEndlessResult(save, result) {
  const s = clone(save);
  const previousBest = s.stats.endlessBest;
  s.stats.totalPrizes += result.prizes;
  s.stats.maxLength = Math.max(s.stats.maxLength, result.maxLength);
  s.stats.bestRound = Math.max(s.stats.bestRound, result.round);
  s.stats.endlessBest = Math.max(previousBest, result.score);
  return { save: s, previousBest, isNewRecord: result.score > previousBest };
}

export function applyAudioSettings(save, audio) {
  const s = clone(save);
  s.audio = { ...s.audio, ...audio };
  return sanitizeSave(s);
}

export const isLevelUnlocked = (save, id) => id <= save.progress.unlockedLevel;

/** Partida abandonada desde la pausa: cuenta premios y longitud, pero no récords ni victorias. */
export function applyAbandon(save, { prizes, maxLength }) {
  const s = clone(save);
  s.stats.totalPrizes += prizes;
  s.stats.maxLength = Math.max(s.stats.maxLength, maxLength);
  return s;
}
