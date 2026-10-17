import { NavButton } from './ui';
import { getLevel } from '../../game/logic/levels';

export default function GameMenu({ save, loading, onPlay, onLevels, onEndless, onStats, onControls, onSound, onExit, exitLabel }) {
  const next = save.progress.unlockedLevel;
  const playHint = save.progress.completed.length ? `Nivel ${next} · ${getLevel(next).name}` : 'Nivel 1 · Neon Park';
  return (
    <section className="dg-menu" aria-label="Menú principal">
      <div className="dg-menu__brand">
        <span className="dg-menu__kicker">Un juego de ToniDev</span>
        <h1 className="dg-title">
          <span>DACHSHUND</span> <span className="dg-title__accent">3D</span>
        </h1>
        <p className="dg-menu__desc">
          Guía a un perro salchicha por tableros de neón, recoge huesos y galletas y estírate sin chocar contigo
          mismo, con los bordes ni con los obstáculos.
        </p>
      </div>
      <nav className="dg-menu__list">
        <NavButton variant="primary" onClick={onPlay} hint={playHint} loading={loading} icon="▶">
          Jugar
        </NavButton>
        <NavButton onClick={onLevels} disabled={loading} icon="▦">
          Seleccionar nivel
        </NavButton>
        <NavButton onClick={onEndless} disabled={loading} icon="∞" hint={save.stats.endlessBest ? `Récord ${save.stats.endlessBest}` : null}>
          Modo infinito
        </NavButton>
        <NavButton onClick={onStats} icon="★">Récords y estadísticas</NavButton>
        <NavButton onClick={onControls} icon="✥">Controles</NavButton>
        <NavButton onClick={onSound} icon="♪">Configuración de sonido</NavButton>
        {onExit && (
          <NavButton variant="ghost" onClick={onExit} icon="◀">
            {exitLabel}
          </NavButton>
        )}
      </nav>
      <p className="dg-menu__tip" aria-hidden="true">
        <kbd>↑</kbd><kbd>↓</kbd> navegar · <kbd>Enter</kbd> confirmar · <kbd>M</kbd> sonido
      </p>
    </section>
  );
}
