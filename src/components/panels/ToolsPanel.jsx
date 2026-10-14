import { useState } from 'react';
import { tools } from '../../data/tools';

export default function ToolsPanel({ showToast }) {
  const [active, setActive] = useState({});

  function toggle(id, name) {
    const next = !active[id];
    setActive((prev) => ({ ...prev, [id]: next }));
    showToast(`${name} ${next ? 'enabled' : 'disabled'}`);
  }

  return (
    <div className="panel-inner">
      {tools.map((t) => {
        const on = !!active[t.id];
        return (
          <div
            key={t.id}
            onClick={() => toggle(t.id, t.name)}
            className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.08] cursor-pointer transition-colors duration-200 last:border-b-0 hover:bg-white/[0.04] active:bg-white/[0.08]"
          >
            <div className="w-11 h-11 rounded-[10px] flex items-center justify-center flex-shrink-0 text-ps-gray bg-white/[0.06]">
              {t.icon}
            </div>
            <div className="flex-1">
              <span className="block text-[15px] font-medium mb-0.5">{t.name}</span>
              <span className="block text-xs text-ps-gray">{t.desc}</span>
            </div>
            <div
              className={`w-11 h-6 rounded-xl relative transition-colors duration-300 flex-shrink-0 ${
                on ? 'bg-ps-blue' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-[18px] h-[18px] rounded-full absolute top-[3px] transition-all duration-300 ${
                  on ? 'left-[23px] bg-white' : 'left-[3px] bg-white/40'
                }`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
