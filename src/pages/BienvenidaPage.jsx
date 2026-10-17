import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  audioDesbloqueado,
  desbloquearAudio,
  detenerMusica,
  efecto,
  iniciarMusica,
  precargarEfectos,
} from "../audio/sonidos";
import BotonSonido from "../components/BotonSonido";
import PantallaBienvenida from "../components/PantallaBienvenida/PantallaBienvenida";
import PantallaInicio from "../components/PantallaInicio";
import SelectorIdioma from "../components/SelectorIdioma";
import { useIdioma } from "../i18n/useIdioma";
import { useAppStore } from "../store/useAppStore";

const FUNDIDO = 900; // ms; la música y la pantalla se desvanecen a la vez

export default function BienvenidaPage() {
  const navigate = useNavigate();
  const { t, ruta } = useIdioma();
  const sonido = useAppStore((s) => s.sonido);
  // "Pulsa cualquier botón" solo hace falta mientras el navegador no deja sonar la página
  const [esperando, setEsperando] = useState(() => sonido && !audioDesbloqueado());

  // La música solo suena en la bienvenida: se apaga al entrar al portafolio
  useEffect(() => {
    if (!sonido) {
      detenerMusica(300);
      return;
    }
    if (esperando) return; // empieza con el primer clic o tecla (ver empezar)
    precargarEfectos();
    iniciarMusica();
    return () => detenerMusica(FUNDIDO);
  }, [sonido, esperando]);

  const empezar = () => {
    desbloquearAudio();
    iniciarMusica();
    setEsperando(false);
  };

  return (
    <>
      {esperando ? (
        <PantallaInicio texto={t("pulsaBoton")} onPulsar={empezar} />
      ) : (
        <PantallaBienvenida
          marca="ToniDev"
          titulo={t("bienvenidaTitulo")}
          subtitulo={t("bienvenidaSubtitulo")}
          duracion={FUNDIDO}
          onPulsar={() => {
            efecto("home");
            detenerMusica(FUNDIDO);
          }}
          onEmpezar={() => navigate(ruta("/menu"))}
        />
      )}
      <div className="fixed right-[calc(clamp(20px,5vw,56px)+env(safe-area-inset-right,0px))] top-[calc(clamp(20px,5vh,48px)+env(safe-area-inset-top,0px))] z-30 flex items-center gap-2">
        <BotonSonido />
        <SelectorIdioma />
      </div>
    </>
  );
}
