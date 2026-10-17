import { useIdioma } from "../i18n/useIdioma";
import { IconoSilencio, IconoSonido } from "../icons/iconos";
import { useAppStore } from "../store/useAppStore";

/**
 * Botón para activar o silenciar la música y los efectos.
 * Suena al activarlo (al silenciar ya no suena nada).
 * Lleva data-sin-atajos para que la bienvenida no se cierre al pulsarlo.
 */
export default function BotonSonido({ className = "" }) {
  const { t } = useIdioma();
  const sonido = useAppStore((s) => s.sonido);
  const setSonido = useAppStore((s) => s.setSonido);
  const Icono = sonido ? IconoSonido : IconoSilencio;

  return (
    <button
      type="button"
      data-sonido="click"
      data-sin-atajos
      aria-label={t("botonSonido")}
      title={t("botonSonido")}
      aria-pressed={sonido}
      onClick={() => setSonido(!sonido)}
      className={`grid h-9 w-9 place-content-center rounded-full border border-white/15 bg-black/20 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${className}`}
    >
      <Icono width={18} height={18} />
    </button>
  );
}
