// Persistencia en LocalStorage con validación y valores predeterminados.
// Todo el juego usa una única clave propia para no pisar datos de otras páginas.

export const STORAGE_KEY = 'dachshund3d:save:v1';

export function defaultSave() {
  return {
    version: 1,
    progress: { unlockedLevel: 1, completed: [], tutorialSeen: false },
    stats: {
      gamesPlayed: 0,
      totalPrizes: 0,
      wins: 0,
      bestRound: 0,
      endlessBest: 0,
      maxLength: 0,
      levelBest: { 1: 0, 2: 0, 3: 0 },
      levelBestTime: { 1: null, 2: null, 3: null },
    },
    audio: { musicOn: true, sfxOn: true, muted: false, master: 0.8, music: 0.45, sfx: 0.8 },
  };
}

const int = (v, def, min = 0, max = Number.MAX_SAFE_INTEGER) =>
  Number.isFinite(v) ? Math.min(max, Math.max(min, Math.floor(v))) : def;
const vol = (v, def) => (Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : def);
const bool = (v, def) => (typeof v === 'boolean' ? v : def);
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

/** Devuelve siempre un objeto completo y válido, aunque el dato guardado esté dañado. */
export function sanitizeSave(raw) {
  const d = defaultSave();
  const r = obj(raw);
  const p = obj(r.progress);
  const s = obj(r.stats);
  const a = obj(r.audio);
  const lb = obj(s.levelBest);
  const lt = obj(s.levelBestTime);
  const completed = Array.isArray(p.completed)
    ? [...new Set(p.completed.filter((n) => [1, 2, 3].includes(n)))].sort()
    : [];
  return {
    version: 1,
    progress: {
      unlockedLevel: Math.max(int(p.unlockedLevel, 1, 1, 3), ...completed.map((n) => Math.min(3, n + 1)), 1),
      completed,
      tutorialSeen: bool(p.tutorialSeen, false),
    },
    stats: {
      gamesPlayed: int(s.gamesPlayed, 0),
      totalPrizes: int(s.totalPrizes, 0),
      wins: int(s.wins, 0),
      bestRound: int(s.bestRound, 0),
      endlessBest: int(s.endlessBest, 0),
      maxLength: int(s.maxLength, 0),
      levelBest: { 1: int(lb[1], 0), 2: int(lb[2], 0), 3: int(lb[3], 0) },
      levelBestTime: {
        1: Number.isFinite(lt[1]) && lt[1] > 0 ? lt[1] : null,
        2: Number.isFinite(lt[2]) && lt[2] > 0 ? lt[2] : null,
        3: Number.isFinite(lt[3]) && lt[3] > 0 ? lt[3] : null,
      },
    },
    audio: {
      musicOn: bool(a.musicOn, d.audio.musicOn),
      sfxOn: bool(a.sfxOn, d.audio.sfxOn),
      muted: bool(a.muted, d.audio.muted),
      master: vol(a.master, d.audio.master),
      music: vol(a.music, d.audio.music),
      sfx: vol(a.sfx, d.audio.sfx),
    },
  };
}

function getStorage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null; // modo privado o almacenamiento bloqueado
  }
}

export function loadSave(storage = getStorage()) {
  if (!storage) return defaultSave();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? sanitizeSave(JSON.parse(raw)) : defaultSave();
  } catch {
    return defaultSave();
  }
}

export function writeSave(save, storage = getStorage()) {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(sanitizeSave(save)));
    return true;
  } catch {
    return false;
  }
}

export function resetSave(storage = getStorage()) {
  const fresh = defaultSave();
  writeSave(fresh, storage);
  return fresh;
}
