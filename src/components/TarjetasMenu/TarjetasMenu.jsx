import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Fila horizontal de tarjetas estilo menú de consola.
 * La tarjeta seleccionada se agranda, muestra un borde de luz y su título al lado,
 * y la fila se desliza para mantenerla siempre en la misma posición.
 *
 * Navegación: flechas ← → (o A / D), rueda del ratón, clic o toque.
 * Enter / Espacio o clic sobre la tarjeta ya seleccionada → onAbrir(item).
 *
 * Uso:
 *   <TarjetasMenu items={items} onAbrir={(item) => console.log(item)} />
 *
 * Cada item:
 *   { id, titulo, icono?: ReactNode, imagen?: string, etiqueta?: string, color?: string }
 *   - icono:    un SVG o cualquier elemento React (se ve centrado en la tarjeta)
 *   - imagen:   URL de una portada (ocupa toda la tarjeta, como un juego)
 *   - etiqueta: texto pequeño abajo de la tarjeta cuando NO está seleccionada
 *   - color:    color de fondo de la tarjeta (por defecto azul)
 *
 * Props opcionales:
 *   tamano      lado de las tarjetas normales en px (por defecto 180)
 *   escala      cuánto crece la seleccionada (por defecto 1.6)
 *   inicial     índice seleccionado al inicio (por defecto 1)
 *   onCambio    se llama con (item, indice) al cambiar de tarjeta
 *   teclado     escuchar las flechas en toda la ventana (por defecto true)
 */
export default function TarjetasMenu({
  items = [],
  onAbrir,
  onCambio,
  tamano = 180,
  escala = 1.6,
  inicial = 1,
  teclado = true,
}) {
  const [indice, setIndice] = useState(Math.min(inicial, Math.max(items.length - 1, 0)));
  const ruedaRef = useRef(0);

  const gap = Math.round(tamano * 0.03);
  const grande = Math.round(tamano * escala);
  const barra = Math.round(tamano * 0.42); // franja inferior con la flecha
  // La seleccionada queda siempre en la segunda posición, como en la imagen
  const ancla = tamano + gap * 6;

  const mover = useCallback(
    (paso) => {
      setIndice((i) => {
        const n = Math.max(0, Math.min(items.length - 1, i + paso));
        if (n !== i) onCambio?.(items[n], n);
        return n;
      });
    },
    [items, onCambio]
  );

  // Teclado
  useEffect(() => {
    if (!teclado) return;
    const alPulsar = (e) => {
      if (["ArrowRight", "d", "D"].includes(e.key)) { e.preventDefault(); mover(1); }
      else if (["ArrowLeft", "a", "A"].includes(e.key)) { e.preventDefault(); mover(-1); }
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); items[indice] && onAbrir?.(items[indice]); }
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [teclado, mover, indice, items, onAbrir]);

  // Rueda del ratón (con pausa para que no salte de golpe)
  const alRueda = (e) => {
    const ahora = performance.now();
    if (ahora - ruedaRef.current < 180) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 8) return;
    ruedaRef.current = ahora;
    mover(d > 0 ? 1 : -1);
  };

  // Deslizar con el dedo
  const toqueRef = useRef(null);
  const alTocar = (e) => (toqueRef.current = e.touches[0].clientX);
  const alSoltar = (e) => {
    if (toqueRef.current == null) return;
    const dx = e.changedTouches[0].clientX - toqueRef.current;
    if (Math.abs(dx) > 40) mover(dx < 0 ? 1 : -1);
    toqueRef.current = null;
  };

  const desplazamiento = ancla - indice * (tamano + gap);
  const actual = items[indice];

  return (
    <div
      onWheel={alRueda}
      onTouchStart={alTocar}
      onTouchEnd={alSoltar}
      style={{ position: "relative", width: "100%", overflow: "hidden", height: grande + barra + 40, userSelect: "none" }}
      role="listbox"
      aria-label="Menú de aplicaciones"
      aria-activedescendant={actual ? `tarjeta-${actual.id}` : undefined}
    >
      <style>{CSS}</style>

      <div
        className="tm-fila"
        style={{ gap, transform: `translateX(${desplazamiento}px)`, paddingTop: 12 }}
      >
        {items.map((item, i) => {
          const sel = i === indice;
          const lado = sel ? grande : tamano;
          return (
            <div
              key={item.id}
              id={`tarjeta-${item.id}`}
              role="option"
              aria-selected={sel}
              className={`tm-tarjeta${sel ? " tm-sel" : ""}`}
              style={{ width: lado, flexShrink: 0 }}
              onClick={() => (sel ? onAbrir?.(item) : mover(i - indice))}
            >
              <div
                className="tm-cara"
                style={{
                  height: lado,
                  background: item.imagen
                    ? `center / cover no-repeat url(${item.imagen})`
                    : item.color || "linear-gradient(160deg, #1b4fc4, #0a2a8a)",
                }}
              >
                {!item.imagen && item.icono && (
                  <div className="tm-icono" style={{ width: lado * 0.5, height: lado * 0.5 }}>
                    {item.icono}
                  </div>
                )}
                {!sel && item.etiqueta && <span className="tm-etiqueta">{item.etiqueta}</span>}
              </div>

              {/* Franja inferior con flecha, solo en la seleccionada */}
              <div className="tm-barra" style={{ height: sel ? barra : 0 }}>
                <svg width="22" height="26" viewBox="0 0 22 26" aria-hidden="true">
                  <path d="M11 24 2 14h6V2h6v12h6z" fill="currentColor" />
                </svg>
              </div>

              {/* Título a la derecha de la seleccionada */}
              {sel && (
                <div className="tm-titulo" style={{ left: lado + gap * 6, bottom: barra * 0.25 }}>
                  {item.titulo}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const CSS = `
.tm-fila {
  display: flex;
  align-items: flex-start;
  transition: transform .45s cubic-bezier(.2,.8,.2,1);
  will-change: transform;
}
.tm-tarjeta {
  position: relative;
  cursor: pointer;
  transition: width .35s cubic-bezier(.2,.8,.2,1);
}
.tm-cara {
  position: relative;
  display: grid;
  place-items: center;
  color: #fff;
  overflow: hidden;
  transition: height .35s cubic-bezier(.2,.8,.2,1), filter .3s;
  box-shadow: 0 6px 18px rgba(0,0,0,.25);
}
.tm-tarjeta:not(.tm-sel) .tm-cara { filter: brightness(.88); }
.tm-tarjeta:not(.tm-sel):hover .tm-cara { filter: brightness(1.05); }
.tm-sel .tm-cara {
  background-blend-mode: overlay;
  box-shadow: 0 0 0 4px rgba(255,255,255,.85), 0 0 28px rgba(140,190,255,.55), 0 10px 30px rgba(0,0,0,.35);
}
.tm-sel .tm-cara::after {
  content: "";
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.22), rgba(255,255,255,0) 55%);
  pointer-events: none;
}
.tm-icono { display: grid; place-items: center; transition: width .35s, height .35s; }
.tm-icono > svg { width: 100%; height: 100%; }
.tm-etiqueta {
  position: absolute; left: 0; right: 0; bottom: 12%;
  text-align: center;
  font: 600 13px/1.2 system-ui, sans-serif;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,.4);
}
.tm-barra {
  display: grid; place-items: center;
  overflow: hidden;
  color: #fff;
  background: rgba(40,100,200,.75);
  box-shadow: 0 0 0 4px rgba(255,255,255,.85);
  transition: height .35s cubic-bezier(.2,.8,.2,1);
}
.tm-tarjeta:not(.tm-sel) .tm-barra { box-shadow: none; }
.tm-titulo {
  position: absolute;
  white-space: nowrap;
  color: #fff;
  font: 300 clamp(28px, 4vw, 54px)/1 system-ui, "Segoe UI", sans-serif;
  letter-spacing: .01em;
  text-shadow: 0 2px 12px rgba(0,0,0,.3);
  animation: tm-entra .4s ease both;
  pointer-events: none;
}
@keyframes tm-entra { from { opacity: 0; transform: translateX(-12px); } }
@media (prefers-reduced-motion: reduce) {
  .tm-fila, .tm-tarjeta, .tm-cara, .tm-barra { transition: none; }
  .tm-titulo { animation: none; }
}
`;
