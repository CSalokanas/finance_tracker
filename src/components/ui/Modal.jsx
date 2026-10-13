import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  open,
  title,
  subtitle,
  onClose,
  maxWidth = '38rem',
  children,
  labelledBy
}) {
  const panelRef = useRef(null);
  const lastFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    lastFocusRef.current = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    if (panelRef.current) {
      const first = panelRef.current.querySelector('input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (first) first.focus();
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      lastFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'var(--overlay)' }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy || 'modal-title'}
        className="card anim-scale w-full overflow-hidden"
        style={{ maxWidth }}
      >
        <div className="flex items-start justify-between p-5 border-b" style={{ borderColor: 'var(--border-soft)' }}>
          <div>
            <h2 id={labelledBy || 'modal-title'} className="text-lg font-semibold">
              {title}
            </h2>
            {subtitle && <p className="text-sm text-muted-c mt-0.5">{subtitle}</p>}
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}