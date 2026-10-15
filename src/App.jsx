import OndasFondo from "./components/Fondo/OndasFondo";
import AudioFondo from "./components/audioFondo/AudioFondo";
import TarjetasMenu from "./components/TarjetasMenu/TarjetasMenu";
import useSonidos from "./hooks/useSonidos";
import { menu } from "./data/menu";

// Archivos en public/sonidos/
const SONIDOS = {
  mover: "/sonidos/mover.mp3",
  seleccionar: "/sonidos/seleccionar.mp3",
  atras: "/sonidos/atras.mp3",
};

export default function App() {
  const sonar = useSonidos(SONIDOS, { volumen: 0.6 });

  const abrir = (item) => {
    sonar("seleccionar");
    console.log("Abrir:", item.titulo);
  };

  const atras = () => {
    sonar("atras");
    console.log("Atrás");
  };

  return (
    <>
      <OndasFondo />
      <AudioFondo src="/audio/intro-ps4.mp3" volumen={0.4} />
      <main style={{ paddingTop: "12vh" }}>
        <TarjetasMenu
          items={menu}
          onCambio={() => sonar("mover")}
          onAbrir={abrir}
          onAtras={atras}
        />
      </main>
    </>
  );
}
