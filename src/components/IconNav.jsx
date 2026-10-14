import { useEffect, useCallback } from 'react';

const sections = [
  {
    id: 'payloads',
    label: 'Payloads',
    icon: (
      <svg viewBox="0 0 48 48" width="48" height="48">
        <rect x="8" y="6" width="32" height="36" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M16 16h16M16 22h16M16 28h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: (
      <svg viewBox="0 0 48 48" width="48" height="48">
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
    label: 'System Info',
    icon: (
      <svg viewBox="0 0 48 48" width="48" height="48">
        <circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="24" y1="20" x2="24" y2="32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="15" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'guide',
    label: 'Guide',
    icon: (
      <svg viewBox="0 0 48 48" width="48" height="48">
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
    label: 'Credits',
    icon: (
      <svg viewBox="0 0 48 48" width="48" height="48">
        <circle cx="24" cy="18" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 40c0-6.6 5.4-12 12-12s12 5.4 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function IconNav({ activeSection, onSelect }) {
  const currentIdx = sections.findIndex((s) => s.id === activeSection);

  const handleKey = useCallback(
    (e) => {
      if (e.key === 'ArrowRight' || e.key === 'd') {
        e.preventDefault();
        const next = (currentIdx + 1) % sections.length;
        onSelect(sections[next].id);
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        e.preventDefault();
        const prev = (currentIdx - 1 + sections.length) % sections.length;
        onSelect(sections[prev].id);
      }
    },
    [currentIdx, onSelect],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div className="mb-6">
      <div className="flex gap-6 mb-4 pl-1">
        <span className="text-xs uppercase tracking-[2px] font-semibold text-white/80">Exploit Host</span>
        <span className="text-xs uppercase tracking-[2px] font-semibold text-white/30">9.00</span>
      </div>
      <div className="flex gap-2 items-end py-2.5">
        {sections.map((s) => {
          const isActive = s.id === activeSection;
          return (
            <div
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`flex flex-col items-center gap-2 cursor-pointer transition-transform duration-[250ms] ${
                isActive ? 'scale-110' : ''
              }`}
            >
              <div
                className={`w-20 h-20 rounded-[14px] flex items-center justify-center backdrop-blur-[6px] border-2 transition-all duration-[250ms] ${
                  isActive
                    ? 'bg-white/[0.14] border-ps-highlight text-white shadow-[0_0_20px_rgba(0,187,255,0.15),0_8px_30px_rgba(0,0,0,0.3)]'
                    : 'bg-white/[0.06] border-transparent text-white/50 hover:bg-white/10 hover:text-white/70'
                }`}
              >
                {s.icon}
              </div>
              <span
                className={`text-[11px] tracking-[0.5px] text-center transition-colors duration-[250ms] ${
                  isActive ? 'text-white/90' : 'text-white/30'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
