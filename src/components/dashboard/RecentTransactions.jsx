import React from 'react';
import { ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react';
import { formatMoneySigned } from '../../utils/format.js';
import { formatShortDay } from '../../utils/date.js';
import { categoryLabel, categoryColor } from '../../data/categories.js';

export default function RecentTransactions({ transactions, currency, onOpenDetail }) {
  if (!transactions.length) {
    return (
      <div className="text-sm text-muted-c py-8 text-center">
        No transactions yet. Add your first one to see it here.
      </div>
    );
  }
  return (
    <ul className="space-y-1">
      {transactions.slice(0, 6).map((t) => {
        const color = categoryColor(t.category, t.type);
        const isIncome = t.type === 'income';
        return (
          <li key={t.id}>
            <button
              onClick={() => onOpenDetail?.(t)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-surface2 text-left"
              aria-label={`${t.title}, ${categoryLabel(t.category, t.type)}`}
            >
              <div
                className="rounded flex items-center justify-center shrink-0"
                style={{
                  width: '2.1rem', height: '2.1rem',
                  background: `color-mix(in srgb, ${color} 14%, transparent)`,
                  color,
                  border: '1px solid color-mix(in srgb, ' + color + ' 28%, transparent)'
                }}
              >
                {isIncome ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate text-sm">{t.title}</div>
                <div className="text-[11px] text-faint-c">
                  {categoryLabel(t.category, t.type)} · {formatShortDay(t.date)}
                </div>
              </div>
              <div
                className="font-semibold tabular text-sm whitespace-nowrap"
                style={{ color: isIncome ? 'var(--success)' : 'var(--danger)' }}
              >
                {formatMoneySigned(t.amountCents, t.type, currency)}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}