import { useState, useRef } from 'react';
import { payloads } from '../../data/payloads';

export default function PayloadsPanel({ showToast }) {
  const [states, setStates] = useState({});
  const intervals = useRef({});

  function sendPayload(id, name) {
    if (states[id]?.sending) return;

    setStates((prev) => ({ ...prev, [id]: { sending: true, progress: 0, sent: false } }));
    showToast(`Sending ${name}...`);

    let width = 0;
    intervals.current[id] = setInterval(() => {
      width += Math.random() * 12 + 4;
      if (width > 95) width = 95;
      setStates((prev) => ({ ...prev, [id]: { ...prev[id], progress: width } }));
    }, 150);

    setTimeout(() => {
      clearInterval(intervals.current[id]);
      setStates((prev) => ({ ...prev, [id]: { ...prev[id], progress: 100 } }));

      setTimeout(() => {
        setStates((prev) => ({ ...prev, [id]: { sending: false, progress: 100, sent: true } }));
        showToast(`${name} sent successfully`);

        setTimeout(() => {
          setStates((prev) => ({ ...prev, [id]: { sending: false, progress: 0, sent: false } }));
        }, 3000);
      }, 300);
    }, 2200);
  }

  return (
    <div className="panel-inner">
      {payloads.map((p) => {
        const st = states[p.id] || { sending: false, progress: 0, sent: false };
        return (
          <div
            key={p.id}
            onClick={() => sendPayload(p.id, p.name)}
            className={`flex items-center gap-4 px-6 py-4 border-b border-white/[0.08] cursor-pointer transition-colors duration-200 last:border-b-0 ${
              st.sending ? 'pointer-events-none' : ''
            } ${
              p.featured
                ? 'bg-[rgba(0,114,206,0.08)] border-l-[3px] border-l-ps-blue hover:bg-[rgba(0,114,206,0.12)]'
                : 'hover:bg-white/[0.04] active:bg-white/[0.08]'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-[10px] flex items-center justify-center flex-shrink-0 ${
                p.featured
                  ? 'text-ps-gold bg-[rgba(255,204,51,0.08)]'
                  : st.sent
                    ? 'text-ps-green bg-white/[0.06]'
                    : 'text-ps-gray bg-white/[0.06]'
              }`}
            >
              {p.icon}
            </div>
            <div className="flex-1">
              <span className="block text-[15px] font-medium mb-0.5">{p.name}</span>
              <span className="block text-xs text-ps-gray">{p.desc}</span>
            </div>
            <div className="w-[100px] flex-shrink-0">
              <div
                className={`h-[3px] bg-white/[0.08] rounded-sm overflow-hidden transition-opacity duration-300 ${
                  st.progress > 0 ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div
                  className="h-full bg-ps-highlight rounded-sm shadow-[0_0_8px_rgba(0,187,255,0.3)] transition-[width] duration-100 ease-linear"
                  style={{ width: `${st.progress}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
