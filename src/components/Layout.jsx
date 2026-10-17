import { useEffect } from "react";
import { Outlet, useMatches } from "react-router";
import OndasFondo from "./Fondo/OndasFondo";
import { useIdioma } from "../i18n/useIdioma";
import { useAppStore } from "../store/useAppStore";

/** Estructura común de todas las páginas: fondo animado y la página actual encima. */
export default function Layout() {
  const tema = useAppStore((s) => s.tema);
  const { idioma, t } = useIdioma();
  // Las rutas a pantalla completa (juegos) no necesitan el fondo: así no se dibuja de más
  const sinFondo = useMatches().some((m) => m.handle?.sinFondo);

  // Idioma del documento (lectores de pantalla, traductores, buscadores) y título de la pestaña
  useEffect(() => {
    document.documentElement.lang = idioma;
    document.title = t("tituloPagina");
  }, [idioma, t]);

  return (
    <>
      {!sinFondo && <OndasFondo tema={tema} />}
      <Outlet />
    </>
  );
}
