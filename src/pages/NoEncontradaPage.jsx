import { Link } from "react-router";
import { useIdioma } from "../i18n/useIdioma";

export default function NoEncontradaPage({ titulo, mensaje }) {
  const { t, ruta } = useIdioma();

  return (
    <main className="grid min-h-dvh place-content-center gap-6 px-4 text-center">
      <h1 className="text-[clamp(28px,4vw,44px)] font-light">
        {titulo ?? t("noEncontradaTitulo")}
      </h1>
      <p className="text-white/70">{mensaje ?? t("noEncontradaMensaje")}</p>
      <Link
        to={ruta("/menu")}
        className="mx-auto rounded-full border border-white/30 px-5 py-2 transition-colors hover:bg-white/10"
      >
        {t("irMenu")}
      </Link>
    </main>
  );
}
