export default function BottomBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 flex justify-center gap-[30px] px-10 py-3 bottombar-gradient">
      <div className="flex items-center gap-1.5 text-xs text-white/40">
        <span className="text-sm text-white/50">&#9675;</span> Select
      </div>
      <div className="flex items-center gap-1.5 text-xs text-white/40">
        <span className="text-sm text-white/50">&#9587;</span> Back
      </div>
      <div className="flex items-center gap-1.5 text-xs text-white/40">
        <span className="text-sm text-white/50">&#9651;</span> Options
      </div>
    </div>
  );
}
