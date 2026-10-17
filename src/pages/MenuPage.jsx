import { useEffect } from "react";
import { useNavigate } from "react-router";
import { efecto, precargarEfectos } from "../audio/sonidos";
import SelectorIdioma from "../components/SelectorIdioma";
import TarjetasMenu from "../components/TarjetasMenu/TarjetasMenu";
import { secciones } from "../data/secciones";
import { useIdioma } from "../i18n/useIdioma";
import { useAppStore } from "../store/useAppStore";

export default function MenuPage() {
  const navigate = useNavigate();
  const { t, tr, ruta } = useIdioma();
  const indiceMenu = useAppStore((s) => s.indiceMenu);
  const setIndiceMenu = useAppStore((s) => s.setIndiceMenu);
  useEffect(precargarEfectos, []);
  const items = secciones.map((s) => ({ ...s, titulo: tr(s.titulo), etiqueta: tr(s.etiqueta) }));

  return (
    <main className="pt-[12vh]">
      <h1 className="sr-only">{t("tituloPagina")}</h1>
      <SelectorIdioma className="fixed right-[max(16px,env(safe-area-inset-right,0px))] top-[calc(16px+env(safe-area-inset-top,0px))] z-10 sm:right-10" />
      <TarjetasMenu
        items={items}
        ariaLabel={t("menu")}
        inicial={indiceMenu}
        onCambio={(_, i) => {
          efecto("mover");
          setIndiceMenu(i);
        }}
        onAbrir={(item) => {
          efecto("seleccionar");
          navigate(ruta(item.ruta ?? `/${item.id}`));
        }}
        onAtras={() => navigate(ruta("/"))}
      />
      <p className="mt-4 hidden px-10 text-sm text-white/50 sm:block">{t("ayudaMenu")}</p>
    </main>
  );
}
