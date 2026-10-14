import OndasFondo from './components/Fondo/OndasFondo';
import AudioFondo from './components/audioFondo/AudioFondo';
import TopBar from './components/TopBar';
import BottomBar from './components/BottomBar';
import Toast from './components/Toast';
import HomeScreen from './components/HomeScreen';
import { useToast } from './hooks/useToast';

export default function App() {
  const { toasts, showToast } = useToast();

  return (
    <>
      <OndasFondo />
      <AudioFondo src="/audio/intro-ps4.mp3" volumen={0.4} />
      <TopBar />
      <div className="relative z-10 h-[calc(100vh-100px)] flex flex-col px-10">
        <HomeScreen showToast={showToast} />
      </div>
      <BottomBar />
      <Toast toasts={toasts} />
    </>
  );
}
