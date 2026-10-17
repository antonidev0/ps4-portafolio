import { useEffect, useRef } from "react";
import { TEMAS, TEMA_POR_DEFECTO } from "./temas";

/**
 * Fondo animado de ondas de luz diagonales y partículas flotantes.
 *
 * Uso:
 *   <OndasFondo />                          // fondo fijo a pantalla completa
 *   <OndasFondo tema="violeta" velocidad={0.5} />
 *   <OndasFondo fijo={false} style={{ height: 400 }}>contenido</OndasFondo>
 *
 * Props:
 *   tema        "azul" | "violeta" | "turquesa" | "ambar" | objeto propio { a, b, c, w }
 *   velocidad   multiplicador de velocidad (1 = normal)
 *   particulas  número de partículas (por defecto 90)
 *   fijo        true = cubre toda la ventana detrás del contenido; false = llena su contenedor
 *   className, style, children
 *
 * Con "reducir movimiento" activado en el sistema se dibuja un único fotograma,
 * que se vuelve a pintar al redimensionar la ventana o al cambiar de tema.
 */

const ONDAS = [
  // tilt: inclinación diagonal; bend: curvatura en arco
  {
    y: 0.6,
    amp: 0.06,
    f: 1.1,
    v: 0.00007,
    n: 28,
    spread: 0.055,
    alpha: 0.1,
    tilt: -0.55,
    bend: 0.22,
  },
  {
    y: 0.68,
    amp: 0.045,
    f: 1.8,
    v: -0.00005,
    n: 22,
    spread: 0.04,
    alpha: 0.08,
    tilt: -0.45,
    bend: 0.18,
  },
  {
    y: 0.5,
    amp: 0.08,
    f: 0.7,
    v: 0.00004,
    n: 18,
    spread: 0.07,
    alpha: 0.06,
    tilt: -0.65,
    bend: 0.28,
  },
];

const RADIO_SPRITE = 12;

const resolverTema = (tema) =>
  typeof tema === "string" ? TEMAS[tema] || TEMAS[TEMA_POR_DEFECTO] : tema;

// Partícula con brillo pre-renderizada: dibujarla con drawImage es mucho más
// barato que usar shadowBlur en cada partícula y en cada fotograma.
function crearSprite([R, G, B]) {
  const lado = RADIO_SPRITE * 2;
  const c = document.createElement("canvas");
  c.width = c.height = lado;
  const g = c.getContext("2d");
  if (!g) return null;
  const grad = g.createRadialGradient(
    RADIO_SPRITE,
    RADIO_SPRITE,
    0,
    RADIO_SPRITE,
    RADIO_SPRITE,
    RADIO_SPRITE,
  );
  grad.addColorStop(0, `rgba(${R},${G},${B},1)`);
  grad.addColorStop(0.18, `rgba(${R},${G},${B},.9)`);
  grad.addColorStop(0.4, `rgba(${R},${G},${B},.25)`);
  grad.addColorStop(1, `rgba(${R},${G},${B},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, lado, lado);
  return c;
}

export default function OndasFondo({
  tema = TEMA_POR_DEFECTO,
  velocidad = 1,
  particulas = 90,
  fijo = true,
  className,
  style,
  children,
}) {
  const canvasRef = useRef(null);
  // Las props van en refs para cambiarlas sin reiniciar la animación
  const temaRef = useRef(resolverTema(tema));
  const velRef = useRef(velocidad);
  const redibujarRef = useRef(null);

  useEffect(() => {
    temaRef.current = resolverTema(tema);
    velRef.current = velocidad;
    redibujarRef.current?.();
  }, [tema, velocidad]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let W = 0;
    let H = 0;
    let raf = 0;
    let last = performance.now();
    let t = 0;
    let sprite = null;
    let spriteDe = null;

    const P = Array.from({ length: particulas }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.8 + 0.4,
      s: Math.random() * 0.00012 + 0.00003,
      o: Math.random() * Math.PI * 2,
    }));

    const fondo = (T) => {
      const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
      g.addColorStop(0, T.b);
      g.addColorStop(0.55, T.a);
      g.addColorStop(1, T.a);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      const r = Math.max(W, H) * (0.55 + 0.04 * Math.sin(t * 0.0003));
      const h = ctx.createRadialGradient(W * 0.25, H * 0.2, 0, W * 0.25, H * 0.2, r);
      h.addColorStop(0, T.c + "66");
      h.addColorStop(1, T.c + "00");
      ctx.fillStyle = h;
      ctx.fillRect(0, 0, W, H);
    };

    const ondas = (T) => {
      const [R, G, B] = T.w;
      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = 1;
      for (const o of ONDAS) {
        for (let i = 0; i < o.n; i++) {
          const k = i / o.n;
          const off = (k - 0.5) * o.spread * H;
          const ph = t * o.v * 10 + k * 0.9;
          ctx.beginPath();
          for (let px = -20; px <= W + 20; px += 12) {
            const u = px / W;
            const d = u - 0.5;
            const y =
              H * o.y +
              off +
              d * o.tilt * H +
              d * d * o.bend * H +
              Math.sin(u * Math.PI * o.f + ph) * o.amp * H +
              Math.sin(u * Math.PI * o.f * 2.3 - ph * 1.4) * o.amp * H * 0.35;
            if (px === -20) ctx.moveTo(px, y);
            else ctx.lineTo(px, y);
          }
          const a = o.alpha * (1 - Math.abs(k - 0.5) * 1.6);
          ctx.strokeStyle = `rgba(${R},${G},${B},${Math.max(a, 0.015)})`;
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const puntos = (T, dt) => {
      if (spriteDe !== T.w) {
        sprite = crearSprite(T.w);
        spriteDe = T.w;
      }
      if (!sprite) return;
      for (const p of P) {
        p.y -= p.s * dt;
        p.x += Math.sin(t * 0.0002 + p.o) * 0.00002 * dt;
        if (p.y < -0.02) {
          p.y = 1.02;
          p.x = Math.random();
        }
        const tw = 0.45 + 0.55 * Math.sin(t * 0.002 + p.o);
        const lado = p.r * RADIO_SPRITE * 0.9;
        ctx.globalAlpha = 0.35 * tw + 0.1;
        ctx.drawImage(sprite, p.x * W - lado / 2, p.y * H - lado / 2, lado, lado);
      }
      ctx.globalAlpha = 1;
    };

    const pintar = (dt) => {
      const T = temaRef.current;
      fondo(T);
      ondas(T);
      puntos(T, dt);
    };

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Cambiar el tamaño del canvas lo borra: sin animación hay que repintarlo
      if (reduce) pintar(0);
    };

    const frame = (now) => {
      const dt = Math.min(now - last, 50) * velRef.current;
      last = now;
      t += dt;
      pintar(dt);
      raf = requestAnimationFrame(frame);
    };

    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(size);
    ro?.observe(canvas);
    if (!ro) window.addEventListener("resize", size);
    size();

    if (reduce) {
      redibujarRef.current = () => pintar(0);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      if (!ro) window.removeEventListener("resize", size);
      redibujarRef.current = null;
    };
  }, [particulas]);

  const contenedor = fijo
    ? { position: "fixed", inset: 0, zIndex: -1, ...style }
    : { position: "relative", overflow: "hidden", ...style };

  return (
    <div className={className} style={contenedor}>
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 block h-full w-full" />
      {children && <div className="relative z-[1] h-full">{children}</div>}
    </div>
  );
}
