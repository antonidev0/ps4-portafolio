import { useEffect, useRef, useState } from "react";

/**
 * Música de fondo con botón de silencio y entrada suave (fade).
 *
 * Los navegadores bloquean el audio con sonido hasta que el usuario
 * interactúa con la página. Este componente intenta reproducir al cargar
 * y, si el navegador lo impide, empieza en el primer clic, tecla o toque.
 *
 * Uso:
 *   import musica from "./assets/musica.mp3";
 *   <AudioFondo src={musica} volumen={0.4} />
 *
 * Props:
 *   src          ruta o import del archivo de audio (mp3, ogg, wav…)
 *   volumen      0 a 1 (por defecto 0.4)
 *   fade         duración de la entrada/salida suave en ms (por defecto 1500)
 *   loop         repetir en bucle (por defecto true)
 *   mostrarBoton mostrar el botón de silencio (por defecto true)
 *   posicion     "abajo-derecha" | "abajo-izquierda" | "arriba-derecha" | "arriba-izquierda"
 */
export default function AudioFondo({
  src,
  volumen = 0.4,
  fade = 1500,
  loop = true,
  mostrarBoton = true,
  posicion = "abajo-derecha",
}) {
  const audioRef = useRef(null);
  const fadeRef = useRef(0);
  const [sonando, setSonando] = useState(false);

  // Sube o baja el volumen poco a poco hasta "destino"
  const fundido = (destino, alTerminar) => {
    const audio = audioRef.current;
    if (!audio) return;
    cancelAnimationFrame(fadeRef.current);
    const inicio = audio.volume;
    const t0 = performance.now();
    const paso = (now) => {
      const p = fade > 0 ? Math.min((now - t0) / fade, 1) : 1;
      audio.volume = inicio + (destino - inicio) * p;
      if (p < 1) fadeRef.current = requestAnimationFrame(paso);
      else alTerminar?.();
    };
    fadeRef.current = requestAnimationFrame(paso);
  };

  const reproducir = async () => {
    const audio = audioRef.current;
    if (!audio) return false;
    try {
      audio.volume = 0;
      await audio.play();
      setSonando(true);
      fundido(volumen);
      return true;
    } catch {
      return false; // el navegador bloqueó la reproducción automática
    }
  };

  const pausar = () => {
    setSonando(false);
    fundido(0, () => audioRef.current?.pause());
  };

  // Intento de reproducción automática; si falla, espera la primera interacción
  useEffect(() => {
    let activo = true;
    const eventos = ["pointerdown", "keydown", "touchstart"];
    const alInteractuar = async () => {
      if (await reproducir()) eventos.forEach((e) => window.removeEventListener(e, alInteractuar));
    };
    reproducir().then((ok) => {
      if (!ok && activo) eventos.forEach((e) => window.addEventListener(e, alInteractuar));
    });
    return () => {
      activo = false;
      eventos.forEach((e) => window.removeEventListener(e, alInteractuar));
      cancelAnimationFrame(fadeRef.current);
      audioRef.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Si cambia la prop volumen mientras suena, se ajusta suavemente
  useEffect(() => {
    if (sonando) fundido(volumen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volumen]);

  const [v, h] = posicion.split("-");
  const estiloBoton = {
    position: "fixed",
    [v === "arriba" ? "top" : "bottom"]: `calc(16px + env(safe-area-inset-${v === "arriba" ? "top" : "bottom"}, 0px))`,
    [h === "izquierda" ? "left" : "right"]: `calc(16px + env(safe-area-inset-${h === "izquierda" ? "left" : "right"}, 0px))`,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,.25)",
    background: "rgba(255,255,255,.1)",
    backdropFilter: "blur(6px)",
    color: "#fff",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    padding: 0,
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop={loop} preload="auto" />
      {mostrarBoton && (
        <button
          type="button"
          style={estiloBoton}
          onClick={(e) => {
            e.stopPropagation();
            sonando ? pausar() : reproducir();
          }}
          aria-label={sonando ? "Silenciar música" : "Activar música"}
          title={sonando ? "Silenciar música" : "Activar música"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" />
            {sonando ? (
              <>
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                <path d="M19 5a10 10 0 0 1 0 14" />
              </>
            ) : (
              <>
                <line x1="22" y1="9" x2="16" y2="15" />
                <line x1="16" y1="9" x2="22" y2="15" />
              </>
            )}
          </svg>
        </button>
      )}
    </>
  );
}
