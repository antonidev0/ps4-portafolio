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

/**
 * Ruta de la app en un idioma. El idioma por defecto va sin prefijo:
 *   rutaEnIdioma("/menu", "es") → "/menu"
 *   rutaEnIdioma("/menu", "en") → "/en/menu"
 *   rutaEnIdioma("/", "it")     → "/it/"
 */
export function rutaEnIdioma(ruta, idioma) {
  const prefijo = idioma === IDIOMA_POR_DEFECTO || !IDIOMAS[idioma] ? "" : `/${idioma}`;
  return ruta === "/" ? `${prefijo}/` : `${prefijo}${ruta}`;
}

/** Quita el prefijo de idioma de una ruta: "/en/menu" → "/menu", "/it" → "/". */
export function quitarIdioma(pathname) {
  const [, primero, ...resto] = pathname.split("/");
  if (primero === IDIOMA_POR_DEFECTO || !IDIOMAS[primero]) return pathname;
  return `/${resto.join("/")}`;
}

/**
 * Buscadores y vistas previas de redes sociales. A ellos no se les redirige
 * según el idioma del navegador: Googlebot dice hablar inglés y, si se le
 * redirigiera, nunca indexaría la versión en español.
 */
export function esRobot() {
  if (typeof navigator === "undefined") return false;
  return /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|linkedin|embedly/i.test(
    navigator.userAgent,
  );
}
