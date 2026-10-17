import { useEffect, useEffectEvent, useRef, useState } from "react";

const MODIFICADORES = ["Shift", "Control", "Alt", "Meta", "CapsLock", "Tab"];

/**
 * Pantalla de bienvenida que aparece al cargar la página.
 * Se cierra al pulsar cualquier tecla, hacer clic o tocar la pantalla,
 * con un fundido de salida antes de llamar a onEmpezar().
 *
 * Uso:
 *   <PantallaBienvenida onEmpezar={() => navigate("/menu")} />
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

  const empezar = useEffectEvent((e) => {
    if (usadoRef.current) return;
    if (e.type === "keydown" && MODIFICADORES.includes(e.key)) return;
    if (e.type === "keydown" && (e.ctrlKey || e.metaKey || e.altKey)) return; // no bloquear Ctrl+R, etc.
    usadoRef.current = true;
    e.preventDefault();
    onPulsar?.();
    setSaliendo(true);
    return true;
  });
  const terminar = useEffectEvent(() => onEmpezar?.());

  useEffect(() => {
    let temporizador;
    const alPulsar = (e) => {
      if (empezar(e)) temporizador = setTimeout(() => terminar(), duracion);
    };
    window.addEventListener("keydown", alPulsar);
    window.addEventListener("pointerdown", alPulsar);
    return () => {
      window.removeEventListener("keydown", alPulsar);
      window.removeEventListener("pointerdown", alPulsar);
      clearTimeout(temporizador);
    };
  }, [duracion]);

  return (
    <div
      className={`fixed inset-0 z-20 animate-aparece cursor-pointer select-none transition-[opacity,transform,filter] ease-in-out motion-reduce:animate-none ${
        saliendo
          ? "pointer-events-none scale-[1.04] opacity-0 blur-[4px] motion-reduce:transform-none motion-reduce:blur-0"
          : ""
      }`}
      style={{ transitionDuration: `${duracion}ms` }}
      role="dialog"
      aria-label={titulo}
    >
      <div className="absolute left-[calc(clamp(20px,5vw,56px)+env(safe-area-inset-left,0px))] top-[calc(clamp(20px,5vh,48px)+env(safe-area-inset-top,0px))] font-marca text-[clamp(26px,3.6vw,44px)] font-extralight leading-none tracking-[.02em] [text-shadow:0_0_18px_rgba(160,200,255,.35)]">
        {marca}
      </div>

      <div className="absolute inset-0 grid -translate-y-[4vh] place-content-center gap-[18px] px-4 text-center">
        <h1 className="m-0 text-balance text-[clamp(20px,2.2vw,28px)] font-light tracking-[.01em]">
          {titulo}
        </h1>
        <p className="m-0 animate-respira text-[clamp(14px,1.4vw,17px)] font-light opacity-85 motion-reduce:animate-none">
          {subtitulo}
        </p>
      </div>
    </div>
  );
}
