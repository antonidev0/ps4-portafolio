import { useState, useCallback, useRef } from 'react';

let nextId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const showToast = useCallback((message) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, fadingOut: false }]);

    timers.current[id] = setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, fadingOut: true } : t)));
      timers.current[id] = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        delete timers.current[id];
      }, 300);
    }, 2000);
  }, []);

  return { toasts, showToast };
}
