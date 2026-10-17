import { Link } from "react-router";

export default function NoEncontradaPage({
  titulo = "Página no encontrada",
  mensaje = "La dirección que has abierto no existe.",
}) {
  return (
    <main className="grid min-h-dvh place-content-center gap-6 px-4 text-center">
      <h1 className="text-[clamp(28px,4vw,44px)] font-light">{titulo}</h1>
      <p className="text-white/70">{mensaje}</p>
      <Link
        to="/menu"
        className="mx-auto rounded-full border border-white/30 px-5 py-2 transition-colors hover:bg-white/10"
      >
        Ir al menú
      </Link>
    </main>
  );
}
