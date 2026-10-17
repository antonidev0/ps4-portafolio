// Piezas de interfaz compartidas por los menús del juego.

export function formatTime(ms) {
  if (!Number.isFinite(ms) || ms < 0) return '--:--';
  const total = ms / 1000;
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60);
  const t = Math.floor((total * 10) % 10);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${t}`;
}

export const formatNumber = (n) => new Intl.NumberFormat('es-ES').format(Math.round(n || 0));

/** Botón de menú navegable con flechas (data-nav) y estados visuales. */
export function NavButton({ children, onClick, disabled, variant = 'default', hint, loading, icon, ...rest }) {
  return (
    <button
      type="button"
      data-nav=""
      className={`dg-btn dg-btn--${variant}${loading ? ' is-loading' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {icon && <span className="dg-btn__icon" aria-hidden="true">{icon}</span>}
      <span className="dg-btn__label">{children}</span>
      {hint && <span className="dg-btn__hint">{hint}</span>}
      {loading && <span className="dg-spinner" aria-hidden="true" />}
    </button>
  );
}

export function Panel({ title, subtitle, children, className = '', onBack, backLabel = 'Volver' }) {
  return (
    <section className={`dg-panel ${className}`} aria-label={title}>
      {(title || onBack) && (
        <header className="dg-panel__head">
          {title && <h2 className="dg-panel__title">{title}</h2>}
          {subtitle && <p className="dg-panel__subtitle">{subtitle}</p>}
        </header>
      )}
      <div className="dg-panel__body">{children}</div>
      {onBack && (
        <footer className="dg-panel__foot">
          <NavButton variant="ghost" onClick={onBack} icon="◀" hint="Esc">
            {backLabel}
          </NavButton>
        </footer>
      )}
    </section>
  );
}

export function StatRow({ label, value, highlight }) {
  return (
    <div className={`dg-stat${highlight ? ' is-highlight' : ''}`}>
      <span className="dg-stat__label">{label}</span>
      <span className="dg-stat__value">{value}</span>
    </div>
  );
}
