export const tools = [
  {
    id: 'ftp',
    name: 'Enable FTP Server',
    desc: 'Accede al sistema de archivos via FTP',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28">
        <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <polyline points="7 9 12 4 17 9" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="4" x2="12" y2="16" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'debug',
    name: 'Enable Debug Settings',
    desc: 'Activa opciones de desarrollo',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28">
        <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    id: 'rpi',
    name: 'Remote Package Installer',
    desc: 'Instala PKGs desde la red',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28">
        <rect x="2" y="7" width="20" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <polyline points="16 21 12 17 8 21" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="3" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'bios',
    name: 'Dump BIOS / Flash',
    desc: 'Extrae BIOS y flash memory',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28">
        <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="9" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="9" y1="2" x2="9" y2="4" stroke="currentColor" strokeWidth="1.5" />
        <line x1="15" y1="2" x2="15" y2="4" stroke="currentColor" strokeWidth="1.5" />
        <line x1="9" y1="20" x2="9" y2="22" stroke="currentColor" strokeWidth="1.5" />
        <line x1="15" y1="20" x2="15" y2="22" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];
