import { useEffect, useRef } from "react";

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
 */

export const TEMAS = {
  azul:     { a: "#020b2e", b: "#0a2a7a", c: "#1a4fd0", w: [120, 170, 255] },
  violeta:  { a: "#120428", b: "#3a0f6e", c: "#7a2fd0", w: [200, 150, 255] },
  turquesa: { a: "#021a1c", b: "#06505a", c: "#0fa3a0", w: [140, 255, 230] },
  ambar:    { a: "#1c0a04", b: "#6a2a08", c: "#d0701a", w: [255, 200, 140] },
};

const ONDAS = [
  // tilt: inclinación diagonal; bend: curvatura en arco
  { y: 0.60, amp: 0.06,  f: 1.1, v: 0.00007,  n: 28, spread: 0.055, alpha: 0.10, tilt: -0.55, bend: 0.22 },
  { y: 0.68, amp: 0.045, f: 1.8, v: -0.00005, n: 22, spread: 0.04,  alpha: 0.08, tilt: -0.45, bend: 0.18 },
  { y: 0.50, amp: 0.08,  f: 0.7, v: 0.00004,  n: 18, spread: 0.07,  alpha: 0.06, tilt: -0.65, bend: 0.28 },
];

export default function OndasFondo({
  tema = "azul",
  velocidad = 1,
  particulas = 90,
  fijo = true,
  className,
  style,
  children,
}) {
  const canvasRef = useRef(null);
  // Guardamos las props en refs para cambiarlas sin reiniciar la animación
  const temaRef = useRef(tema);
  const velRef = useRef(velocidad);
  temaRef.current = tema;
  velRef.current = velocidad;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, raf = 0, last = performance.now(), t = 0;

    const P = Array.from({ length: particulas }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.8 + 0.4,
      s: Math.random() * 0.00012 + 0.00003,
      o: Math.random() * Math.PI * 2,
    }));

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    size();

    const getTema = () =>
      typeof temaRef.current === "string" ? TEMAS[temaRef.current] || TEMAS.azul : temaRef.current;

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
              H * o.y + off +
              d * o.tilt * H +
              d * d * o.bend * H +
              Math.sin(u * Math.PI * o.f + ph) * o.amp * H +
              Math.sin(u * Math.PI * o.f * 2.3 - ph * 1.4) * o.amp * H * 0.35;
            px === -20 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
          }
          const a = o.alpha * (1 - Math.abs(k - 0.5) * 1.6);
          ctx.strokeStyle = `rgba(${R},${G},${B},${Math.max(a, 0.015)})`;
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const puntos = (T, dt) => {
      const [R, G, B] = T.w;
      for (const p of P) {
        p.y -= p.s * dt;
        p.x += Math.sin(t * 0.0002 + p.o) * 0.00002 * dt;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        const tw = 0.45 + 0.55 * Math.sin(t * 0.002 + p.o);
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${R},${G},${B},${0.35 * tw + 0.1})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${R},${G},${B},0.8)`;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    const frame = (now) => {
      const dt = Math.min(now - last, 50) * velRef.current;
      last = now;
      t += dt;
      const T = getTema();
      fondo(T);
      ondas(T);
      puntos(T, dt);
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [particulas]);

  const contenedor = fijo
    ? { position: "fixed", inset: 0, zIndex: -1, ...style }
    : { position: "relative", overflow: "hidden", ...style };

  return (
    <div className={className} style={contenedor}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      />
      {children && <div style={{ position: "relative", zIndex: 1, height: "100%" }}>{children}</div>}
    </div>
  );
}
