import { useCallback } from 'react';
import TarjetasMenu from './TarjetasMenu/TarjetasMenu';

const recentGames = [
  { title: "Marvel's Spider-Man 2", genre: 'AcciÃ³n y aventura', accent: 'from-red-700 via-blue-700 to-indigo-900' },
  { title: 'God of War RagnarÃ¶k', genre: 'AcciÃ³n y aventura', accent: 'from-amber-700 via-orange-800 to-red-900' },
  { title: 'Horizon Forbidden West', genre: 'RPG de acciÃ³n', accent: 'from-emerald-600 via-teal-700 to-cyan-900' },
  { title: 'The Last of Us Part I', genre: 'AcciÃ³n y aventura', accent: 'from-gray-700 via-stone-800 to-black' },
  { title: 'Final Fantasy XVI', genre: 'RPG', accent: 'from-indigo-600 via-purple-800 to-black' },
];

const tarjetas = [
  { id: 'games', titulo: 'Juegos', color: 'linear-gradient(160deg, #1b4fc4, #0a2a8a)', icono: <span style={{ fontSize: 42 }}>ðŸŽ®</span>, etiqueta: 'Biblioteca' },
  { id: 'tv', titulo: 'TV y Video', color: 'linear-gradient(160deg, #c41b1b, #8a0a0a)', icono: <span style={{ fontSize: 42 }}>â–¶ï¸</span>, etiqueta: 'Streaming' },
  { id: 'library', titulo: 'Biblioteca', color: 'linear-gradient(160deg, #1bc47a, #0a8a4a)', icono: <span style={{ fontSize: 42 }}>ðŸ“š</span>, etiqueta: 'Compras' },
  { id: 'friends', titulo: 'Amigos', color: 'linear-gradient(160deg, #7a1bc4, #4a0a8a)', icono: <span style={{ fontSize: 42 }}>ðŸ‘¥</span>, etiqueta: 'En lÃ­nea' },
  { id: 'store', titulo: 'PS Store', color: 'linear-gradient(160deg, #c4a01b, #8a6a0a)', icono: <span style={{ fontSize: 42 }}>ðŸ›’</span>, etiqueta: 'Nuevos' },
  { id: 'settings', titulo: 'Ajustes', color: 'linear-gradient(160deg, #5a5a5a, #2a2a2a)', icono: <span style={{ fontSize: 42 }}>âš™ï¸</span>, etiqueta: 'Sistema' },
];

const mediaApps = [
  { title: 'Netflix', accent: 'from-red-700 to-black' },
  { title: 'YouTube', accent: 'from-red-600 to-red-900' },
  { title: 'Spotify', accent: 'from-green-600 to-green-900' },
  { title: 'Disney+', accent: 'from-blue-700 to-indigo-900' },
];

export default function HomeScreen({ showToast }) {
  const openApp = useCallback(
    (app) => {
      if (showToast) showToast(app?.label || app?.titulo || 'Abierto');
    },
    [showToast],
  );

  const featured = recentGames[0];

  return (
    <div className="flex-1 overflow-y-auto pr-2 animate-fade-up">
      {/* Featured hero */}
      <div
        className="relative rounded-2xl overflow-hidden mb-8 border border-white/10"
        style={{
          height: 260,
          background: 'linear-gradient(120deg, #1a1a3a 0%, #0e1a2b 60%, #0a1225 100%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(circle at 80% 30%, rgba(0,187,255,0.35), transparent 50%), radial-gradient(circle at 20% 80%, rgba(120,80,220,0.3), transparent 60%)',
          }}
        />
        <div className="relative z-10 h-full flex items-center px-10 gap-8">
          <div className="flex-shrink-0 w-44 h-44 rounded-2xl bg-gradient-to-br from-red-700 via-blue-700 to-indigo-900 border border-white/15 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
            SM
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] uppercase tracking-[3px] text-ps-highlight font-semibold">
              Destacado
            </span>
            <h2 className="text-3xl font-bold mt-1 mb-2">{featured.title}</h2>
            <p className="text-sm text-white/60 max-w-xl leading-relaxed">
              Juega la Ãºltima aventura de Marvel en tu PS4. Disponible en biblioteca.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => openApp({ label: featured.title })}
                className="px-5 py-2.5 rounded-lg bg-ps-blue text-white text-sm font-semibold hover:bg-ps-blue-light transition-colors shadow-[0_4px_16px_rgba(0,114,206,0.4)]"
              >
                Jugar
              </button>
              <button
                onClick={() => openApp({ label: `InformaciÃ³n de ${featured.title}` })}
                className="px-5 py-2.5 rounded-lg bg-white/[0.08] border border-white/15 text-white text-sm font-semibold hover:bg-white/15 transition-colors"
              >
                InformaciÃ³n
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* App carousel */}
      <div className="mb-3">
        <span className="text-[11px] uppercase tracking-[2.5px] text-white/40 font-semibold">
          Aplicaciones
        </span>
      </div>
      <TarjetasMenu
        items={tarjetas}
        tamano={170}
        inicial={1}
        onAbrir={(item) => {
          if (showToast) showToast(item.titulo);
        }}
      />

      {/* Recent games shelf */}
      <div className="mt-6">
        <div className="mb-3">
          <span className="text-[11px] uppercase tracking-[2.5px] text-white/40 font-semibold">
            Recientes
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-3">
          {recentGames.map((g) => (
            <div
              key={g.title}
              onClick={() => openApp({ label: g.title })}
              className="flex-shrink-0 w-40 rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.05] hover:bg-white/[0.1] cursor-pointer transition-colors"
            >
              <div className={`h-44 bg-gradient-to-br ${g.accent} flex items-end p-3`}>
                <span className="text-[11px] font-semibold text-white/90 drop-shadow">{g.title}</span>
              </div>
              <div className="px-3 py-2">
                <span className="block text-[10px] text-ps-gray truncate">{g.genre}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Media shelf */}
      <div className="mt-4">
        <div className="mb-3">
          <span className="text-[11px] uppercase tracking-[2.5px] text-white/40 font-semibold">
            TV y Video
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-3">
          {mediaApps.map((m) => (
            <div
              key={m.title}
              onClick={() => openApp({ label: m.title })}
              className="flex-shrink-0 w-40 rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.05] hover:bg-white/[0.1] cursor-pointer transition-colors"
            >
              <div className={`h-24 bg-gradient-to-br ${m.accent} flex items-center justify-center`}>
                <span className="text-[13px] font-semibold text-white/90">{m.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
