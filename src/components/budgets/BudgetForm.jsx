import React, { useState } from 'react';
import { validateBudget } from '../../utils/validation.js';
import { EXPENSE_CATEGORIES, categoryLabel } from '../../data/categories.js';
import { currentMonthKey, monthKeyLabel } from '../../utils/date.js';
import { currencySymbol } from '../../utils/format.js';
import { useToast } from '../../hooks/useToast.jsx';

export default function BudgetForm({ initial, month, onSubmit, onCancel, currency }) {
  const toast = useToast();
  const [form, setForm] = useState(() =>
    initial
      ? {
          category: initial.category || '',
          month: initial.month || month || currentMonthKey(),
          amount: String((initial.budgetCents ?? 0) / 100),
          note: initial.note || ''
        }
      : {
          category: '',
          month: month || currentMonthKey(),
          amount: '',
          note: ''
        }
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
  };

  const handleCancel = () => {
    if (dirty && !window.confirm('Discard unsaved changes?')) return;
    onCancel?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { errors: errs, value } = validateBudget(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error('Check the form', 'Some budget fields need attention.');
      return;
    }
    // Prevent creating a duplicate budget for the same category+month
    setSubmitting(true);
    try {
      onSubmit(value);
      setSubmitting(false);
    } catch (err) {
      console.error('Budget save failed', err);
      setSubmitting(false);
      toast.error('Could not save', String(err?.message || err));
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label htmlFor="b-month" className="label">Month</label>
          <input
            type="month"
            id="b-month"
            className="input"
            value={form.month}
            onChange={(e) => set('month', e.target.value)}
            aria-invalid={!!errors.month}
          />
          {errors.month && <div className="err-text mt-1">{errors.month}</div>}
          {form.month && !errors.month && (
            <div className="text-[12px] text-faint-c mt-1">{monthKeyLabel(form.month)}</div>
          )}
        </div>

        <div>
          <label htmlFor="b-category" className="label">Expense category</label>
          <select
            id="b-category"
            className="input"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            aria-invalid={!!errors.category}
          >
            <option value="" disabled>Select a category</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          {errors.category && <div className="err-text mt-1">{errors.category}</div>}
        </div>

        <div>
          <label htmlFor="b-amount" className="label">Budget amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint-c text-sm" aria-hidden>
              {currencySymbol(currency)}
            </span>
            <input
              id="b-amount"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              className="input pl-7 tabular"
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              aria-invalid={!!errors.amount}
            />
          </div>
          {errors.amount && <div className="err-text mt-1">{errors.amount}</div>}
        </div>

        <div>
          <label htmlFor="b-note" className="label">Note (optional)</label>
          <input
            id="b-note"
            type="text"
            className="input"
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
            placeholder="e.g. Weekly only"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <button type="button" className="btn btn-ghost" onClick={handleCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Save Changes' : 'Create Budget'}
        </button>
      </div>
    </form>
  );
}