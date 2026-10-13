import React, { useEffect, useMemo, useState } from 'react';
import { validateTransaction, toCents } from '../../utils/validation.js';
import { categoryList, PAYMENT_METHODS } from '../../data/categories.js';
import { todayLocal } from '../../utils/date.js';
import { currencySymbol } from '../../utils/format.js';
import { useToast } from '../../hooks/useToast.jsx';

const blank = (currency) => ({
  title: '',
  amount: '',
  type: 'expense',
  category: '',
  date: todayLocal(),
  description: '',
  paymentMethod: ''
});

export default function TransactionForm({ initial, onSubmit, onCancel, currency }) {
  const toast = useToast();
  const [form, setForm] = useState(() => {
    if (initial) {
      return {
        title: initial.title || '',
        amount: String((initial.amountCents ?? 0) / 100),
        type: initial.type || 'expense',
        category: initial.category || '',
        date: initial.date || todayLocal(),
        description: initial.description || '',
        paymentMethod: initial.paymentMethod || ''
      };
    }
    return blank(currency);
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    // Set date in past/today only (pre-fill attempt for new edit when opening a new form).
    if (!initial) return;
    const d = (initial.date || '').slice(0, 10);
    setForm((f) => ({ ...f, date: d || todayLocal() }));
  }, [initial]);

  const cats = useMemo(() => categoryList(form.type), [form.type]);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
  };

  const resetCategory = (type) => {
    setForm((f) => ({ ...f, type, category: '' }));
  };

  const handleCancel = () => {
    if (dirty && !window.confirm('Discard unsaved changes?')) return;
    onCancel?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { errors: errs, value } = validateTransaction({ ...form, amount: kind(form.amount) });
    setErrors(errs);
    if (Object.keys(errs).length || !value) {
      toast.error('Check the form', 'Some fields need attention before saving.');
      return;
    }
    // Map canonical value to our stored field names
    const payload = {
      title: value.title,
      amountCents: value.amount,
      type: value.type,
      category: value.category,
      date: value.date,
      description: value.description,
      paymentMethod: value.paymentMethod
    };
    setSubmitting(true);
    try {
      onSubmit(payload);
      setSubmitting(false);
    } catch (err) {
      console.error('Transaction save failed', err);
      setSubmitting(false);
      toast.error('Could not save', String(err?.message || err));
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Field label="Title / Merchant" htmlFor="tx-title">
          <input
            id="tx-title"
            type="text"
            className="input"
            placeholder="e.g. Grocery Store"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            aria-invalid={!!errors.title}
          />
          {errors.title && <Hint err>{errors.title}</Hint>}
        </Field>

        <Field label="Amount" htmlFor="tx-amount">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint-c text-sm" aria-hidden>
              {currencySymbol(currency)}
            </span>
            <input
              id="tx-amount"
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
          {errors.amount && <Hint err>{errors.amount}</Hint>}
        </Field>

        <Field label="Type" htmlFor="tx-type">
          <div
            className="grid grid-cols-2 gap-1 p-1 rounded-lg"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
            role="radiogroup" aria-label="Transaction type"
          >
            {['expense', 'income'].map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={form.type === t}
                onClick={() => resetCategory(t)}
                className="px-3 py-2 text-sm rounded font-medium transition-colors"
                style={{
                  background: form.type === t ? (t === 'income' ? 'color-mix(in srgb, var(--success) 16%, transparent)' : 'color-mix(in srgb, var(--danger) 16%, transparent)') : 'transparent',
                  color: form.type === t ? (t === 'income' ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)',
                  border: form.type === t ? '1px solid color-mix(in srgb, ' + (t === 'income' ? 'var(--success)' : 'var(--danger)') + ' 30%, transparent)' : '1px solid transparent'
                }}
              >
                {t === 'income' ? 'Income' : 'Expense'}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Category" htmlFor="tx-category">
          <select
            id="tx-category"
            className="input"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            aria-invalid={!!errors.category}
          >
            <option value="" disabled>
              Select a category
            </option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          {errors.category && <Hint err>{errors.category}</Hint>}
        </Field>

        <Field label="Date" htmlFor="tx-date">
          <input
            id="tx-date"
            type="date"
            className="input"
            max={todayLocal()}
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            aria-invalid={!!errors.date}
          />
          {errors.date && <Hint err>{errors.date}</Hint>}
        </Field>

        <Field label="Payment method" htmlFor="tx-method">
          <select
            id="tx-method"
            className="input"
            value={form.paymentMethod}
            onChange={(e) => set('paymentMethod', e.target.value)}
          >
            <option value="">Select a method (optional)</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field label="Description" htmlFor="tx-desc">
            <textarea
              id="tx-desc"
              rows={2}
              className="input resize-none"
              placeholder="Optional note"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-5">
        <button type="button" className="btn btn-ghost" onClick={handleCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Save Changes' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
    </div>
  );
}

function Hint({ children, err }) {
  return <div className={err ? 'err-text mt-1' : 'text-[12px] text-faint-c mt-1'}>{children}</div>;
}

function kind(v) {
  if (typeof v === 'string' && v.trim() === '') return '';
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : '';
}