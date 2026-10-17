import { useNavigate } from "react-router";
import PantallaBienvenida from "../components/PantallaBienvenida/PantallaBienvenida";
import SelectorIdioma from "../components/SelectorIdioma";
import { useIdioma } from "../i18n/useIdioma";

export default function BienvenidaPage() {
  const navigate = useNavigate();
  const { t } = useIdioma();

  return (
    <>
      <PantallaBienvenida
        marca="ToniDev"
        titulo={t("bienvenidaTitulo")}
        subtitulo={t("bienvenidaSubtitulo")}
        onEmpezar={() => navigate("/menu")}
      />
      <SelectorIdioma className="fixed right-[calc(clamp(20px,5vw,56px)+env(safe-area-inset-right,0px))] top-[calc(clamp(20px,5vh,48px)+env(safe-area-inset-top,0px))] z-30" />
    </>
  );
}
