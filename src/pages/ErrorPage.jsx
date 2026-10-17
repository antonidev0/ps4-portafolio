import { isRouteErrorResponse, useRouteError } from "react-router";
import NoEncontradaPage from "./NoEncontradaPage";

/** Se muestra si una ruta no existe o si algún componente falla al renderizar. */
export default function ErrorPage() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NoEncontradaPage />;
  return (
    <NoEncontradaPage
      titulo="Algo salió mal"
      mensaje="Ha ocurrido un error inesperado al mostrar esta página."
    />
  );
}
