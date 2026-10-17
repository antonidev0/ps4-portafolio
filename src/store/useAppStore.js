import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { TEMA_POR_DEFECTO, TEMAS } from "../components/Fondo/temas";
import { detectarIdioma, IDIOMAS } from "../i18n/idiomas";

/**
 * Estado global de la aplicación.
 *
 *   tema         tema del fondo animado (se guarda en localStorage)
 *   idioma       idioma preferido, "es" | "en" | "it": la primera vez se toma
 *                del navegador y después se guarda en localStorage. Al entrar en /
 *                se redirige a /en/ o /it/ según este valor. El idioma de cada
 *                página lo decide su URL (ver useIdioma)
 *   indiceMenu   tarjeta seleccionada en el menú; se conserva al entrar y
 *                salir de una sección para volver a la misma tarjeta
 */
export const useAppStore = create(
  persist(
    (set) => ({
      tema: TEMA_POR_DEFECTO,
      idioma: detectarIdioma(),
      indiceMenu: 0,
      setTema: (tema) => set({ tema: TEMAS[tema] ? tema : TEMA_POR_DEFECTO }),
      setIdioma: (idioma) => {
        if (IDIOMAS[idioma]) set({ idioma });
      },
      setIndiceMenu: (indiceMenu) => set({ indiceMenu }),
    }),
    {
      name: "portafolio-tonidev",
      storage: createJSONStorage(() => localStorage),
      // Solo las preferencias se guardan entre visitas
      partialize: ({ tema, idioma }) => ({ tema, idioma }),
    },
  ),
);
