import TarjetasMenu from './TarjetasMenu/TarjetasMenu';
import { menu } from '../data/menu';

export default function HomeScreen() {

  return (
    <div className="flex-1 overflow-y-auto pr-2 animate-fade-up">
      {/* Featured hero */}
       

      {/* App carousel */}
      <div className="mb-3">
        <span className="text-[11px] uppercase tracking-[2.5px] text-white/40 font-semibold">
          Aplicaciones
        </span>
      </div>
      <TarjetasMenu
        items={menu}
        tamano={170}
        inicial={1}
        onAbrir={(item) => {
          if (showToast) showToast(item.titulo);
        }}
      />
 
    </div>
  );
}
