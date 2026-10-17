import { useEffect, useEffectEvent } from "react";

const MODIFICADORES = ["Shift", "Control", "Alt", "Meta", "CapsLock", "Tab"];

/**
 * Primera pantalla, como el "Pulsa el botón PS" de la consola.
 * Los navegadores no dejan sonar una página hasta que el visitante pulsa algo:
 * este primer gesto desbloquea el audio y la música empieza en la bienvenida.
 *
 * Uso:
 *   <PantallaInicio texto="Pulsa cualquier botón para empezar" onPulsar={() => …} />
 *
 * onPulsar se llama dentro del propio clic o tecla, que es cuando el navegador
 * permite empezar a reproducir audio.
 */
export default function PantallaInicio({ marca = "ToniDev", texto, onPulsar }) {
  const pulsar = useEffectEvent((e) => {
    if (e.type === "keydown" && MODIFICADORES.includes(e.key)) return;
    if (e.type === "keydown" && (e.ctrlKey || e.metaKey || e.altKey)) return; // no bloquear Ctrl+R, etc.
    onPulsar?.();
  });

  useEffect(() => {
    window.addEventListener("keydown", pulsar);
    window.addEventListener("pointerdown", pulsar);
    return () => {
      window.removeEventListener("keydown", pulsar);
      window.removeEventListener("pointerdown", pulsar);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-20 grid animate-aparece cursor-pointer select-none place-content-center gap-8 px-4 text-center motion-reduce:animate-none"
      role="dialog"
      aria-label={texto}
    >
      <p className="font-marca text-[clamp(34px,6vw,72px)] font-extralight leading-none tracking-[.02em] [text-shadow:0_0_24px_rgba(160,200,255,.4)]">
        {marca}
      </p>
      <p className="animate-respira text-[clamp(14px,1.4vw,17px)] font-light opacity-85 motion-reduce:animate-none">
        {texto}
      </p>
    </div>
  );
}
