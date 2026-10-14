import { useClock } from '../hooks/useClock';

export default function TopBar() {
  const time = useClock();

  return (
    <div className="relative z-10 flex justify-between items-center px-10 py-3.5 topbar-gradient">
      <div className="flex items-center gap-3">
        <svg width="22" height="22" viewBox="0 0 24 24" className="text-white/70" aria-hidden="true">
          <path
            d="M2 10l4-4 4 4-4 4-4-4zM12 2l4 4-4 4-4-4 4-4zM14 10l4-4 4 4-4 4-4-4zM12 12l4 4-4 4-4-4 4-4z"
            fill="currentColor"
          />
        </svg>
        <span className="text-[13px] font-semibold text-white/50 tracking-[2px]">PS4</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-3 text-white/40">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </div>
        <span className="w-px h-3.5 bg-white/15" />
        <span className="text-sm text-white/70">User1</span>
        <span className="w-px h-3.5 bg-white/15" />
        <span className="text-sm text-white/70 min-w-[46px]">{time}</span>
      </div>
    </div>
  );
}
