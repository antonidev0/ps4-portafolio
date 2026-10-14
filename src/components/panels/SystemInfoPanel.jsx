import { systemInfo } from '../../data/systemInfo';

export default function SystemInfoPanel() {
  return (
    <div className="panel-inner">
      {systemInfo.map((row) => (
        <div
          key={row.label}
          className="flex justify-between items-center px-6 py-3.5 border-b border-white/[0.08] last:border-b-0"
        >
          <span className="text-sm text-ps-gray">{row.label}</span>
          <span className={`text-sm font-medium ${row.highlight ? 'text-ps-green' : 'text-white'}`}>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
