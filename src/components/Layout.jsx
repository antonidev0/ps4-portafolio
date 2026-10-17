import { Outlet, useMatches } from "react-router";
import OndasFondo from "./Fondo/OndasFondo";
import { useAppStore } from "../store/useAppStore";

/** Estructura común de todas las páginas: fondo animado y la página actual encima. */
export default function Layout() {
  const tema = useAppStore((s) => s.tema);
  // Las rutas a pantalla completa (juegos) no necesitan el fondo: así no se dibuja de más
  const sinFondo = useMatches().some((m) => m.handle?.sinFondo);

  return (
    <>
      {!sinFondo && <OndasFondo tema={tema} />}
      <Outlet />
    </>
  );
}
