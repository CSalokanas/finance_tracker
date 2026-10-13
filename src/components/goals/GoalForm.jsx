import React, { useState } from 'react';
import { validateGoal } from '../../utils/validation.js';
import { currencySymbol } from '../../utils/format.js';
import { useToast } from '../../hooks/useToast.jsx';

export default function GoalForm({ initial, onSubmit, onCancel, currency }) {
  const toast = useToast();
  const [form, setForm] = useState(() =>
    initial
      ? {
          name: initial.name || '',
          target: String((initial.targetCents ?? 0) / 100),
          saved: String((initial.savedCents ?? 0) / 100),
          targetDate: initial.targetDate || '',
          description: initial.description || ''
        }
      : {
          name: '',
          target: '',
          saved: '0',
          targetDate: '',
          description: ''
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
    const { errors: errs, value } = validateGoal(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error('Check the form', 'Some goal fields need attention.');
      return;
    }
    setSubmitting(true);
    try {
      onSubmit(value);
      setSubmitting(false);
    } catch (err) {
      console.error('Goal save failed', err);
      setSubmitting(false);
      toast.error('Could not save', String(err?.message || err));
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="sm:col-span-2">
          <label htmlFor="g-name" className="label">Goal name</label>
          <input
            id="g-name"
            type="text"
            className="input"
            placeholder="e.g. Emergency Fund"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            aria-invalid={!!errors.name}
          />
          {errors.name && <div className="err-text mt-1">{errors.name}</div>}
        </div>

        <div>
          <label htmlFor="g-target" className="label">Target amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint-c text-sm" aria-hidden>
              {currencySymbol(currency)}
            </span>
            <input
              id="g-target"
              type="number"
              min="0" step="0.01" inputMode="decimal"
              className="input pl-7 tabular"
              value={form.target}
              onChange={(e) => set('target', e.target.value)}
              aria-invalid={!!errors.target}
            />
          </div>
          {errors.target && <div className="err-text mt-1">{errors.target}</div>}
        </div>

        <div>
          <label htmlFor="g-saved" className="label">Amount saved</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint-c text-sm" aria-hidden>
              {currencySymbol(currency)}
            </span>
            <input
              id="g-saved"
              type="number" min="0" step="0.01" inputMode="decimal"
              className="input pl-7 tabular"
              value={form.saved}
              onChange={(e) => set('saved', e.target.value)}
              aria-invalid={!!errors.saved}
            />
          </div>
          {errors.saved && <div className="err-text mt-1">{errors.saved}</div>}
        </div>

        <div>
          <label htmlFor="g-date" className="label">Target date (optional)</label>
          <input
            id="g-date"
            type="date"
            className="input"
            value={form.targetDate}
            onChange={(e) => set('targetDate', e.target.value)}
            aria-invalid={!!errors.targetDate}
          />
          {errors.targetDate && <div className="err-text mt-1">{errors.targetDate}</div>}
        </div>

        <div>
          <label htmlFor="g-desc" className="label">Description (optional)</label>
          <input
            id="g-desc"
            type="text"
            className="input"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Why this goal matters"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <button type="button" className="btn btn-ghost" onClick={handleCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Save Changes' : 'Create Goal'}
        </button>
      </div>
    </form>
  );
}