// Form validation helpers. Domain rules live here, separate from UI.

import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../data/categories.js';
import { isValidISODate } from './date.js';

const validCents = (v) => Number.isInteger(v) && v > 0;

export function isPositiveFinite(n) {
  return Number.isFinite(n) && n > 0;
}

// Whole-number helper to get an integer-cents value from a decimal string/number.
// Avoids floating point hiccups like 19.9 * 100 -> 1989.9999...
export function toCents(value) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value < 0) return 0;
    return Math.round(value * 100);
  }
  if (typeof value !== 'string') return 0;
  const s = String(value).replace(/[^0-9.\-]/g, '');
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

const EXPENSE_ID = new Set(EXPENSE_CATEGORIES.map((c) => c.id));
const INCOME_ID = new Set(INCOME_CATEGORIES.map((c) => c.id));

/**
 * Validate a transaction form payload.
 * @returns {{ errors: object, value: object }}
 *  errors keyed by field name; value is the canonical object if nothing failed.
 */
export function validateTransaction(form) {
  const errors = {};

  const title = (form.title || '').trim();
  if (!title) errors.title = 'A title or merchant is required.';

  const type = form.type === 'income' ? 'income' : 'expense';
  const category = (form.category || '').trim();
  const okCat = type === 'income' ? INCOME_ID.has(category) : EXPENSE_ID.has(category);
  if (!category) errors.category = 'Please choose a category.';
  else if (!okCat) errors.category = 'Category mismatch with the selected type.';

  const amount = (form.amount || '').toString();
  const cents = toCents(amount);
  if (amount === '' || amount === null) errors.amount = 'Amount is required.';
  else if (cents <= 0) errors.amount = 'Amount must be a positive number.';
  else if (cents > 1_000_000_000_00) errors.amount = 'Amount is too large.';

  const date = form.date || '';
  if (!date) errors.date = 'A date is required.';
  else if (!isValidISODate(date)) errors.date = 'The date must be valid and be in the past or today.';

  if (Object.keys(errors).length > 0) return { errors, value: null };

  const value = {
    title,
    amount: cents,
    type,
    category,
    date,
    description: (form.description || '').trim() || null,
    paymentMethod: form.paymentMethod || null
  };
  return { errors: {}, value };
}

export function validateBudget(form) {
  const errors = {};
  const category = (form.category || '').trim();
  if (!category || !EXPENSE_ID.has(category)) errors.category = 'Choose an expense category.';
  const month = (form.month || '').trim();
  if (!/^\d{4}-\d{2}$/.test(month)) errors.month = 'Please choose a month.';
  const cents = toCents(form.amount);
  if (cents <= 0) errors.amount = 'Budget amount must be positive.';
  if (Object.keys(errors).length > 0) return { errors, value: null };
  return {
    errors: {},
    value: { category, month, budgetCents: cents, note: (form.note || '').trim() || null }
  };
}

export function validateGoal(form) {
  const errors = {};
  const name = (form.name || '').trim();
  if (!name) errors.name = 'Goal name is required.';
  const target = toCents(form.target);
  if (target <= 0) errors.target = 'Target must be positive.';
  let saved = toCents(form.saved);
  if (target > 0 && saved < 0) errors.saved = 'Saved amount can\'t be negative.';
  if (saved > target) saved = target;
  const targetDate = form.targetDate || null;
  if (targetDate && !isValidISODate(targetDate)) errors.targetDate = 'Target date is invalid.';
  if (Object.keys(errors).length > 0) return { errors, value: null };
  return {
    errors: {},
    value: { name, targetCents: target, savedCents: saved, targetDate, description: (form.description || '').trim() || null }
  };
}