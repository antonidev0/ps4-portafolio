import { useSyncExternalStore } from "react";

const suscribir = (callback) => {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
};

/** Ancho actual de la ventana en px; se actualiza al redimensionar. */
export function useAnchoVentana() {
  return useSyncExternalStore(
    suscribir,
    () => window.innerWidth,
    () => 1280,
  );
}
