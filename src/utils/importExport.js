// Import / Export / Backup helpers.
// - Export: JSON backup file with a sensible name + schema version.
// - Import: defensively parse+validate so a malicious or damaged file can never
//   corrupt the in-memory application state.

import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../data/categories.js';
import { isValidISODate } from './date.js';

const EXPORT_VERSION = 1;
const EXPENSE_IDS = new Set(EXPENSE_CATEGORIES.map((c) => c.id));
const INCOME_IDS = new Set(INCOME_CATEGORIES.map((c) => c.id));
const METHOD_IDS = new Set(PAYMENT_METHODS.map((p) => p.id));

function isIntCent(v) {
  return Number.isInteger(v) && v >= 0;
}

function maybeInstant(v) {
  return v === null || v === undefined || typeof v === 'string';
}

/**
 * Validate the shape of a parsed payload. Returns { ok, error, value }.
 * `value` is ONLY populated when `ok === true`.
 */
export function validateImportedData(data) {
  if (!data || typeof data !== 'object') return { ok: false, error: 'File is not a valid JSON object.' };
  const txn = data.transactions;
  const budgets = data.budgets || [];
  const goals = data.goals || [];
  if (!Array.isArray(txn)) return { ok: false, error: '"transactions" array is missing.' };
  if (!Array.isArray(budgets)) return { ok: false, error: '"budgets" must be an array.' };
  if (!Array.isArray(goals)) return { ok: false, error: '"goals" must be an array.' };

  const seenIds = new Set();
  const collisions = (id) => {
    if (typeof id !== 'string' || id.length === 0) return true;
    if (seenIds.has(id)) return true;
    seenIds.add(id);
    return false;
  };

  for (let i = 0; i < txn.length; i++) {
    const t = txn[i];
    if (!t || typeof t !== 'object') return { ok: false, error: `transactions[${i}] is not an object.` };
    if (collisions(t.id)) return { ok: false, error: `Duplicate transaction id at position ${i}.` };
    if (typeof t.title !== 'string' || t.title.length === 0) return { ok: false, error: `transactions[${i}].title is required.` };
    if (t.type !== 'income' && t.type !== 'expense') return { ok: false, error: `transactions[${i}].type must be income|expense.` };
    const isIncome = t.type === 'income';
    const okCat = isIncome ? INCOME_IDS.has(t.category) : EXPENSE_IDS.has(t.category);
    if (typeof t.category !== 'string' || !okCat) return { ok: false, error: `transactions[${i}].category "${t.category}" is not valid for type ${t.type}.` };
    if (!isIntCent(t.amount)) return { ok: false, error: `transactions[${i}].amount must be a non-negative integer (cents).` };
    if (!isValidISODate(t.date)) return { ok: false, error: `transactions[${i}].date "${t.date}" is not a valid YYYY-MM-DD date.` };
    if (t.description !== null && typeof t.description !== 'string') return { ok: false, error: `transactions[${i}].description must be string|null.` };
    if (t.paymentMethod !== null && !METHOD_IDS.has(t.paymentMethod)) return { ok: false, error: `transactions[${i}].paymentMethod "${t.paymentMethod}" is unknown.` };
    if (t.createdAt !== null && !maybeInstant(t.createdAt)) return { ok: false, error: `transactions[${i}].createdAt must be string|null.` };
    if (t.amount === 0) return { ok: false, error: `transactions[${i}].amount must be greater than 0.` };
  }

  for (let i = 0; i < budgets.length; i++) {
    const b = budgets[i];
    if (!b || typeof b !== 'object') return { ok: false, error: `budgets[${i}] is not an object.` };
    if (collisions(`budget:${b.id}`)) return { ok: false, error: `Duplicate budget id at position ${i}.` };
    if (typeof b.category !== 'string' || !EXPENSE_IDS.has(b.category)) return { ok: false, error: `budgets[${i}].category "${b.category}" is not a valid expense category.` };
    if (!/^\d{4}-\d{2}$/.test(b.month || '')) return { ok: false, error: `budgets[${i}].month must be YYYY-MM.` };
    if (!isIntCent(b.budgetCents) || b.budgetCents <= 0) return { ok: false, error: `budgets[${i}].budgetCents must be a positive integer.` };
    if (b.note !== null && typeof b.note !== 'string') return { ok: false, error: `budgets[${i}].note must be string|null.` };
  }

  for (let i = 0; i < goals.length; i++) {
    const g = goals[i];
    if (!g || typeof g !== 'object') return { ok: false, error: `goals[${i}] is not an object.` };
    if (collisions(`goal:${g.id}`)) return { ok: false, error: `Duplicate goal id at position ${i}.` };
    if (typeof g.name !== 'string' || g.name.length === 0) return { ok: false, error: `goals[${i}].name is required.` };
    if (!isIntCent(g.targetCents) || g.targetCents <= 0) return { ok: false, error: `goals[${i}].targetCents must be a positive integer.` };
    if (!isIntCent(g.savedCents)) return { ok: false, error: `goals[${i}].savedCents must be a non-negative integer.` };
    if (g.targetDate !== null && !isValidISODate(g.targetDate)) return { ok: false, error: `goals[${i}].targetDate must be a valid date or null.` };
    if (g.description !== null && typeof g.description !== 'string') return { ok: false, error: `goals[${i}].description must be string|null.` };
  }

  return { ok: true, error: null, value: data };
}

/**
 * Read a File, parse it, and validate.
 * Rejects:
 * - non-JSON
 * - JSON without the expected shape
 * - invalid data
 * Returns { ok, error, data }.
 */
export function parseAndValidateFile(file) {
  return new Promise((resolve) => {
    if (!file || typeof file.text !== 'function') {
      return resolve({ ok: false, error: 'Unsupported file type.', data: null });
    }
    file
      .text()
      .then((text) => {
        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch (e) {
          return resolve({ ok: false, error: `Invalid JSON: ${e.message}`, data: null });
        }
        const res = validateImportedData(parsed);
        return resolve({
          ok: res.ok,
          error: res.error,
          data: res.ok ? res.value : null
        });
      })
      .catch((e) => resolve({ ok: false, error: e.message, data: null }));
  });
}

/**
 * Build the canonical export payload. The user's current state is frozen into a
 * snapshot object; writing the file is left to the caller (keep here decoupled).
 */
export function buildExport(state) {
  return {
    app: 'spendly',
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    currency: state?.settings?.currency || 'EUR',
    transactions: Array.isArray(state?.transactions) ? state.transactions : [],
    budgets: Array.isArray(state?.budgets) ? state.budgets : [],
    goals: Array.isArray(state?.goals) ? state.goals : [],
    settings: state?.settings || {}
  };
}

export function exportFilename() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `spendly-backup-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`;
}

export function downloadJson(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}