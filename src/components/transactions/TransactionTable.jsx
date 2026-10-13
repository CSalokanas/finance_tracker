import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { formatMoneySigned } from '../../utils/format.js';
import { formatShortDay } from '../../utils/date.js';
import { categoryLabel, categoryColor, methodLabel } from '../../data/categories.js';

export default function TransactionTable({
  transactions,
  currency,
  onEdit,
  onDelete
}) {
  if (!transactions.length) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-muted-c">
            <th className="px-3 py-2 font-semibold">Date</th>
            <th className="px-3 py-2 font-semibold">Title</th>
            <th className="px-3 py-2 font-semibold hidden sm:table-cell">Category</th>
            <th className="px-3 py-2 font-semibold hidden md:table-cell">Method</th>
            <th className="px-3 py-2 font-semibold text-right">Amount</th>
            <th className="px-3 py-2 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const color = categoryColor(t.category, t.type);
            const isIncome = t.type === 'income';
            return (
              <tr key={t.id} className="border-t transition-colors" style={{ borderColor: 'var(--border-soft)' }}>
                <td className="px-3 py-2.5 whitespace-nowrap text-muted-c tabular">{formatShortDay(t.date)}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="rounded shrink-0"
                      style={{
                        width: '1.75rem', height: '1.75rem',
                        background: `color-mix(in srgb, ${color} 14%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${color} 28%, transparent)`,
                        display: 'grid',
                        placeItems: 'center',
                        color, fontSize: '10px', fontWeight: 700
                      }}
                      aria-label={categoryLabel(t.category, t.type)}
                      title={categoryLabel(t.category, t.type)}
                    >
                      {categoryLabel(t.category, t.type).slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{t.title}</div>
                      <div className="text-[11px] text-faint-c sm:hidden">{categoryLabel(t.category, t.type)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 hidden sm:table-cell">
                  <div className="flex items-center gap-1.5">
                    <span className="cat-dot" style={{ background: color }} />
                    <span className="text-muted-c">{categoryLabel(t.category, t.type)}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 hidden md:table-cell text-muted-c whitespace-nowrap">
                  {t.paymentMethod ? methodLabel(t.paymentMethod) : '—'}
                </td>
                <td className="px-3 py-2.5 text-right tabular whitespace-nowrap">
                  <span style={{ color: isIncome ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                    {formatMoneySigned(t.amountCents, t.type, currency)}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => onEdit(t)}
                      aria-label={`Edit ${t.title}`}
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ color: 'var(--danger)' }}
                      onClick={() => onDelete(t)}
                      aria-label={`Delete ${t.title}`}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}