import { useCallback, useEffect, useRef } from "react";

/**
 * Efectos de sonido cortos para la interfaz (mover, seleccionar, atrás…).
 *
 * Usa la Web Audio API en lugar de <audio> porque:
 *  - suena al instante, sin retraso (importante al moverse rápido),
 *  - el mismo sonido puede superponerse si pulsas varias veces seguidas.
 *
 * Uso:
 *   const sonar = useSonidos({
 *     mover: "/sonidos/mover.mp3",
 *     seleccionar: "/sonidos/seleccionar.mp3",
 *     atras: "/sonidos/atras.mp3",
 *   }, { volumen: 0.6 });
 *
 *   sonar("mover");
 *
 * Nota: los navegadores no permiten sonido hasta que el usuario interactúa
 * con la página. Como estos sonidos responden a teclas y clics, eso ya se cumple.
 */
export default function useSonidos(archivos, { volumen = 0.6, silencio = false } = {}) {
  const ctxRef = useRef(null);
  const ganRef = useRef(null);
  const buffersRef = useRef({});

  // Crea el contexto de audio y precarga todos los sonidos
  useEffect(() => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const gan = ctx.createGain();
    gan.connect(ctx.destination);
    ctxRef.current = ctx;
    ganRef.current = gan;

    let activo = true;
    Object.entries(archivos).forEach(async ([nombre, url]) => {
      try {
        const res = await fetch(url);
        const datos = await res.arrayBuffer();
        const buffer = await ctx.decodeAudioData(datos);
        if (activo) buffersRef.current[nombre] = buffer;
      } catch (e) {
        console.warn(`No se pudo cargar el sonido "${nombre}" (${url})`, e);
      }
    });

    return () => {
      activo = false;
      buffersRef.current = {};
      ctx.close();
    };
    // Recarga solo si cambian las rutas
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(archivos)]);

  // Volumen y silencio
  useEffect(() => {
    if (ganRef.current) ganRef.current.gain.value = silencio ? 0 : volumen;
  }, [volumen, silencio]);

  return useCallback(async (nombre) => {
    const ctx = ctxRef.current;
    const buffer = buffersRef.current[nombre];
    if (!ctx || !buffer) return;
    if (ctx.state === "suspended") await ctx.resume();
    const fuente = ctx.createBufferSource();
    fuente.buffer = buffer;
    fuente.connect(ganRef.current);
    fuente.start();
  }, []);
}
