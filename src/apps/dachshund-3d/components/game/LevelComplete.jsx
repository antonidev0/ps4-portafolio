import { NavButton, Panel, StatRow, formatNumber, formatTime } from './ui';
import { getLevel } from '../../game/logic/levels';

export default function LevelComplete({ result, campaignScore, onNext, onRepeat, onMenu }) {
  const { data, isNewRecord, best } = result;
  const lv = getLevel(data.levelId);
  const final = data.levelId === 3;
  return (
    <Panel
      title={final ? '¡Victoria final!' : '¡Nivel completado!'}
      subtitle={final ? 'Has dominado el Neon Core. Eres el perro salchicha más largo de la red.' : `${lv.name} superado`}
      className={`dg-panel--overlay dg-panel--result${final ? ' dg-panel--final' : ''}`}
    >
      {isNewRecord && <div className="dg-badge">★ ¡Nuevo récord personal!</div>}
      <div className="dg-results">
        <StatRow label={final ? 'Puntuación del nivel' : 'Puntuación'} value={formatNumber(data.score)} highlight />
        {final && campaignScore > data.score && <StatRow label="Puntuación total (campaña)" value={formatNumber(campaignScore)} highlight />}
        <StatRow label="Tiempo" value={formatTime(data.timeMs)} />
        <StatRow label="Premios" value={`${data.progress} / ${data.target}`} />
        {final && <StatRow label="Longitud máxima" value={data.maxLength} />}
        <StatRow label="Récord personal" value={formatNumber(best)} />
      </div>
      <div className="dg-row dg-row--center">
        {!final && (
          <NavButton variant="primary" onClick={onNext} icon="▶">
            Siguiente nivel
          </NavButton>
        )}
        <NavButton variant={final ? 'primary' : 'default'} onClick={onRepeat} icon="↻">
          Repetir nivel
        </NavButton>
        <NavButton variant="ghost" onClick={onMenu} icon="☰">Volver al menú</NavButton>
      </div>
    </Panel>
  );
}
