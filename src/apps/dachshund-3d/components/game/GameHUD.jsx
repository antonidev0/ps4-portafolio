import { formatNumber } from './ui';

export default function GameHUD({ hud, onPause, onMenu, paused }) {
  if (!hud) return null;
  const pct = Math.min(100, (hud.progress / Math.max(1, hud.target)) * 100);
  const endless = hud.mode === 'endless';
  return (
    <header className="dg-hud" aria-label="Marcador">
      <div className="dg-hud__block dg-hud__mode">
        <span className="dg-hud__label">{endless ? `Ronda ${hud.round}` : `Nivel ${hud.levelId}`}</span>
        <span className="dg-hud__title">{hud.title}</span>
        <div className="dg-progress" role="progressbar" aria-valuemin={0} aria-valuemax={hud.target} aria-valuenow={hud.progress}>
          <div className="dg-progress__bar" style={{ width: `${pct}%` }} />
        </div>
        <span className="dg-hud__small">
          {endless ? 'Siguiente ronda' : 'Objetivo'}: {hud.progress} / {hud.target}
        </span>
      </div>
      <div className="dg-hud__block dg-hud__score">
        <span className="dg-hud__label">Puntuación</span>
        <span className="dg-hud__big" key={hud.score}>{formatNumber(hud.score)}</span>
        <span className="dg-hud__small">Récord {formatNumber(Math.max(hud.best, hud.score))}</span>
      </div>
      <div className="dg-hud__block dg-hud__stats">
        <span className="dg-hud__pair"><span className="dg-hud__label">Longitud</span><b>{hud.length}</b></span>
        <span className="dg-hud__pair"><span className="dg-hud__label">Velocidad</span><b>x{hud.speed.toFixed(2)}</b></span>
        <span className="dg-hud__pair"><span className="dg-hud__label">Dificultad</span><b>{hud.difficulty}</b></span>
      </div>
      <div className="dg-hud__actions">
        <button type="button" className="dg-icon-btn" onClick={onPause} aria-label={paused ? 'Reanudar' : 'Pausar'} title="Pausa (Esc)">
          {paused ? '▶' : '❚❚'}
        </button>
        <button type="button" className="dg-icon-btn" onClick={onMenu} aria-label="Volver al menú" title="Menú">
          ☰
        </button>
      </div>
    </header>
  );
}
