import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { TEMAS } from "../components/Fondo/temas";
import { buscarSeccion } from "../data/secciones";
import { IconoAtras } from "../icons/iconos";
import { useAppStore } from "../store/useAppStore";
import NoEncontradaPage from "./NoEncontradaPage";

export default function SeccionPage() {
  const { seccionId } = useParams();
  const navigate = useNavigate();
  const seccion = buscarSeccion(seccionId);

  // Escape o Retroceso vuelven al menú, como en la consola
  useEffect(() => {
    const alPulsar = (e) => {
      if (e.key !== "Escape" && e.key !== "Backspace") return;
      if (e.target.closest?.("input, textarea, [contenteditable]")) return;
      e.preventDefault();
      navigate("/menu");
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [navigate]);

  if (!seccion) return <NoEncontradaPage />;

  const { Icono } = seccion;

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 py-[8vh] sm:px-8">
      <Link
        to="/menu"
        className="mb-6 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        <IconoAtras width={16} height={16} />
        Volver al menú <span className="hidden text-white/40 sm:inline">(Esc)</span>
      </Link>

      <article className="animate-sube-suave rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur-md motion-reduce:animate-none sm:p-10">
        <header className="mb-6 flex items-center gap-4">
          {Icono && <Icono width={40} height={40} className="shrink-0 text-white/80" />}
          <h1 className="text-[clamp(28px,4vw,44px)] font-light leading-tight">{seccion.titulo}</h1>
        </header>

        {seccion.descripcion && (
          <p className="mb-8 text-lg font-light text-white/80">{seccion.descripcion}</p>
        )}

        {seccion.tipo === "ajustes" ? <Ajustes /> : <Bloques items={seccion.items ?? []} />}
      </article>
    </main>
  );
}

function Bloques({ items }) {
  return (
    <ul className="grid gap-4">
      {items.map((item) => (
        <li key={item.titulo} className="rounded-xl bg-white/5 p-5">
          <h2 className="text-lg font-semibold">{item.titulo}</h2>
          {item.texto && <p className="mt-1 text-white/75">{item.texto}</p>}
          {item.etiquetas?.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Tecnologías">
              {item.etiquetas.map((e) => (
                <li key={e} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  {e}
                </li>
              ))}
            </ul>
          )}
          {item.enlace && (
            <a
              href={item.enlace.url}
              target={item.enlace.url.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="mt-3 inline-block text-sky-300 underline-offset-4 hover:underline"
            >
              {item.enlace.texto}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

function Ajustes() {
  const tema = useAppStore((s) => s.tema);
  const setTema = useAppStore((s) => s.setTema);

  return (
    <fieldset>
      <legend className="mb-3 text-lg font-semibold">Color del fondo</legend>
      <div className="flex flex-wrap gap-3">
        {Object.entries(TEMAS).map(([id, t]) => (
          <label
            key={id}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
              tema === id ? "border-white bg-white/15" : "border-white/15 hover:bg-white/10"
            }`}
          >
            <input
              type="radio"
              name="tema"
              value={id}
              checked={tema === id}
              onChange={() => setTema(id)}
              className="sr-only"
            />
            <span
              className="h-6 w-6 rounded-full border border-white/30"
              style={{ background: `linear-gradient(135deg, ${t.c}, ${t.a})` }}
              aria-hidden="true"
            />
            {t.nombre}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
