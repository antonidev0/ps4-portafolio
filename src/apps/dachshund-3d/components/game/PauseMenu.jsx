import { useState } from 'react';
import { NavButton, Panel } from './ui';
import { SoundControls } from './SoundSettings';

export default function PauseMenu({ audio, onAudioChange, onResume, onRestart, onMenu }) {
  const [sound, setSound] = useState(false);
  if (sound) {
    return (
      <Panel title="Sonido" onBack={() => setSound(false)} className="dg-panel--overlay">
        <SoundControls audio={audio} onChange={onAudioChange} />
      </Panel>
    );
  }
  return (
    <Panel title="Pausa" subtitle="El perro te espera sentado." className="dg-panel--overlay dg-panel--narrow">
      <div className="dg-stack">
        <NavButton variant="primary" onClick={onResume} hint="Esc" icon="▶">Reanudar</NavButton>
        <NavButton onClick={onRestart} hint="R" icon="↻">Reiniciar</NavButton>
        <NavButton onClick={() => setSound(true)} icon="♪">Sonido</NavButton>
        <NavButton variant="ghost" onClick={onMenu} icon="☰">Menú principal</NavButton>
      </div>
    </Panel>
  );
}
