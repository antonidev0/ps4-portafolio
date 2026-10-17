import { useNavigate } from "react-router";
import PantallaBienvenida from "../components/PantallaBienvenida/PantallaBienvenida";

export default function BienvenidaPage() {
  const navigate = useNavigate();

  return (
    <PantallaBienvenida
      marca="ToniDev"
      titulo="Benvenuto Toroo"
      subtitulo="Pulsa cualquier tecla o toca la pantalla para empezar."
      onEmpezar={() => navigate("/menu")}
    />
  );
}
