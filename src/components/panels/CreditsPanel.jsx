import { credits } from '../../data/credits';

export default function CreditsPanel() {
  return (
    <div className="panel-inner">
      {credits.map((c) => (
        <div
          key={c.name}
          className="flex justify-between items-center px-6 py-3.5 border-b border-white/[0.08] last:border-b-0"
        >
          <span className="text-sm font-medium">{c.name}</span>
          <span className="text-xs text-ps-gray">{c.role}</span>
        </div>
      ))}
    </div>
  );
}
