import { Panel } from './ui';

function Toggle({ label, checked, onChange }) {
  return (
    <label className="dg-toggle">
      <span>{label}</span>
      <input type="checkbox" data-nav="" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="dg-toggle__track" aria-hidden="true">
        <span className="dg-toggle__thumb" />
      </span>
    </label>
  );
}

function Slider({ label, value, onChange, disabled }) {
  return (
    <label className={`dg-slider${disabled ? ' is-disabled' : ''}`}>
      <span className="dg-slider__label">
        {label}
        <output>{Math.round(value * 100)}%</output>
      </span>
      <input
        type="range"
        data-nav=""
        min="0"
        max="100"
        step="5"
        value={Math.round(value * 100)}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
      />
    </label>
  );
}

/** Ajustes de audio. Se usan desde el menú principal y desde la pausa. */
export function SoundControls({ audio, onChange }) {
  return (
    <div className="dg-sound">
      <Toggle label="Silenciar todo (M)" checked={audio.muted} onChange={(v) => onChange({ muted: v })} />
      <Slider label="Volumen general" value={audio.master} disabled={audio.muted} onChange={(v) => onChange({ master: v })} />
      <Toggle label="Música" checked={audio.musicOn} onChange={(v) => onChange({ musicOn: v })} />
      <Slider label="Volumen de la música" value={audio.music} disabled={!audio.musicOn} onChange={(v) => onChange({ music: v })} />
      <Toggle label="Efectos" checked={audio.sfxOn} onChange={(v) => onChange({ sfxOn: v })} />
      <Slider label="Volumen de los efectos" value={audio.sfx} disabled={!audio.sfxOn} onChange={(v) => onChange({ sfx: v })} />
    </div>
  );
}

export default function SoundSettings({ audio, onChange, onBack }) {
  return (
    <Panel title="Configuración de sonido" subtitle="La música y los efectos se generan en el navegador." onBack={onBack}>
      <SoundControls audio={audio} onChange={onChange} />
    </Panel>
  );
}
