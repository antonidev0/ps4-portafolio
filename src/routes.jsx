import Layout from "./components/Layout";
import BienvenidaPage from "./pages/BienvenidaPage";
import ErrorPage from "./pages/ErrorPage";
import MenuPage from "./pages/MenuPage";
import NoEncontradaPage from "./pages/NoEncontradaPage";
import SeccionPage from "./pages/SeccionPage";

// Rutas de la aplicación:
//   /                      pantalla de bienvenida
//   /menu                  menú de tarjetas
//   /juegos/dachshund-3d   juego Dachshund 3D a pantalla completa (se carga bajo demanda)
//   /:seccionId            página de cada sección (ver src/data/secciones.js)
//
// handle.sinFondo oculta el fondo animado en las rutas que ocupan toda la pantalla.
export const routes = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <BienvenidaPage /> },
      { path: "menu", element: <MenuPage /> },
      {
        path: "juegos/dachshund-3d",
        handle: { sinFondo: true },
        lazy: async () => ({ Component: (await import("./pages/DachshundPage")).default }),
      },
      { path: ":seccionId", element: <SeccionPage /> },
      { path: "*", element: <NoEncontradaPage /> },
    ],
  },
];
