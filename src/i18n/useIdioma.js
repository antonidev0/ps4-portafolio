import { useMemo } from "react";
import { useLocation, useMatches, useNavigate } from "react-router";
import { useAppStore } from "../store/useAppStore";
import { IDIOMA_POR_DEFECTO, quitarIdioma, rutaEnIdioma, traducir } from "./idiomas";
import { TEXTOS } from "./textos";

/**
 * Idioma actual y funciones para traducir. El idioma lo decide la URL
 * (/ español, /en/ inglés, /it/ italiano), a través del handle de las rutas.
 *
 *   const { idioma, t, tr, ruta } = useIdioma();
 *   t("volverMenu")        texto fijo de la interfaz (src/i18n/textos.js)
 *   tr(seccion.titulo)     texto de los datos: simple o { es, en, it }
 *   ruta("/menu")          la misma ruta en el idioma actual ("/en/menu")
 */
export function useIdioma() {
  const idioma =
    useMatches().findLast((m) => m.handle?.idioma)?.handle.idioma ?? IDIOMA_POR_DEFECTO;
  return useMemo(() => {
    const textos = TEXTOS[idioma] ?? TEXTOS.es;
    return {
      idioma,
      t: (clave) => textos[clave] ?? TEXTOS.es[clave],
      tr: (valor) => traducir(valor, idioma),
      ruta: (r) => rutaEnIdioma(r, idioma),
    };
  }, [idioma]);
}

/**
 * Devuelve una función que cambia de idioma: lleva a la misma página en el
 * otro idioma y guarda la elección para las próximas visitas.
 */
export function useCambiarIdioma() {
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();
  const setIdioma = useAppStore((s) => s.setIdioma);
  return (idioma) => {
    setIdioma(idioma);
    navigate(
      { pathname: rutaEnIdioma(quitarIdioma(pathname), idioma), search, hash },
      { replace: true },
    );
  };
}
