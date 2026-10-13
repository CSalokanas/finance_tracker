import React from 'react';
import { Pencil, Trash2, PiggyBank } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar.jsx';
import { formatMoney, formatPercent } from '../../utils/format.js';
import { categoryLabel, categoryColor } from '../../data/categories.js';

const STATUS = {
  ok: {
    label: 'On track',
    color: 'var(--success)',
    bg: 'color-mix(in srgb, var(--success) 12%, transparent)',
    border: 'color-mix(in srgb, var(--success) 28%, transparent)'
  },
  warning: {
    label: 'Approaching limit',
    color: 'var(--warning)',
    bg: 'color-mix(in srgb, var(--warning) 12%, transparent)',
    border: 'color-mix(in srgb, var(--warning) 28%, transparent)'
  },
  over: {
    label: 'Over budget',
    color: 'var(--danger)',
    bg: 'color-mix(in srgb, var(--danger) 12%, transparent)',
    border: 'color-mix(in srgb, var(--danger) 28%, transparent)'
  }
};

export default function BudgetCard({ budget, monthTransactions, currency, onEdit, onDelete }) {
  const cat = categoryLabel(budget.category, 'expense');
  const color = categoryColor(budget.category, 'expense');
  // Spent: real expenses in the budget category and current month
  const spent = monthTransactions
    .filter((t) => t.type === 'expense' && t.category === budget.category)
    .reduce((s, t) => s + (t.amountCents || 0), 0);
  const remaining = budget.budgetCents - spent;
  const ratio = budget.budgetCents > 0 ? spent / budget.budgetCents : spent > 0 ? 2 : 0;
  const status = ratio >= 1 ? 'over' : ratio >= 0.8 ? 'warning' : 'ok';
  const s = STATUS[status];

  return (
    <div className="card card-pad">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="rounded flex items-center justify-center shrink-0"
            style={{
              width: '2.25rem', height: '2.25rem',
              background: `color-mix(in srgb, ${color} 14%, transparent)`,
              border: `1px solid color-mix(in srgb, ${color} 28%, transparent)`,
              color: color
            }}
            aria-hidden
          >
            <PiggyBank size={16} />
          </div>
          <div className="min-w-0">
            <div className="font-semibold truncate">{cat}</div>
            {budget.note && <div className="text-[11px] text-faint-c truncate">{budget.note}</div>}
          </div>
        </div>
        <span
          className="text-[11px] font-semibold px-2 py-1 rounded-full"
          style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
        >
          {s.label}
        </span>
      </div>

      <div className="mt-3">
        <ProgressBar ratio={ratio} />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 text-center">
        <Metric label="Budget" value={formatMoney(budget.budgetCents, currency)} />
        <Metric label="Spent" value={formatMoney(spent, currency)} accent />
        <Metric label="Remaining" value={formatMoney(Math.abs(remaining), currency)} tone={remaining < 0 ? 'danger' : undefined} />
      </div>

      {budget.note && <div className="text-[11px] text-faint-c mt-2 line-clamp-1">Note: {budget.note}</div>}

      <div className="flex justify-end gap-1 mt-3">
        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onEdit(budget)} aria-label={`Edit ${cat} budget`}>
          <Pencil size={14} />
        </button>
        <button
          className="btn btn-ghost btn-icon btn-sm"
          style={{ color: 'var(--danger)' }}
          onClick={() => onDelete(budget)}
          aria-label={`Delete ${cat} budget`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value, accent, tone }) {
  return (
    <div
      className="rounded-lg py-2 px-1"
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border-soft)'
      }}
    >
      <div className="text-[10px] text-faint-c uppercase tracking-wide">{label}</div>
      <div
        className="text-sm font-semibold tabular mt-0.5"
        style={{ color: tone === 'danger' ? 'var(--danger)' : accent ? 'var(--text)' : 'var(--text)' }}
      >
        {value}
      </div>
    </div>
  );
}