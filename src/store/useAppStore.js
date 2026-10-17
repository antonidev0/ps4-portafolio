import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { TEMA_POR_DEFECTO, TEMAS } from "../components/Fondo/temas";

/**
 * Estado global de la aplicación.
 *
 *   tema         tema del fondo animado (se guarda en localStorage)
 *   indiceMenu   tarjeta seleccionada en el menú; se conserva al entrar y
 *                salir de una sección para volver a la misma tarjeta
 */
export const useAppStore = create(
  persist(
    (set) => ({
      tema: TEMA_POR_DEFECTO,
      indiceMenu: 0,
      setTema: (tema) => set({ tema: TEMAS[tema] ? tema : TEMA_POR_DEFECTO }),
      setIndiceMenu: (indiceMenu) => set({ indiceMenu }),
    }),
    {
      name: "portafolio-tonidev",
      storage: createJSONStorage(() => localStorage),
      // Solo las preferencias se guardan entre visitas
      partialize: ({ tema }) => ({ tema }),
    },
  ),
);
