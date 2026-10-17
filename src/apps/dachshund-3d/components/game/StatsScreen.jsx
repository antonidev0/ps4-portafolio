import { useState } from 'react';
import { NavButton, Panel, StatRow, formatNumber, formatTime } from './ui';
import { LEVELS } from '../../game/logic/levels';

export default function StatsScreen({ save, onReset, onBack }) {
  const [confirm, setConfirm] = useState(false);
  const st = save.stats;
  return (
    <Panel title="Récords y estadísticas" onBack={onBack} className="dg-panel--wide">
      <div className="dg-stats-grid">
        <div className="dg-card">
          <h3 className="dg-subhead">Endless Dachshund</h3>
          <StatRow label="Récord" value={formatNumber(st.endlessBest)} highlight />
          <StatRow label="Mejor ronda" value={st.bestRound || '—'} />
        </div>
        <div className="dg-card">
          <h3 className="dg-subhead">Niveles</h3>
          {LEVELS.map((lv) => (
            <StatRow
              key={lv.id}
              label={`${lv.id}. ${lv.name}`}
              value={`${formatNumber(st.levelBest[lv.id])} · ${st.levelBestTime[lv.id] ? formatTime(st.levelBestTime[lv.id]) : '—'}`}
            />
          ))}
          <StatRow label="Niveles desbloqueados" value={`${save.progress.unlockedLevel} / 3`} />
        </div>
        <div className="dg-card">
          <h3 className="dg-subhead">General</h3>
          <StatRow label="Partidas jugadas" value={formatNumber(st.gamesPlayed)} />
          <StatRow label="Victorias" value={formatNumber(st.wins)} />
          <StatRow label="Premios recogidos" value={formatNumber(st.totalPrizes)} />
          <StatRow label="Longitud máxima" value={st.maxLength || '—'} />
        </div>
      </div>
      <div className="dg-row">
        {confirm ? (
          <>
            <span className="dg-text">¿Borrar todo el progreso y los récords?</span>
            <NavButton variant="danger" onClick={() => { onReset(); setConfirm(false); }}>Sí, borrar</NavButton>
            <NavButton variant="ghost" onClick={() => setConfirm(false)}>Cancelar</NavButton>
          </>
        ) : (
          <NavButton variant="ghost" onClick={() => setConfirm(true)}>Restablecer progreso</NavButton>
        )}
      </div>
    </Panel>
  );
}
