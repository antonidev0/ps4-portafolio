import { useNavigate } from "react-router";
import DachshundGame from "../apps/dachshund-3d/components/DachshundGame";
import { useIdioma } from "../i18n/useIdioma";

// Se carga bajo demanda desde routes.jsx: Three.js solo se descarga al abrir el juego
export default function DachshundPage() {
  const navigate = useNavigate();
  const { t } = useIdioma();

  // lang="es": el juego solo está en español
  return (
    <main lang="es" className="fixed inset-0 z-30 animate-abre-juego motion-reduce:animate-none">
      <h1 className="sr-only">Dachshund 3D</h1>
      <DachshundGame onExit={() => navigate("/menu")} exitLabel={t("volverPortafolio")} />
    </main>
  );
}
