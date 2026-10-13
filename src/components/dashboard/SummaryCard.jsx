import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

/**
 * A compact KPI card. Value is already formatted (pass a string).
 * `tone` controls the accent + icon tint.
 */
export default function SummaryCard({
  label,
  value,
  sub,
  tone = 'neutral',
  icon: Icon,
  spark
}) {
  const toneColor =
    tone === 'success' ? 'var(--success)' :
    tone === 'danger'  ? 'var(--danger)' :
    tone === 'warning' ? 'var(--warning)' :
    tone === 'primary' ? 'var(--primary)' : 'var(--text-muted)';

  const IconToUse = Icon || (tone === 'danger' ? ArrowDownRight : ArrowUpRight);

  return (
    <div className="card card-pad relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium text-muted-c">{label}</div>
          <div className="text-2xl md:text-[1.7rem] font-bold tabular mt-1.5 truncate" style={{ color: 'var(--text)' }}>
            {value}
          </div>
          {sub && <div className="text-xs text-faint-c mt-1 truncate">{sub}</div>}
        </div>
        <div
          className="rounded-full flex items-center justify-center shrink-0"
          style={{
            width: '2.5rem', height: '2.5rem',
            background: `color-mix(in srgb, ${toneColor} 12%, transparent)`,
            color: toneColor,
            border: '1px solid var(--border)'
          }}
        >
          {Icon ? <Icon size={18} /> : <IconToUse size={18} />}
        </div>
      </div>
      {spark && <div className="mt-3 -mb-1.5 -mr-2">{spark}</div>}
    </div>
  );
}