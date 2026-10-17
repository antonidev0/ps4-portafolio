import { NavButton, Panel, StatRow, formatNumber, formatTime } from './ui';
import { getLevel } from '../../game/logic/levels';

const CAUSES = { wall: 'Chocaste con el borde', obstacle: 'Chocaste con un obstáculo', self: 'Te mordiste la cola' };

export default function GameOver({ result, onRetry, onMenu }) {
  const { data, previousBest, isNewRecord, rounds = [] } = result;
  const endless = data.mode === 'endless';
  return (
    <Panel
      title={endless ? 'Fin de la partida' : '¡Ay, perrito!'}
      subtitle={CAUSES[data.cause] ?? 'Fin de la partida'}
      className="dg-panel--overlay dg-panel--result"
    >
      {isNewRecord && <div className="dg-badge">★ ¡Nuevo récord!</div>}
      <div className="dg-results">
        <StatRow label="Puntuación total" value={formatNumber(data.score)} highlight />
        {endless ? (
          <>
            <StatRow label="Ronda alcanzada" value={data.round} />
            <StatRow label="Premios recogidos" value={data.prizes} />
          </>
        ) : (
          <>
            <StatRow label="Nivel" value={`${data.levelId} · ${getLevel(data.levelId).name}`} />
            <StatRow label="Objetivo" value={`${data.progress} / ${data.target}`} />
          </>
        )}
        <StatRow label="Longitud máxima" value={data.maxLength} />
        <StatRow label="Tiempo" value={formatTime(data.timeMs)} />
        <StatRow label="Récord anterior" value={formatNumber(previousBest)} />
      </div>
      {endless && rounds.length > 0 && (
        <details className="dg-rounds">
          <summary>Rondas completadas ({rounds.length})</summary>
          <ol>
            {rounds.map((r) => (
              <li key={r.round}>Ronda {r.round}: {formatTime(r.timeMs)} · {formatNumber(r.score)} pts acumulados</li>
            ))}
          </ol>
        </details>
      )}
      {!endless && <p className="dg-text dg-center">El siguiente nivel solo se desbloquea al alcanzar el objetivo.</p>}
      <div className="dg-row dg-row--center">
        <NavButton variant="primary" onClick={onRetry} icon="↻" hint="R">
          {endless ? 'Jugar de nuevo' : 'Reintentar'}
        </NavButton>
        <NavButton variant="ghost" onClick={onMenu} icon="☰">Volver al menú</NavButton>
      </div>
    </Panel>
  );
}
