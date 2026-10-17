import { useEffect } from "react";
import { useNavigate } from "react-router";
import { detenerMusica, efecto, iniciarMusica, precargarEfectos } from "../audio/sonidos";
import BotonSonido from "../components/BotonSonido";
import PantallaBienvenida from "../components/PantallaBienvenida/PantallaBienvenida";
import SelectorIdioma from "../components/SelectorIdioma";
import { useIdioma } from "../i18n/useIdioma";
import { useAppStore } from "../store/useAppStore";

const FUNDIDO = 900; // ms; la música y la pantalla se desvanecen a la vez

export default function BienvenidaPage() {
  const navigate = useNavigate();
  const { t, ruta } = useIdioma();
  const sonido = useAppStore((s) => s.sonido);

  // La música solo suena en la bienvenida: se apaga al entrar al portafolio
  useEffect(() => {
    if (!sonido) {
      detenerMusica(300);
      return;
    }
    precargarEfectos();
    iniciarMusica();
    // Si el navegador bloqueó el audio automático, empieza al pulsar el selector o el botón
    const reintentar = (e) => {
      if (e.target.closest?.("[data-sin-atajos]")) iniciarMusica();
    };
    window.addEventListener("pointerdown", reintentar);
    return () => {
      window.removeEventListener("pointerdown", reintentar);
      detenerMusica(FUNDIDO);
    };
  }, [sonido]);

  return (
    <>
      <PantallaBienvenida
        marca="ToniDev"
        titulo={t("bienvenidaTitulo")}
        subtitulo={t("bienvenidaSubtitulo")}
        duracion={FUNDIDO}
        onPulsar={() => {
          efecto("seleccionar");
          detenerMusica(FUNDIDO);
        }}
        onEmpezar={() => navigate(ruta("/menu"))}
      />
      <div className="fixed right-[calc(clamp(20px,5vw,56px)+env(safe-area-inset-right,0px))] top-[calc(clamp(20px,5vh,48px)+env(safe-area-inset-top,0px))] z-30 flex items-center gap-2">
        <BotonSonido />
        <SelectorIdioma />
      </div>
    </>
  );
}
