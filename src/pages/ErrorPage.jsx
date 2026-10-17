import { isRouteErrorResponse, useRouteError } from "react-router";
import { useIdioma } from "../i18n/useIdioma";
import NoEncontradaPage from "./NoEncontradaPage";

/** Se muestra si una ruta no existe o si algún componente falla al renderizar. */
export default function ErrorPage() {
  const error = useRouteError();
  const { t } = useIdioma();
  if (isRouteErrorResponse(error) && error.status === 404) return <NoEncontradaPage />;
  return <NoEncontradaPage titulo={t("errorTitulo")} mensaje={t("errorMensaje")} />;
}
