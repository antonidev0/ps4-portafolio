import { NavButton, Panel } from './ui';

export function Countdown({ value }) {
  if (value == null) return null;
  return (
    <div className="dg-countdown" aria-live="assertive" key={value}>
      {value === 0 ? '¡YA!' : value}
    </div>
  );
}

export function Banner({ banner }) {
  if (!banner) return null;
  return (
    <div className={`dg-banner dg-banner--${banner.kind ?? 'info'}`} key={banner.id} role="status">
      <strong>{banner.title}</strong>
      {banner.sub && <span>{banner.sub}</span>}
    </div>
  );
}

export function Tutorial({ onStart, touch }) {
  return (
    <Panel title="Cómo se juega" subtitle="Primera partida en Neon Park" className="dg-panel--overlay dg-panel--narrow">
      <ul className="dg-tutorial">
        <li>
          <span className="dg-tutorial__icon">✥</span>
          {touch ? 'Usa la cruceta o desliza el dedo para girar.' : 'Gira con las flechas o con WASD.'}
        </li>
        <li><span className="dg-tutorial__icon">🦴</span>Recoge 10 premios: huesos (10 pts) y galletas (25 pts).</li>
        <li><span className="dg-tutorial__icon">📏</span>Cada premio alarga al perro una casilla.</li>
        <li><span className="dg-tutorial__icon">⚠</span>No choques con los bordes ni con tu propio cuerpo.</li>
        <li><span className="dg-tutorial__icon">❚❚</span>Pausa cuando quieras con Esc o con el botón de pausa.</li>
      </ul>
      <div className="dg-row dg-row--center">
        <NavButton variant="primary" onClick={onStart} icon="▶" hint="Enter">¡Entendido!</NavButton>
      </div>
    </Panel>
  );
}

export function ConfirmDialog({ title, text, confirmLabel, onConfirm, onCancel }) {
  return (
    <div className="dg-modal" role="dialog" aria-modal="true" aria-label={title}>
      <Panel title={title} subtitle={text} className="dg-panel--overlay dg-panel--narrow">
        <div className="dg-row dg-row--center">
          <NavButton variant="danger" onClick={onConfirm}>{confirmLabel}</NavButton>
          <NavButton variant="ghost" onClick={onCancel} hint="Esc">Cancelar</NavButton>
        </div>
      </Panel>
    </div>
  );
}
