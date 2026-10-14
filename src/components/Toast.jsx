export default function Toast({ toasts }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`bg-black/85 backdrop-blur-[20px] rounded-lg px-8 py-4 text-[15px] text-white text-center ${
            t.fadingOut ? 'animate-toast-out' : 'animate-toast-in'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
