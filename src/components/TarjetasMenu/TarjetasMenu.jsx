import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useAnchoVentana } from "../../hooks/useAnchoVentana";

const ANCHO_COMPACTO = 640; // por debajo, el título va debajo de la tarjeta
const FONDO_TARJETA = "linear-gradient(160deg, #1b4fc4, #0a2a8a)";

/**
 * Fila horizontal de tarjetas estilo menú de consola.
 * La tarjeta seleccionada se agranda, muestra un borde de luz y su título al lado,
 * y la fila se desliza para mantenerla siempre en la misma posición.
 *
 * Navegación: flechas ← → (o A / D), rueda del ratón, clic o deslizar el dedo.
 * Enter / Espacio o clic sobre la tarjeta ya seleccionada → onAbrir(item).
 * Escape / Retroceso → onAtras().
 *
 * Uso:
 *   <TarjetasMenu items={items} onAbrir={(item) => console.log(item)} />
 *
 * Cada item:
 *   { id, titulo, Icono?: componente, imagen?: string, etiqueta?: string, color?: string }
 *   - Icono:    componente SVG (se ve centrado en la tarjeta)
 *   - imagen:   URL de una portada (ocupa toda la tarjeta, como un juego)
 *   - etiqueta: texto pequeño abajo de la tarjeta cuando NO está seleccionada
 *   - color:    color de fondo de la tarjeta (por defecto azul)
 *
 * Props opcionales:
 *   tamano      lado de las tarjetas normales en px (por defecto se adapta a la ventana)
 *   escala      cuánto crece la seleccionada (por defecto 1.6)
 *   inicial     índice seleccionado al inicio (por defecto 0)
 *   onCambio    se llama con (item, indice) al cambiar de tarjeta
 *   onAtras     se llama al pulsar Escape o Retroceso
 *   teclado     escuchar las teclas en toda la ventana (por defecto true)
 *   animarEntrada  al aparecer, las tarjetas empiezan pequeñas y crecen (por defecto true)
 *   ariaLabel   nombre accesible de la lista (por defecto "Menú del portafolio")
 */
export default function TarjetasMenu({
  items = [],
  onAbrir,
  onCambio,
  onAtras,
  tamano: tamanoProp,
  escala = 1.6,
  inicial = 0,
  teclado = true,
  animarEntrada = true,
  ariaLabel = "Menú del portafolio",
}) {
  const [indiceGuardado, setIndice] = useState(inicial);
  const indice = Math.max(0, Math.min(indiceGuardado, items.length - 1));
  const ruedaRef = useRef(0);
  const toqueRef = useRef(null);
  const listaRef = useRef(null);

  const ancho = useAnchoVentana();
  const compacto = ancho < ANCHO_COMPACTO;
  const tamano =
    tamanoProp ??
    Math.round(compacto ? Math.max(84, ancho * 0.24) : Math.min(180, Math.max(110, ancho * 0.14)));

  const gap = Math.round(tamano * 0.03);
  const grande = Math.round(tamano * escala);
  const barra = Math.round(tamano * 0.42); // franja inferior con la flecha
  // La seleccionada queda siempre en la misma posición, como en la consola
  const ancla = tamano + gap * 6;
  const altoFila = 12 + grande + barra;

  const mover = (paso) => {
    const n = Math.max(0, Math.min(items.length - 1, indice + paso));
    if (n === indice) return; // ya está en el borde: no se mueve
    setIndice(n);
    onCambio?.(items[n], n);
  };

  const alPulsar = useEffectEvent((e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    // Enter y Espacio sobre el selector de idioma pulsan el botón, no abren la tarjeta
    const enSelector = e.target.closest?.("[data-sin-atajos]");
    if (enSelector && (e.key === "Enter" || e.key === " ")) return;
    if (["ArrowRight", "d", "D"].includes(e.key)) {
      e.preventDefault();
      mover(1);
    } else if (["ArrowLeft", "a", "A"].includes(e.key)) {
      e.preventDefault();
      mover(-1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (items[indice]) onAbrir?.(items[indice]);
    } else if (e.key === "Escape" || e.key === "Backspace") {
      e.preventDefault();
      onAtras?.();
    }
  });

  // Teclado en toda la ventana
  useEffect(() => {
    if (!teclado) return;
    const escuchar = (e) => alPulsar(e);
    window.addEventListener("keydown", escuchar);
    return () => window.removeEventListener("keydown", escuchar);
  }, [teclado]);

  // Foco en la lista para que los lectores de pantalla anuncien la tarjeta activa
  useEffect(() => {
    listaRef.current?.focus({ preventScroll: true });
  }, []);

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
  const alTocar = (e) => {
    toqueRef.current = e.touches[0].clientX;
  };
  const alSoltar = (e) => {
    if (toqueRef.current == null) return;
    const dx = e.changedTouches[0].clientX - toqueRef.current;
    if (Math.abs(dx) > 40) mover(dx < 0 ? 1 : -1);
    toqueRef.current = null;
  };

  const desplazamiento = ancla - indice * (tamano + gap);
  const actual = items[indice];

  // El título se coloca a la derecha de la seleccionada o, en pantallas estrechas, debajo
  const posicionTitulo = compacto
    ? { left: ancla, top: altoFila + 20 }
    : {
        left: ancla + grande + gap * 6,
        top: altoFila - barra * 0.25,
        transform: "translateY(-100%)",
      };

  return (
    <div
      ref={listaRef}
      tabIndex={0}
      onWheel={alRueda}
      onTouchStart={alTocar}
      onTouchEnd={alSoltar}
      className="relative w-full select-none overflow-hidden outline-none"
      style={{ height: altoFila + (compacto ? 90 : 28) }}
      role="listbox"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      aria-activedescendant={actual ? `tarjeta-${actual.id}` : undefined}
    >
      <div
        className={
          animarEntrada
            ? "origin-[20%_40%] animate-menu-crece motion-reduce:animate-none"
            : undefined
        }
      >
        <div
          className="flex items-start pt-3 transition-transform duration-[450ms] ease-ps will-change-transform motion-reduce:transition-none"
          style={{ gap, transform: `translateX(${desplazamiento}px)` }}
        >
          {items.map((item, i) => {
            const sel = i === indice;
            const lado = sel ? grande : tamano;
            const { Icono } = item;
            return (
              <div
                key={item.id}
                id={`tarjeta-${item.id}`}
                role="option"
                aria-selected={sel}
                aria-label={item.titulo}
                className="group relative shrink-0 cursor-pointer transition-[width] duration-[350ms] ease-ps motion-reduce:transition-none"
                style={{ width: lado }}
                onClick={() => (sel ? onAbrir?.(item) : mover(i - indice))}
              >
                <div
                  className={`relative grid place-items-center overflow-hidden text-white transition-[height,filter] duration-[350ms] ease-ps motion-reduce:transition-none ${
                    sel
                      ? "shadow-[0_0_0_4px_rgba(255,255,255,.85),0_0_28px_rgba(140,190,255,.55),0_10px_30px_rgba(0,0,0,.35)] after:pointer-events-none after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/20 after:to-transparent after:to-55% after:content-['']"
                      : "shadow-[0_6px_18px_rgba(0,0,0,.25)] brightness-[.88] group-hover:brightness-105"
                  }`}
                  style={{
                    height: lado,
                    background: item.imagen
                      ? `center / cover no-repeat url(${item.imagen})`
                      : item.color || FONDO_TARJETA,
                  }}
                >
                  {!item.imagen && Icono && (
                    <Icono
                      className="transition-[width,height] duration-[350ms] motion-reduce:transition-none"
                      style={{ width: lado * 0.5, height: lado * 0.5 }}
                    />
                  )}
                  {!sel && item.etiqueta && (
                    <span className="absolute inset-x-0 bottom-[12%] text-center text-[13px] font-semibold leading-tight [text-shadow:0_1px_3px_rgba(0,0,0,.4)]">
                      {item.etiqueta}
                    </span>
                  )}
                </div>

                {/* Franja inferior con flecha, solo en la seleccionada */}
                <div
                  className={`grid place-items-center overflow-hidden bg-[rgba(40,100,200,.75)] text-white transition-[height] duration-[350ms] ease-ps motion-reduce:transition-none ${
                    sel ? "shadow-[0_0_0_4px_rgba(255,255,255,.85)]" : ""
                  }`}
                  style={{ height: sel ? barra : 0 }}
                >
                  <svg width="22" height="26" viewBox="0 0 22 26" aria-hidden="true">
                    <path d="M11 24 2 14h6V2h6v12h6z" fill="currentColor" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {actual && (
        <div
          key={actual.id}
          className="pointer-events-none absolute whitespace-nowrap text-[clamp(28px,4vw,54px)] font-light leading-none tracking-[.01em] [text-shadow:0_2px_12px_rgba(0,0,0,.3)]"
          style={posicionTitulo}
          aria-hidden="true"
        >
          <span className="block animate-titulo-entra motion-reduce:animate-none">
            {actual.titulo}
          </span>
        </div>
      )}
    </div>
  );
}
