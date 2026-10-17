import { useNavigate } from "react-router";
import DachshundGame from "../apps/dachshund-3d/components/DachshundGame";

// Se carga bajo demanda desde routes.jsx: Three.js solo se descarga al abrir el juego
export default function DachshundPage() {
  const navigate = useNavigate();

  return (
    <main className="fixed inset-0 z-30 animate-abre-juego motion-reduce:animate-none">
      <h1 className="sr-only">Dachshund 3D</h1>
      <DachshundGame onExit={() => navigate("/menu")} exitLabel="Volver al portafolio" />
    </main>
  );
}
