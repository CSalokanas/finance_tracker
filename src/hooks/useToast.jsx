import React, { createContext, useState, useCallback, useMemo, useContext, useRef, useEffect } from 'react';
import ToastViewport from '../components/ui/ToastViewport.jsx';

const ToastContext = createContext(null);
let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback((toast) => {
    const id = nextId++;
    const item = { id, tone: 'info', title: '', body: '', duration: 4500, ...toast };
    setToasts((t) => [...t, item]);
    if (item.duration > 0) window.setTimeout(() => remove(id), item.duration);
    return id;
  }, [remove]);

  const api = useMemo(
    () => ({
      push,
      dismiss: remove,
      toasts,
      success: (title, body) => push({ tone: 'success', title, body }),
      error: (title, body) => push({ tone: 'error', title, body, duration: 6500 }),
      warning: (title, body) => push({ tone: 'warning', title, body }),
      info: (title, body) => push({ tone: 'info', title, body })
    }),
    [push, remove, toasts]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}