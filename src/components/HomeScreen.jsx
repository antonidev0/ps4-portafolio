import { useState, useEffect, useCallback } from 'react';
import { payloads } from '../data/payloads';
import { tools } from '../data/tools';

const apps = [
  {
    id: 'payloads',
    label: 'Payloads',
    desc: 'Envía payloads a tu PS4',
    accent: 'from-ps-blue to-ps-blue-dark',
    glow: 'rgba(0, 114, 206, 0.35)',
    icon: (
      <svg viewBox="0 0 48 48" width="64" height="64">
        <rect x="8" y="6" width="32" height="36" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M16 16h16M16 22h16M16 28h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'tools',
    label: 'Herramientas',
    desc: 'FTP, debug, RPI y más',
    accent: 'from-purple-600 to-purple-900',
    glow: 'rgba(120, 80, 220, 0.35)',
    icon: (
      <svg viewBox="0 0 48 48" width="64" height="64">
        <circle cx="24" cy="24" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <path
          d="M24 10v4M24 34v4M10 24h4M34 24h4M14.3 14.3l2.8 2.8M30.9 30.9l2.8 2.8M14.3 33.7l2.8-2.8M30.9 17.1l2.8-2.8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'info',
    label: 'Sistema',
    desc: 'Info del firmware 9.00',
    accent: 'from-emerald-600 to-emerald-900',
    glow: 'rgba(60, 180, 120, 0.35)',
    icon: (
      <svg viewBox="0 0 48 48" width="64" height="64">
        <circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="24" y1="20" x2="24" y2="32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="15" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'guide',
    label: 'Guía',
    desc: 'Pasos de uso',
    accent: 'from-amber-500 to-amber-800',
    glow: 'rgba(230, 180, 60, 0.35)',
    icon: (
      <svg viewBox="0 0 48 48" width="64" height="64">
        <path
          d="M12 8h24a4 4 0 014 4v20a4 4 0 01-4 4H24l-6 6v-6h-6a4 4 0 01-4-4V12a4 4 0 014-4z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M18 18h12M18 24h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'credits',
    label: 'Créditos',
    desc: 'La scene PS4',
    accent: 'from-rose-600 to-rose-900',
    glow: 'rgba(200, 80, 120, 0.35)',
    icon: (
      <svg viewBox="0 0 48 48" width="64" height="64">
        <circle cx="24" cy="18" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 40c0-6.6 5.4-12 12-12s12 5.4 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function HomeScreen({ onSelect, showToast }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const openCurrent = useCallback(() => {
    const app = apps[selectedIdx];
    if (app) onSelect(app.id);
  }, [selectedIdx, onSelect]);

  const handleKey = useCallback(
    (e) => {
      if (e.key === 'ArrowRight' || e.key === 'd') {
        e.preventDefault();
        setSelectedIdx((i) => (i + 1) % apps.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        e.preventDefault();
        setSelectedIdx((i) => (i - 1 + apps.length) % apps.length);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCurrent();
      }
    },
    [openCurrent],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const featured = apps[0];

  return (
    <div className="flex-1 overflow-y-auto pr-2 animate-fade-up">
      {/* Featured hero */}
      <div
        className="relative rounded-2xl overflow-hidden mb-8 border border-white/10"
        style={{
          height: 260,
          background: 'linear-gradient(120deg, #1a3a70 0%, #0e1a2b 60%, #0a1225 100%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(circle at 80% 30%, rgba(0,187,255,0.4), transparent 50%), radial-gradient(circle at 20% 80%, rgba(0,70,160,0.3), transparent 60%)',
          }}
        />
        <div className="relative z-10 h-full flex items-center px-10 gap-8">
          <div className="flex-shrink-0 w-40 h-40 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-ps-gold backdrop-blur-md">
            {featured.icon}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] uppercase tracking-[3px] text-ps-highlight font-semibold">
              Destacado
            </span>
            <h2 className="text-3xl font-bold mt-1 mb-2">PS4 Exploit Host</h2>
            <p className="text-sm text-white/60 max-w-xl leading-relaxed">
              Host para firmware 9.00: envía payloads, activa herramientas, consulta el sistema y sigue la guía de uso.
              Jailbreak disponible y listo para usar.
            </p>
            <button
              onClick={() => onSelect('payloads')}
              className="mt-4 px-5 py-2.5 rounded-lg bg-ps-blue text-white text-sm font-semibold hover:bg-ps-blue-light transition-colors shadow-[0_4px_16px_rgba(0,114,206,0.4)]"
            >
              Abrir Payloads
            </button>
          </div>
        </div>
      </div>

      {/* Apps row */}
      <div className="mb-3">
        <span className="text-[11px] uppercase tracking-[2.5px] text-white/40 font-semibold">
          Aplicaciones
        </span>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {apps.map((a, i) => {
          const isActive = i === selectedIdx;
          return (
            <button
              key={a.id}
              onClick={() => onSelect(a.id)}
              onMouseEnter={() => setSelectedIdx(i)}
              className={`flex-shrink-0 w-36 rounded-2xl p-4 flex flex-col items-center gap-3 border-2 transition-all duration-250 cursor-pointer ${
                isActive
                  ? 'scale-105 border-ps-highlight bg-white/[0.14] shadow-[0_0_24px_rgba(0,187,255,0.25),0_10px_30px_rgba(0,0,0,0.4)]'
                  : 'border-transparent bg-white/[0.06] hover:bg-white/10 hover:text-white/70'
              }`}
              style={isActive ? { boxShadow: `0 0 30px ${a.glow}, 0 10px 30px rgba(0,0,0,0.4)` } : undefined}
            >
              <div
                className={`w-24 h-24 rounded-xl flex items-center justify-center bg-gradient-to-br ${a.accent} text-white`}
              >
                {a.icon}
              </div>
              <span
                className={`text-[12px] text-center ${
                  isActive ? 'text-white font-medium' : 'text-white/50'
                }`}
              >
                {a.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Shelves */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] uppercase tracking-[2.5px] text-white/40 font-semibold">
            Recientes
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-3">
          {payloads.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                onSelect('payloads');
                if (showToast) showToast(`Abriendo ${p.name}`);
              }}
              className="flex-shrink-0 w-40 rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.05] hover:bg-white/[0.1] cursor-pointer transition-colors"
            >
              <div className="h-24 bg-gradient-to-br from-ps-blue-dark to-ps-bg flex items-center justify-center text-ps-highlight">
                {p.icon}
              </div>
              <div className="px-3 py-2">
                <span className="block text-[12px] font-medium truncate">{p.name}</span>
                <span className="block text-[10px] text-ps-gray truncate">{p.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] uppercase tracking-[2.5px] text-white/40 font-semibold">
            Herramientas rápidas
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-3">
          {tools.map((t) => (
            <div
              key={t.id}
              onClick={() => onSelect('tools')}
              className="flex-shrink-0 w-40 rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.05] hover:bg-white/[0.1] cursor-pointer transition-colors"
            >
              <div className="h-24 bg-gradient-to-br from-purple-900/60 to-ps-bg flex items-center justify-center text-purple-300">
                {t.icon}
              </div>
              <div className="px-3 py-2">
                <span className="block text-[12px] font-medium truncate">{t.name}</span>
                <span className="block text-[10px] text-ps-gray truncate">{t.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
