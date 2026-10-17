import { redirect } from "react-router";
import Layout from "./components/Layout";
import { esRobot, IDIOMA_POR_DEFECTO, IDIOMAS, rutaEnIdioma } from "./i18n/idiomas";
import BienvenidaPage from "./pages/BienvenidaPage";
import ErrorPage from "./pages/ErrorPage";
import MenuPage from "./pages/MenuPage";
import NoEncontradaPage from "./pages/NoEncontradaPage";
import SeccionPage from "./pages/SeccionPage";
import { useAppStore } from "./store/useAppStore";

// Rutas de la aplicación (en español; en inglés e italiano van bajo /en y /it):
//   /                      pantalla de bienvenida
//   /menu                  menú de tarjetas
//   /juegos/dachshund-3d   juego Dachshund 3D a pantalla completa (se carga bajo demanda)
//   /:seccionId            página de cada sección (ver src/data/secciones.js)
//
// Cada idioma tiene su propia URL para que los buscadores indexen las tres versiones.
// handle.idioma dice en qué idioma está la página (lo lee useIdioma).
// handle.sinFondo oculta el fondo animado en las rutas que ocupan toda la pantalla.

// Al entrar en / se va al idioma guardado o al del navegador (salvo a los buscadores)
function irAlIdiomaPreferido() {
  const { idioma } = useAppStore.getState();
  if (idioma !== IDIOMA_POR_DEFECTO && !esRobot()) return redirect(rutaEnIdioma("/", idioma));
  return null;
}

const rutasDeIdioma = (idioma) => ({
  path: rutaEnIdioma("/", idioma),
  handle: { idioma },
  children: [
    {
      index: true,
      element: <BienvenidaPage />,
      loader: idioma === IDIOMA_POR_DEFECTO ? irAlIdiomaPreferido : undefined,
    },
    { path: "menu", element: <MenuPage /> },
    {
      path: "juegos/dachshund-3d",
      handle: { sinFondo: true },
      lazy: async () => ({ Component: (await import("./pages/DachshundPage")).default }),
    },
    { path: ":seccionId", element: <SeccionPage /> },
    { path: "*", element: <NoEncontradaPage /> },
  ],
});

export const routes = [
  {
    element: <Layout />,
    errorElement: <ErrorPage />,
    hydrateFallbackElement: null,
    children: Object.keys(IDIOMAS).map(rutasDeIdioma),
  },
];
