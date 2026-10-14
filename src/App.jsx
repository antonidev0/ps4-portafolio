import { useState } from 'react';
import OndasFondo from './components/Fondo/OndasFondo';
import AudioFondo from './components/audioFondo/AudioFondo';
import TopBar from './components/TopBar';
import BottomBar from './components/BottomBar';
import Toast from './components/Toast';
import HomeScreen from './components/HomeScreen';
import PayloadsPanel from './components/panels/PayloadsPanel';
import ToolsPanel from './components/panels/ToolsPanel';
import SystemInfoPanel from './components/panels/SystemInfoPanel';
import GuidePanel from './components/panels/GuidePanel';
import CreditsPanel from './components/panels/CreditsPanel';
import { useToast } from './hooks/useToast';

const panels = {
  payloads: PayloadsPanel,
  tools: ToolsPanel,
  info: SystemInfoPanel,
  guide: GuidePanel,
  credits: CreditsPanel,
};

const sectionNames = {
  payloads: 'Payloads',
  tools: 'Herramientas',
  info: 'Sistema',
  guide: 'Guía',
  credits: 'Créditos',
};

export default function App() {
  const [activeSection, setActiveSection] = useState(null); // null => Home
  const { toasts, showToast } = useToast();

  const ActivePanel = activeSection ? panels[activeSection] : null;

  return (
    <>
      <OndasFondo />
      <AudioFondo src="/audio/intro-ps4.mp3" volumen={0.4} />
      <TopBar />
      <div className="relative z-10 h-[calc(100vh-100px)] flex flex-col px-10">
        {activeSection ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setActiveSection(null)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-white/70 text-xs hover:bg-white/10 hover:text-white transition-colors"
              >
                <span aria-hidden="true">←</span> Inicio
              </button>
              <span className="text-xs uppercase tracking-[2px] text-white/40 font-semibold">
                {sectionNames[activeSection]}
              </span>
            </div>
            <div className="flex-1 overflow-hidden relative animate-fade-up">
              <ActivePanel key={activeSection} showToast={showToast} />
            </div>
          </>
        ) : (
          <HomeScreen onSelect={setActiveSection} showToast={showToast} />
        )}
      </div>
      <BottomBar />
      <Toast toasts={toasts} />
    </>
  );
}
