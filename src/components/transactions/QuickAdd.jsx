import React, { useEffect, useRef, useState } from 'react';
import { Plus, Zap } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { categoryById } from '../../data/categories.js';
import { toCents } from '../../utils/validation.js';
import { todayLocal } from '../../utils/date.js';
import { currencySymbol, formatMoney } from '../../utils/format.js';
import { useToast } from '../../hooks/useToast.jsx';

// The categories students said they spend on most (Week 3 interviews).
const QUICK_CATEGORIES = ['food_dining', 'groceries', 'transport', 'shopping', 'entertainment', 'other_expense'];
const LAST_CAT_KEY = 'spendly.quickadd.lastCategory';

function readLastCategory() {
  try {
    const v = localStorage.getItem(LAST_CAT_KEY);
    return QUICK_CATEGORIES.includes(v) ? v : QUICK_CATEGORIES[0];
  } catch {
    return QUICK_CATEGORIES[0];
  }
}

// Floating "+" button plus a one-screen sheet: type an amount, tap a category, done.
export default function QuickAdd({ currency, onAdd }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(readLastCategory);
  const [error, setError] = useState('');
  const amountRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setAmount('');
    setError('');
    setCategory(readLastCategory());
    const t = window.setTimeout(() => amountRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, [open]);

  const save = (cat = category) => {
    const cents = toCents(amount);
    if (!amount.trim() || cents <= 0) {
      setError('Enter an amount first');
      amountRef.current?.focus();
      return;
    }
    const label = categoryById(cat, 'expense').label;
    onAdd({
      title: label,
      amountCents: cents,
      type: 'expense',
      category: cat,
      date: todayLocal(),
      description: null,
      paymentMethod: null
    });
    try { localStorage.setItem(LAST_CAT_KEY, cat); } catch { /* ignore */ }
    toast.success('Added', `${formatMoney(cents, currency)} to ${label}`);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Quick add expense"
        title="Quick add expense"
        // Bottom-left on phones and bottom-right above the Netlify badge on desktop,
        // so the badge never covers it (tester feedback, End of Cycle 1).
        className="fixed z-40 flex items-center justify-center rounded-full shadow-lg left-5 bottom-5 lg:left-auto lg:right-6 lg:bottom-24"
        style={{
          width: '3.5rem',
          height: '3.5rem',
          background: 'var(--primary)',
          color: '#fff',
          border: 'none'
        }}
      >
        <Plus size={26} />
      </button>

      {open && (
        <Modal open={open} onClose={() => setOpen(false)} title="Quick add" subtitle="Amount, then tap a category" maxWidth="26rem">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <label htmlFor="quick-amount" className="text-sm text-muted-c">
              Amount spent today
            </label>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-semibold text-muted-c">{currencySymbol(currency)}</span>
              <input
                id="quick-amount"
                ref={amountRef}
                className="input"
                style={{ fontSize: '1.75rem', fontWeight: 600, height: '3.25rem' }}
                inputMode="decimal"
                placeholder="0.00"
                autoComplete="off"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
              />
            </div>
            {error && (
              <p className="text-sm mt-1" style={{ color: 'var(--danger)' }} role="alert">
                {error}
              </p>
            )}

            <div className="grid grid-cols-3 gap-2 mt-4">
              {QUICK_CATEGORIES.map((id) => {
                const c = categoryById(id, 'expense');
                const active = id === category;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setCategory(id);
                      if (amount.trim()) save(id);
                    }}
                    className="rounded-lg p-2 text-sm font-medium"
                    style={{
                      border: `1.5px solid ${active ? c.color : 'var(--border-soft)'}`,
                      background: active ? `color-mix(in srgb, ${c.color} 14%, transparent)` : 'transparent',
                      color: 'inherit',
                      minHeight: '3rem'
                    }}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>

            <button type="submit" className="btn btn-primary w-full mt-4 flex items-center justify-center gap-2">
              <Zap size={16} /> Save to {categoryById(category, 'expense').label}
            </button>
            <p className="text-xs text-muted-c mt-2 text-center">
              Saved as today's expense. Edit details later in Transactions.
            </p>
          </form>
        </Modal>
      )}
    </>
  );
}
