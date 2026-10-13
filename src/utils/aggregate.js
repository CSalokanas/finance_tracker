// Pure aggregate calculations. All functions accept plain data and return
// numbers in integer cents. Income is stored as POSITIVE cents; expenses are
// interviewed as POSITIVE cents with the type saying which is which.

import { monthKey as mk, lastNMonthKeys } from './date.js';

/**
 * Filter transactions to a given month ("YYYY-MM").
 * @param {Array} transactions
 * @param {string} monthKey "YYYY-MM"
 */
export function transactionsForMonth(transactions, key) {
  return transactions.filter((t) => mk(t.date) === key);
}

/** Total income in the given transactions (sum of amountCents). */
export function sumIncome(transactions) {
  return transactions.reduce((sum, t) => (t.type === 'income' ? sum + (t.amountCents || 0) : sum), 0);
}

/** Total expenses in the given transactions (sum of amountCents for expenses). */
export function sumExpense(transactions) {
  return transactions.reduce((sum, t) => (t.type === 'expense' ? sum + (t.amountCents || 0) : sum), 0);
}

export function netCashFlow(transactions) {
  return sumIncome(transactions) - sumExpense(transactions);
}

/**
 * Sum expense amountCents grouped by category. Returns a Map<categoryId, cents>.
 */
export function expenseByCategory(transactions) {
  const map = new Map();
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    const cur = map.get(t.category) || 0;
    map.set(t.category, cur + (t.amountCents || 0));
  }
  return map;
}

/**
 * Sum expense amount for a single category in a list of transactions.
 * @param {Array} transactions  accepted also as a single month-key filter
 * @param {string} category
 */
export function sumByCategory(transactions, category) {
  return transactions.reduce((sum, t) => (t.type === 'expense' && t.category === category ? sum + (t.amountCents || 0) : sum), 0);
}

/**
 * Monthly summary of income and expense for the given keys (oldest first).
 * Returns [{ key, label, income, expense, net }]
 */
export function monthlySeries(transactions, monthKeys, labelFn) {
  return monthKeys.map((key) => {
    const arr = transactionsForMonth(transactions, key);
    const income = sumIncome(arr);
    const expense = sumExpense(arr);
    return {
      key,
      label: labelFn ? labelFn(key) : key,
      income,
      expense,
      net: income - expense
    };
  });
}

/**
 * Sum of savings goals: sum of savedCents.
 */
export function totalSaved(goals) {
  return goals.reduce((s, g) => s + (g.savedCents || 0), 0);
}

export function upcomingGoalsInDays(goals, todayKey, daysAhead = 30) {
  if (!Array.isArray(goals)) return [];
  // Compare against today + N days.
  const base = new Date(todayKey.slice(0, 4), Number(todayKey.slice(5, 7)) - 1, Number(todayKey.slice(8, 10)) || 1);
  const target = new Date(base);
  target.setDate(base.getDate() + daysAhead);
  const pad = (n) => String(n).padStart(2, '0');
  const limit = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`;
  return goals.filter((g) => g.targetDate && g.targetDate >= todayKey && g.targetDate <= limit);
}

/**
 * Prev-month and current-month comparison of expenses.
 * Returns { current, previous, delta, deltaPct, direction: 'up'|'down'|'same' }.
 */
export function expenseDeltaVsPreviousMonth(transactions, currentKey) {
  const current = sumExpense(transactionsForMonth(transactions, currentKey));
  const previousKey = (() => {
    const keys = lastNMonthKeys(2, currentKey);
    return keys[0];
  })();
  const previous = sumExpense(transactionsForMonth(transactions, previousKey));
  const delta = current - previous;
  const dir = previous === 0 ? (current > 0 ? 'up' : 'same') : (delta === 0 ? 'same' : delta > 0 ? 'up' : 'down');
  const deltaPct = previous === 0 ? (current > 0 ? Infinity : 0) : (delta / previous) * 100;
  return { current, previous, previousKey, delta, deltaPct, direction: dir };
}