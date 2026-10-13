import React, { useMemo, useState } from 'react';
import { Plus, PiggyBank, Target, Wallet } from 'lucide-react';
import GoalCard from '../components/goals/GoalCard.jsx';
import GoalForm from '../components/goals/GoalForm.jsx';
import Modal from '../components/ui/Modal.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { formatMoney, formatPercent, currencySymbol } from '../utils/format.js';
import { totalSaved } from '../utils/aggregate.js';
import { toCents } from '../utils/validation.js';
import { useToast } from '../hooks/useToast.jsx';

function AmountModal({ open, goal, currency, onClose, onSubmit }) {
  const [value, setValue] = useState('0');
  if (!open) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={goal.mode === 'add' ? `Add to ${goal.item?.name}` : `Reduce from ${goal.item?.name}`}
      maxWidth="26rem"
    >
      <div>
        <label className="label" htmlFor="g-amount">Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint-c text-sm" aria-hidden>
            {currencySymbol(currency)}
          </span>
          <input
            id="g-amount"
            className="input pl-7 tabular"
            type="number" min="0" step="0.01" inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <p className="text-[12px] text-faint-c mt-2 leading-relaxed">
          {goal.mode === 'add'
            ? `Current saved: ${formatMoney(goal.item?.savedCents || 0, currency)}. This does NOT create a bank transaction — it only updates goal progress.`
            : `Current saved: ${formatMoney(goal.item?.savedCents || 0, currency)}. Use Reduce to undo a previous add without logging a transaction.`}
        </p>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button
          className={`btn ${goal.mode === 'add' ? 'btn-primary' : 'btn-danger'}`}
          onClick={() => {
            const cents = toCents(value);
            if (cents <= 0) {
              // fallback: just close
              onClose();
              return;
            }
            onSubmit(cents);
          }}
        >
          {goal.mode === 'add' ? 'Add money' : 'Reduce saved'}
        </button>
      </div>
    </Modal>
  );
}

export default function GoalsPage({ goals, setGoals, currency, onOpenDelete }) {
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [amountState, setAmountState] = useState(null); // { mode, item }

  const saved = useMemo(() => totalSaved(goals), [goals]);
  const targets = useMemo(() => goals.reduce((s, g) => s + (g.targetCents || 0), 0), [goals]);

  const submit = (value) => {
    // value: { name, targetCents, savedCents, targetDate, description }
    if (editing && editing.id) {
      setGoals((list) => list.map((g) => (g.id === editing.id ? { ...g, ...value } : g)));
      toast.success('Goal updated', `${value.name} updated.`);
    } else {
      setGoals((list) => [
        { ...value, id: `g_${Math.floor(Math.random() * 1e9).toString(36)}${Date.now().toString(36)}` },
        ...list
      ]);
      toast.success('Goal created', `${value.name} starts at ${formatMoney(value.savedCents, currency)}.`);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleAmount = (cents) => {
    const id = amountState.item.id;
    const mode = amountState.mode;
    setGoals((list) =>
      list.map((g) => {
        if (g.id !== id) return g;
        const next = mode === 'add'
          ? Math.min(g.savedCents + cents, g.targetCents)
          : Math.max(g.savedCents - cents, 0);
        return { ...g, savedCents: next };
      })
    );
    const g = goals.find((x) => x.id === id);
    if (g) {
      const before = g.savedCents;
      const after = mode === 'add' ? Math.min(before + cents, g.targetCents) : Math.max(before - cents, 0);
      const remain = g.targetCents - after;
      if (remain <= 0) toast.success('Goal reached! 🎉', `${g.name} is now fully funded.`);
      else toast.success(mode === 'add' ? 'Money added to goal' : 'Amount reduced from goal', `${g.name} now ${formatMoney(after, currency)} of ${formatMoney(g.targetCents, currency)}.`);
    }
    setAmountState(null);
  };

  return (
    <div className="space-y-4 anim-fade-up">
      <div className="card card-pad">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <div
              className="rounded-full flex items-center justify-center shrink-0"
              style={{ width: '2.75rem', height: '2.75rem', background: 'color-mix(in srgb, var(--primary) 14%, transparent)', color: 'var(--primary)' }}
            >
              <Wallet size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-muted-c">Total saved across all goals</div>
              <div className="text-2xl font-bold tabular">{formatMoney(saved, currency)}</div>
            </div>
          </div>
          <div className="hidden md:block h-10 w-px" style={{ background: 'var(--border-soft)' }} />
          <div className="flex-1">
            <div className="text-xs text-muted-c">Combined target</div>
            <div className="text-2xl font-bold tabular">{formatMoney(targets, currency)}</div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { setEditing(null); setFormOpen(true); }}
          >
            <Plus size={16} />
            <span>New goal</span>
          </button>
        </div>
      </div>

      <p className="text-[12px] text-faint-c leading-relaxed -mt-1.5">
        Tip: savings-goal progress is tracked <strong>separately</strong> from your transactions. Adding or reducing money toward a goal does <strong>not</strong> create a matching bank transaction — do that in the Transactions tab if you want to record the deposit.
      </p>

      {goals.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No savings goals yet"
          body="Create a goal to set a target amount, track progress and see when you're done. Great for emergency funds, upgrades, trips and more."
          action={<button className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus size={14} /> Create a goal</button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              currency={currency}
              onOpenEdit={(g) => { setEditing(g); setFormOpen(true); }}
              onAdd={(g) => setAmountState({ mode: 'add', item: g })}
              onReduce={(g) => setAmountState({ mode: 'reduce', item: g })}
              onOpenDelete={(g) => onOpenDelete?.(g)}
            />
          ))}
        </div>
      )}

      {formOpen && (
        <Modal
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          title={editing && editing.id ? 'Edit savings goal' : 'New savings goal'}
          maxWidth="32rem"
        >
          <GoalForm
            initial={editing && editing.id ? editing : null}
            onSubmit={submit}
            onCancel={() => { setFormOpen(false); setEditing(null); }}
            currency={currency}
          />
        </Modal>
      )}

      {amountState && (
        <AmountModal
          open={!!amountState}
          goal={amountState}
          currency={currency}
          onClose={() => setAmountState(null)}
          onSubmit={handleAmount}
        />
      )}
    </div>
  );
}
