import { IDIOMAS } from "../i18n/idiomas";
import { useCambiarIdioma, useIdioma } from "../i18n/useIdioma";

/**
 * Botones ES · EN · IT para cambiar el idioma (lleva a la misma página en /, /en/ o /it/).
 * Lleva data-sin-atajos para que la bienvenida y el menú no reaccionen
 * a los clics, Enter y Espacio que se hacen sobre él.
 */
export default function SelectorIdioma({ className = "" }) {
  const { idioma, t } = useIdioma();
  const cambiarIdioma = useCambiarIdioma();

  return (
    <div
      role="group"
      aria-label={t("idioma")}
      data-sin-atajos
      className={`flex gap-1 rounded-full border border-white/15 bg-black/20 p-1 backdrop-blur-sm ${className}`}
    >
      {Object.entries(IDIOMAS).map(([codigo, { nombre, corto }]) => (
        <button
          key={codigo}
          type="button"
          data-sonido="click"
          lang={codigo}
          title={nombre}
          aria-label={nombre}
          aria-pressed={idioma === codigo}
          onClick={() => cambiarIdioma(codigo)}
          className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wider transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
            idioma === codigo ? "bg-white text-[#020b2e]" : "text-white/70 hover:bg-white/10"
          }`}
        >
          {corto}
        </button>
      ))}
    </div>
  );
}
