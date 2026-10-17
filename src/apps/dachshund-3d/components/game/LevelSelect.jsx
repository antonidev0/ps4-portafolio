import { NavButton, Panel, formatTime } from './ui';
import { LEVELS } from '../../game/logic/levels';

export default function LevelSelect({ save, onSelect, onBack }) {
  return (
    <Panel title="Seleccionar nivel" subtitle="Completa un nivel para desbloquear el siguiente." onBack={onBack} className="dg-panel--wide">
      <div className="dg-levels">
        {LEVELS.map((lv) => {
          const locked = lv.id > save.progress.unlockedLevel;
          const done = save.progress.completed.includes(lv.id);
          const best = save.stats.levelBest[lv.id];
          const time = save.stats.levelBestTime[lv.id];
          return (
            <NavButton
              key={lv.id}
              variant="card"
              className={`dg-btn dg-btn--card dg-level dg-level--${lv.theme}${locked ? ' is-locked' : ''}`}
              disabled={locked}
              onClick={() => onSelect(lv.id)}
              aria-label={`Nivel ${lv.id}: ${lv.name}${locked ? ' (bloqueado)' : ''}`}
            >
              <span className="dg-level__num">Nivel {lv.id}</span>
              <span className="dg-level__name">{lv.name}</span>
              <span className="dg-level__meta">
                <span className={`dg-chip dg-chip--${lv.id}`}>{lv.difficulty}</span>
                <span>Objetivo: {lv.target} premios</span>
              </span>
              <span className="dg-level__desc">{lv.description}</span>
              <span className="dg-level__foot">
                {locked ? (
                  <span className="dg-level__lock">🔒 Completa el nivel {lv.id - 1}</span>
                ) : (
                  <>
                    <span>Récord: {best || '—'}</span>
                    <span>{done ? (time ? `✓ ${formatTime(time)}` : '✓ Completado') : 'Sin completar'}</span>
                  </>
                )}
              </span>
            </NavButton>
          );
        })}
      </div>
    </Panel>
  );
}
