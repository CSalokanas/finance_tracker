import React, { useMemo, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, PiggyBank, AlertTriangle, Target } from 'lucide-react';
import BudgetCard from '../components/budgets/BudgetCard.jsx';
import BudgetForm from '../components/budgets/BudgetForm.jsx';
import Modal from '../components/ui/Modal.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { transactionsForMonth, expenseByCategory, sumIncome, sumExpense } from '../utils/aggregate.js';
import { formatMoney, formatPercent } from '../utils/format.js';
import { monthKeyLabel, currentMonthKey } from '../utils/date.js';
import { EXPENSE_CATEGORIES, categoryLabel } from '../data/categories.js';
import { useToast } from '../hooks/useToast.jsx';

export default function BudgetsPage({
  month, setMonth, budgets, setBudgets, transactions, currency, onOpenDelete
}) {
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const monthTx = useMemo(() => transactionsForMonth(transactions, month), [transactions, month]);
  const monthBudgets = useMemo(() => budgets.filter((b) => b.month === month), [budgets, month]);
  const catTotals = useMemo(() => expenseByCategory(monthTx), [monthTx]);

  const totals = useMemo(() => {
    let b = 0; let s = 0;
    for (const k of monthBudgets) {
      b += k.budgetCents;
      s += catTotals.get(k.category) || 0;
    }
    return { budget: b, spent: s, remaining: b - s };
  }, [monthBudgets, catTotals]);

  const overSet = monthBudgets.filter((b) => (catTotals.get(b.category) || 0) >= b.budgetCents);
  const warnSet = monthBudgets.filter((b) => {
    const r = b.budgetCents > 0 ? (catTotals.get(b.category) || 0) / b.budgetCents : 0;
    return r >= 0.8 && r < 1;
  });

  const shift = (d) => {
    const [y, m] = month.split('-').map(Number);
    const t = new Date(y, m - 1 + d, 1);
    setMonth(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`);
  };

  const unusedCategories = useMemo(
    () =>
      EXPENSE_CATEGORIES.filter(
        (c) => !monthBudgets.some((b) => b.category === c.id)
      ),
    [EXPENSE_CATEGORIES, monthBudgets]
  );

  const submit = (value) => {
    // value: { category, month, budgetCents, note }
    if (editing && editing.id) {
      setBudgets((list) => list.map((b) => (b.id === editing.id ? { ...b, ...value } : b)));
      toast.success('Budget updated', `${categoryLabel(value.category)} for ${monthKeyLabel(value.month)} saved.`);
    } else {
      // Guard against duplicate category + month
      const dup = budgets.find((b) => b.month === value.month && b.category === value.category);
      if (dup) {
        toast.warning('Budget already exists', "You already have a budget for this category in this month. Edit it instead.");
        setFormOpen(false);
        return;
      }
      setBudgets((list) => [
        { ...value, id: `b_${Math.floor(Math.random() * 1e9).toString(36)}${Date.now().toString(36)}` },
        ...list
      ]);
      toast.success('Budget created', `${categoryLabel(value.category)} for ${monthKeyLabel(value.month)}.`);
    }
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4 anim-fade-up">
      <div className="card card-pad">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div
            className="flex items-center gap-1 rounded-lg px-1 py-1 w-fit"
            style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
          >
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => shift(-1)} aria-label="Previous month">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold px-1.5 min-w-[7.5rem] text-center tabular">
              {monthKeyLabel(month)}
            </span>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => shift(1)} aria-label="Next month">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex-1 text-[12px] text-muted-c">
            Tracking {monthBudgets.length} category budget{monthBudgets.length === 1 ? '' : 's'}
            {unusedCategories.length > 0 && ` · ${unusedCategories.length} category${unusedCategories.length === 1 ? '' : 'ies'} without a budget`}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { setEditing(null); setFormOpen(true); }}
          >
            <Plus size={16} />
            <span>New budget</span>
          </button>
        </div>

        {(overSet.length > 0 || warnSet.length > 0) && (
          <div
            className="mt-3 rounded-lg px-3 py-2.5 flex items-center gap-2.5 text-[13px]"
            style={{
              border: `1px solid color-mix(in srgb, ${overSet.length ? 'var(--danger)' : 'var(--warning)'} 30%, transparent)`,
              background: `color-mix(in srgb, ${overSet.length ? 'var(--danger)' : 'var(--warning)'} 8%, transparent)`
            }}
          >
            <AlertTriangle size={16} style={{ color: overSet.length ? 'var(--danger)' : 'var(--warning)' }} />
            <span>
              {overSet.length ? `${overSet.length} budget${overSet.length > 1 ? 's' : ''} over limit` : 'Approaching limit'}
              {overSet.length ? `: ${overSet.map((b) => categoryLabel(b.category)).join(', ')}` : `: ${warnSet.map((b) => categoryLabel(b.category)).join(', ')}`}
            </span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="rounded-lg p-2.5 text-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-soft)' }}>
            <div className="text-[10px] text-faint-c uppercase tracking-wide">Total budgeted</div>
            <div className="font-bold tabular text-sm md:text-base mt-0.5">{formatMoney(totals.budget, currency)}</div>
          </div>
          <div className="rounded-lg p-2.5 text-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-soft)' }}>
            <div className="text-[10px] text-faint-c uppercase tracking-wide">Total spent</div>
            <div className="font-bold tabular text-sm md:text-base mt-0.5" style={{ color: 'var(--danger)' }}>{formatMoney(totals.spent, currency)}</div>
          </div>
          <div className="rounded-lg p-2.5 text-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-soft)' }}>
            <div className="text-[10px] text-faint-c uppercase tracking-wide">Remaining</div>
            <div className="font-bold tabular text-sm md:text-base mt-0.5" style={{ color: totals.remaining >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {formatMoney(Math.abs(totals.remaining), currency)}
            </div>
          </div>
        </div>

        {totals.budget > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="text-muted-c">Total budget usage</span>
              <span className="tabular font-semibold" style={{ color: totals.remaining >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {formatPercent((totals.spent / totals.budget) * 100)}
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${Math.min((totals.spent / totals.budget) * 100, 100)}%`, background: totals.remaining >= 0 ? 'var(--primary)' : 'var(--danger)' }}
              />
            </div>
          </div>
        )}
      </div>

      {monthBudgets.length === 0 && unusedCategories.length > 0 ? (
        <>
          <EmptyState
            icon={PiggyBank}
            title={`No budgets for ${monthKeyLabel(month)}`}
            body="Set a spending limit per category for this month. Actual spending is derived from your real expense transactions, and the bar turns amber at 80% and red at 100%."
            action={<button className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus size={14} /> Create a budget</button>}
          />
          <div>
            <h3 className="text-sm font-semibold text-muted-c mb-2.5">Categories without a budget this month</h3>
            <div className="flex flex-wrap gap-2">
              {unusedCategories.map((c) => (
                <button
                  key={c.id}
                  className="chip"
                  onClick={() => { setEditing({ __suggest: c.id }); setFormOpen(true); }}
                  aria-label={`Create budget for ${c.label}`}
                >
                  <span className="cat-dot" style={{ background: c.color }} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : monthBudgets.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No budgets yet"
          body="You're not using budgets at the moment. Budgets help you see at-a-glance whether your spending tracks to plan."
          action={<button className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus size={14} /> Add your first budget</button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {monthBudgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              monthTransactions={monthTx}
              currency={currency}
              onEdit={(b) => { setEditing(b); setFormOpen(true); }}
              onDelete={(b) => onOpenDelete?.(b)}
            />
          ))}
        </div>
      )}

      {formOpen && (
        <Modal
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          title={editing && editing.id ? 'Edit budget' : 'New budget'}
          maxWidth="34rem"
        >
          <BudgetForm
            initial={editing && editing.id ? editing : { category: editing?.__suggest || '', month }}
            month={month}
            onSubmit={submit}
            onCancel={() => { setFormOpen(false); setEditing(null); }}
            currency={currency}
          />
        </Modal>
      )}
    </div>
  );
}
