import { useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { traducir } from "./idiomas";
import { TEXTOS } from "./textos";

/**
 * Idioma actual y funciones para traducir.
 *
 *   const { idioma, t, tr } = useIdioma();
 *   t("volverMenu")        texto fijo de la interfaz (src/i18n/textos.js)
 *   tr(seccion.titulo)     texto de los datos: simple o { es, en, it }
 */
export function useIdioma() {
  const idioma = useAppStore((s) => s.idioma);
  return useMemo(() => {
    const textos = TEXTOS[idioma] ?? TEXTOS.es;
    return {
      idioma,
      t: (clave) => textos[clave] ?? TEXTOS.es[clave],
      tr: (valor) => traducir(valor, idioma),
    };
  }, [idioma]);
}
