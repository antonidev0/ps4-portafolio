import { useNavigate } from "react-router";
import TarjetasMenu from "../components/TarjetasMenu/TarjetasMenu";
import { secciones } from "../data/secciones";
import { useAppStore } from "../store/useAppStore";

export default function MenuPage() {
  const navigate = useNavigate();
  const indiceMenu = useAppStore((s) => s.indiceMenu);
  const setIndiceMenu = useAppStore((s) => s.setIndiceMenu);

  return (
    <main className="pt-[12vh]">
      <h1 className="sr-only">Portafolio ToniDev</h1>
      <TarjetasMenu
        items={secciones}
        inicial={indiceMenu}
        onCambio={(_, i) => setIndiceMenu(i)}
        onAbrir={(item) => navigate(item.ruta ?? `/${item.id}`)}
        onAtras={() => navigate("/")}
      />
      <p className="mt-4 hidden px-10 text-sm text-white/50 sm:block">
        ← → para moverte · Enter para abrir · Esc para volver
      </p>
    </main>
  );
}
