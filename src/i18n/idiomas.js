// Idiomas disponibles. El primero es el idioma por defecto.
export const IDIOMAS = {
  es: { nombre: "Español", corto: "ES" },
  en: { nombre: "English", corto: "EN" },
  it: { nombre: "Italiano", corto: "IT" },
};

export const IDIOMA_POR_DEFECTO = "es";

/** Primer idioma del navegador que esté disponible, o el idioma por defecto. */
export function detectarIdioma() {
  const preferidos =
    typeof navigator === "undefined" ? [] : (navigator.languages ?? [navigator.language]);
  for (const codigo of preferidos) {
    const base = codigo?.slice(0, 2).toLowerCase();
    if (IDIOMAS[base]) return base;
  }
  return IDIOMA_POR_DEFECTO;
}

/**
 * Devuelve el texto en el idioma pedido. Acepta un texto simple (igual en todos
 * los idiomas) o un objeto { es, en, it }; si falta una traducción, usa el español.
 */
export function traducir(valor, idioma) {
  if (valor == null || typeof valor === "string") return valor;
  return valor[idioma] ?? valor[IDIOMA_POR_DEFECTO];
}
