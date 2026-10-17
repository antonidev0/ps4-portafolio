// Cruceta táctil: responde en pointerdown (sin esperar al clic) y evita el scroll de la página.
const BUTTONS = [
  ['up', '▲', 'Arriba'],
  ['left', '◀', 'Izquierda'],
  ['right', '▶', 'Derecha'],
  ['down', '▼', 'Abajo'],
];

export default function TouchPad({ onDir }) {
  return (
    <div className="dg-pad" aria-label="Controles táctiles">
      {BUTTONS.map(([dir, glyph, label]) => (
        <button
          key={dir}
          type="button"
          className={`dg-pad__btn dg-pad__btn--${dir}`}
          aria-label={label}
          onPointerDown={(e) => {
            e.preventDefault();
            onDir(dir);
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {glyph}
        </button>
      ))}
    </div>
  );
}
