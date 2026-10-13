import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const TONE = {
  success: { color: 'var(--success)', icon: CheckCircle2, iconBg: 'color-mix(in srgb, var(--success) 14%, transparent)' },
  error: { color: 'var(--danger)', icon: Info, iconBg: 'color-mix(in srgb, var(--danger) 14%, transparent)' },
  warning: { color: 'var(--warning)', icon: AlertTriangle, iconBg: 'color-mix(in srgb, var(--warning) 14%, transparent)' },
  info: { color: 'var(--info)', icon: Info, iconBg: 'color-mix(in srgb, var(--info) 14%, transparent)' }
};

export default function ToastViewport({ toasts = [], onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 sm:max-w-sm w-[calc(100%-1.5rem)]">
      {toasts.map((t) => {
        const m = TONE[t.tone] || TONE.info;
        const Icon = m.icon;
        return (
          <div key={t.id} role="status" aria-live="polite" className="card card-pad anim-fade-up flex gap-3 items-start pl-3">
            <div
              className="rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ width: '1.85rem', height: '1.85rem', background: m.iconBg, color: m.color }}
            >
              <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              {t.title && <div className="text-sm font-semibold text-base-c">{t.title}</div>}
              {t.body && <div className="text-xs text-muted-c mt-0.5 leading-relaxed">{t.body}</div>}
            </div>
            <button
              className="text-faint-c hover:text-muted-c shrink-0 mt-0.5"
              onClick={() => onDismiss?.(t.id)}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}