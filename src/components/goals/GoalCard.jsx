import React from 'react';
import { Pencil, Trash2, Target, Plus, Minus, CheckCircle2 } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar.jsx';
import { formatMoney, formatPercent } from '../../utils/format.js';
import { formatDay } from '../../utils/date.js';

function goalTone(ratio) {
  if (ratio >= 1) return { color: 'var(--success)', bg: 'color-mix(in srgb, var(--success) 12%, transparent)' };
  if (ratio >= 0.8) return { color: 'var(--info)', bg: 'color-mix(in srgb, var(--info) 12%, transparent)' };
  return { color: 'var(--primary)', bg: 'color-mix(in srgb, var(--primary) 12%, transparent)' };
}

export default function GoalCard({ goal, currency, onOpenEdit, onAdd, onReduce, onOpenDelete }) {
  const ratio = goal.targetCents > 0 ? goal.savedCents / goal.targetCents : 0;
  const remaining = goal.targetCents - goal.savedCents;
  const complete = goal.savedCents >= goal.targetCents;
  const t = goalTone(ratio);

  return (
    <div className="card card-pad flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div
              className="rounded-full flex items-center justify-center shrink-0"
              style={{ width: '2.1rem', height: '2.1rem', background: t.bg, color: t.color }}
              aria-hidden
            >
              {complete ? <CheckCircle2 size={16} /> : <Target size={16} />}
            </div>
            <div className="font-semibold truncate">{goal.name}</div>
          </div>
          {goal.description && (
            <p className="text-[11px] text-faint-c mt-2 line-clamp-2">{goal.description}</p>
          )}
        </div>
        <span
          className="text-[11px] font-semibold px-2 py-1 rounded-full"
          style={{ color: t.color, background: t.bg }}
        >
          {formatPercent(ratio * 100)}
        </span>
      </div>

      <div className="mt-4">
        <ProgressBar ratio={Math.min(1, ratio)} />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <div>
          <div className="text-[10px] text-faint-c uppercase tracking-wide">Target</div>
          <div className="text-base font-bold tabular">{formatMoney(goal.targetCents, currency)}</div>
        </div>
        <div>
          <div className="text-[10px] text-faint-c uppercase tracking-wide">Saved</div>
          <div className="text-base font-bold tabular" style={{ color: 'var(--success)' }}>
            {formatMoney(goal.savedCents, currency)}
          </div>
        </div>
      </div>

      <div className="text-[12px] text-muted-c mt-2 flex items-center justify-between">
        <span>
          {complete
            ? 'Goal complete! 🎉'
            : `${formatMoney(Math.abs(remaining), currency)} to go`}
        </span>
        {goal.targetDate && <span className="text-faint-c">Due {formatDay(goal.targetDate)}</span>}
      </div>

      <div className="flex items-center gap-1 mt-3 pt-3" style={{ borderTop: '1px solid var(--border-soft)' }}>
        <button
          className="btn btn-ghost btn-sm flex-1"
          onClick={() => onAdd(goal)}
          disabled={complete}
          aria-label={`Add money to ${goal.name}`}
        >
          <Plus size={14} /> Add
        </button>
        <button
          className="btn btn-ghost btn-sm flex-1"
          onClick={() => onReduce(goal)}
          aria-label={`Reduce saved amount for ${goal.name}`}
        >
          <Minus size={14} /> Reduce
        </button>
        <div className="flex-1" />
        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onOpenEdit(goal)} aria-label={`Edit ${goal.name}`}>
          <Pencil size={14} />
        </button>
        <button
          className="btn btn-ghost btn-icon btn-sm"
          style={{ color: 'var(--danger)' }}
          onClick={() => onOpenDelete(goal)}
          aria-label={`Delete ${goal.name}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}