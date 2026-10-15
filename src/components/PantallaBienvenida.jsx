import { useEffect, useRef, useState } from "react";

/**
 * Pantalla de bienvenida que aparece al cargar la página.
 * Se cierra al pulsar cualquier tecla, hacer clic o tocar la pantalla,
 * con un fundido de salida antes de llamar a onEmpezar().
 *
 * Uso:
 *   <PantallaBienvenida onEmpezar={() => setFase("menu")} />
 *
 * Props:
 *   marca       texto del logo arriba a la izquierda (por defecto "ToniDev")
 *   titulo      línea principal
 *   subtitulo   línea secundaria
 *   duracion    duración del fundido de salida en ms (por defecto 900)
 *   onPulsar    se llama en el momento de pulsar (útil para un sonido)
 *   onEmpezar   se llama al terminar el fundido
 */
export default function PantallaBienvenida({
  marca = "ToniDev",
  titulo = "Bienvenido a mi portafolio",
  subtitulo = "Pulsa cualquier tecla para empezar.",
  duracion = 900,
  onPulsar,
  onEmpezar,
}) {
  const [saliendo, setSaliendo] = useState(false);
  const usadoRef = useRef(false);

  // Carga las fuentes de Google Fonts una sola vez
  useEffect(() => {
    if (document.getElementById("pb-fuentes")) return;
    const link = document.createElement("link");
    link.id = "pb-fuentes";
    link.rel = "stylesheet";
    link.href = FUENTES;
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const MODIFICADORES = ["Shift", "Control", "Alt", "Meta", "CapsLock", "Tab"];

    const empezar = (e) => {
      if (usadoRef.current) return;
      if (e.type === "keydown" && MODIFICADORES.includes(e.key)) return;
      if (e.type === "keydown" && (e.ctrlKey || e.metaKey)) return; // no bloquear Ctrl+R, etc.
      usadoRef.current = true;
      e.preventDefault?.();
      onPulsar?.();
      setSaliendo(true);
      setTimeout(() => onEmpezar?.(), duracion);
    };

    window.addEventListener("keydown", empezar);
    window.addEventListener("pointerdown", empezar);
    return () => {
      window.removeEventListener("keydown", empezar);
      window.removeEventListener("pointerdown", empezar);
    };
  }, [duracion, onPulsar, onEmpezar]);

  return (
    <div
      className={`pb-pantalla${saliendo ? " pb-saliendo" : ""}`}
      style={{ "--pb-dur": `${duracion}ms` }}
      role="dialog"
      aria-label={titulo}
    >
      <style>{CSS}</style>

      <div className="pb-marca">{marca}</div>

      <div className="pb-centro">
        <h1 className="pb-titulo">{titulo}</h1>
        <p className="pb-sub">{subtitulo}</p>
      </div>
    </div>
  );
}

// Lexend Exa (ligera y ancha) para el nombre · Noto Sans (ligera) para los textos
const FUENTES =
  "https://fonts.googleapis.com/css2?family=Lexend+Exa:wght@200;300&family=Noto+Sans:wght@300;400&display=swap";

const CSS = `
.pb-pantalla {
  position: fixed;
  inset: 0;
  z-index: 20;
  color: #fff;
  font-family: "Noto Sans", system-ui, "Segoe UI", Roboto, sans-serif;
  /* Sin velo: se ve directamente el fondo de ondas, con su mismo azul */
  background: transparent;
  animation: pb-aparece 1.2s ease both;
  transition: opacity var(--pb-dur) ease, transform var(--pb-dur) ease, filter var(--pb-dur) ease;
}
.pb-saliendo {
  opacity: 0;
  transform: scale(1.04);
  filter: blur(4px);
  pointer-events: none;
}
.pb-marca {
  position: absolute;
  top: calc(clamp(20px, 5vh, 48px) + env(safe-area-inset-top, 0px));
  left: calc(clamp(20px, 5vw, 56px) + env(safe-area-inset-left, 0px));
  font-family: "Lexend Exa", "Noto Sans", system-ui, sans-serif;
  font-weight: 200;
  font-size: clamp(26px, 3.6vw, 44px);
  letter-spacing: .02em;
  line-height: 1;
  text-shadow: 0 0 18px rgba(160,200,255,.35);
}
.pb-centro {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  text-align: center;
  gap: 18px;
  padding-inline: 16px;
  transform: translateY(-4vh);
}
.pb-titulo {
  margin: 0;
  font-weight: 300;
  font-size: clamp(20px, 2.2vw, 28px);
  letter-spacing: .01em;
  text-wrap: balance;
}
.pb-sub {
  margin: 0;
  font-weight: 300;
  font-size: clamp(14px, 1.4vw, 17px);
  opacity: .85;
  animation: pb-respira 2.6s ease-in-out 1.2s infinite;
}
@keyframes pb-aparece { from { opacity: 0; } }
@keyframes pb-respira { 50% { opacity: .45; } }
@media (prefers-reduced-motion: reduce) {
  .pb-pantalla, .pb-sub { animation: none; }
  .pb-saliendo { transform: none; filter: none; }
}
`;
