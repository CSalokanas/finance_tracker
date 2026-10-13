// Core-calculation & validation tests.
// These exercise the domain rules the rest of Spendly relies on:
//   - money conversion from decimal strings to integer cents
//   - form validation (transaction / budget / goal)
//   - date month-shift correctness (across year boundaries)
//   - monthly aggregation and expense deltas

import { describe, it, expect } from 'vitest';

import { toCents, isPositiveFinite, validateTransaction, validateBudget, validateGoal } from '../validation.js';
import { formatMoney, formatMoneySigned, formatPercent } from '../format.js';
import { monthKey, shiftMonth, lastNMonthKeys } from '../date.js';
import { sumIncome, sumExpense, netCashFlow, expenseByCategory, sumByCategory, monthlySeries, expenseDeltaVsPreviousMonth } from '../aggregate.js';

describe('toCents', () => {
  it('converts decimal strings to integer cents without float error', () => {
    expect(toCents('19.9')).toBe(1990);
    expect(toCents('0.1')).toBe(10);
    expect(toCents('100.10')).toBe(10010);
    expect(toCents(100.1)).toBe(10010);
  });

  it('rejects non-numeric, negative, and empty input', () => {
    expect(toCents('')).toBe(0);
    expect(toCents('abc')).toBe(0);
    expect(toCents('-5')).toBe(0);
    expect(toCents(undefined)).toBe(0);
    expect(toCents(NaN)).toBe(0);
  });
});

describe('isPositiveFinite', () => {
  it('accepts positive finite numbers only', () => {
    expect(isPositiveFinite(1)).toBe(true);
    expect(isPositiveFinite(0)).toBe(false);
    expect(isPositiveFinite(-1)).toBe(false);
    expect(isPositiveFinite(Infinity)).toBe(false);
    expect(isPositiveFinite(NaN)).toBe(false);
  });
});

describe('formatMoney', () => {
  it('formats integer cents with reasonable precision', () => {
    // 12345 cents = 123.45 in any currency. The thousands-separator/decimal
    // separator depends on the runtime locale, so we only assert on digits.
    const out = formatMoney(12345, 'EUR');
    expect(out).toMatch(/123/);
    expect(out).toMatch(/45/);
    expect(formatMoney(0, 'EUR')).toMatch(/0/);
  });
  it('switches currency symbol based on code', () => {
    expect(formatMoney(1000, 'USD')).toMatch(/\$/);
    expect(formatMoney(1000, 'GBP')).toMatch(/£|GB/);
  });
  it('uses sign flag to emit a leading minus for negative cents', () => {
    expect(formatMoney(-1000, 'EUR', { sign: true })).toMatch(/-/);
  });
});

describe('formatMoneySigned', () => {
  it('prefixes income with + and expenses with - and formats absolute value', () => {
    expect(formatMoneySigned(1000, 'income', 'EUR')).toMatch(/^\+/);
    expect(formatMoneySigned(1000, 'expense', 'EUR')).toMatch(/^-/);
  });
});

describe('formatPercent', () => {
  it('formats an integer percent with no decimals', () => {
    expect(formatPercent(80)).toBe('80%');
    expect(formatPercent(80.4, { digits: 1 })).toBe('80.4%');
    expect(formatPercent(NaN)).toBe('0%');
  });
});

describe('date monthKey / shiftMonth', () => {
  it('derives YYYY-MM key from an ISO date', () => {
    expect(monthKey('2025-06-15')).toBe('2025-06');
    expect(monthKey('2025-01-01')).toBe('2025-01');
  });
  it('shifts across year boundaries in both directions', () => {
    expect(shiftMonth('2025-01', -1)).toBe('2024-12');
    expect(shiftMonth('2025-01', 1)).toBe('2025-02');
    expect(shiftMonth('2025-12', 1)).toBe('2026-01');
    expect(shiftMonth('2025-12', -1)).toBe('2025-11');
  });
  it('lists the last N month keys oldest-first', () => {
    expect(lastNMonthKeys(3, '2025-02')).toEqual(['2024-12', '2025-01', '2025-02']);
    expect(lastNMonthKeys(1, '2025-11')).toEqual(['2025-11']);
  });
});

describe('validateTransaction', () => {
  const good = {
    title: 'Aldi',
    category: 'groceries',
    type: 'expense',
    amount: '42.50',
    date: '2025-01-15'
  };
  it('accepts a fully valid expense transaction', () => {
    const { errors, value } = validateTransaction(good);
    expect(errors).toEqual({});
    expect(value.amount).toBe(4250);
    expect(value.type).toBe('expense');
  });
  it('rejects a missing or invalid title', () => {
    expect(validateTransaction({ ...good, title: '   ' }).errors.title).toBeTruthy();
  });
  it('rejects a non-positive or non-numeric amount', () => {
    expect(validateTransaction({ ...good, amount: '0' }).errors.amount).toBeTruthy();
    expect(validateTransaction({ ...good, amount: 'abc' }).errors.amount).toBeTruthy();
    expect(validateTransaction({ ...good, amount: '-5' }).errors.amount).toBeTruthy();
  });
  it('rejects a malformed date', () => {
    expect(validateTransaction({ ...good, date: 'not-a-date' }).errors.date).toBeTruthy();
  });
  it('rejects a category mismatch (income category used for expense type)', () => {
    expect(validateTransaction({ ...good, category: 'salary' }).errors.category).toBeTruthy();
  });
});

describe('validateBudget', () => {
  it('rejects an invalid month format', () => {
    const r = validateBudget({ category: 'food_dining', month: '2025/01', amount: '100' });
    expect(r.errors.month).toBeTruthy();
  });
  it('rejects a negative or zero budget amount', () => {
    expect(validateBudget({ category: 'food_dining', month: '2025-01', amount: '0' }).errors.amount).toBeTruthy();
    expect(validateBudget({ category: 'food_dining', month: '2025-01', amount: '-100' }).errors.amount).toBeTruthy();
  });
  it('accepts a valid budget and stores cents', () => {
    const { errors, value } = validateBudget({ category: 'food_dining', month: '2025-01', amount: '500.25' });
    expect(errors).toEqual({});
    expect(value.budgetCents).toBe(50025);
  });
});

describe('validateGoal', () => {
  it('clamps saved to the target when saved exceeds target', () => {
    const { errors, value } = validateGoal({ name: 'Laptop', target: '1200', saved: '9999' });
    expect(errors).toEqual({});
    expect(value.savedCents).toBe(120000);
  });
  it('rejects a target of zero', () => {
    expect(validateGoal({ name: 'x', target: '0', saved: '0' }).errors.target).toBeTruthy();
  });
});

describe('aggregations', () => {
  const txns = [
    { id: '1', type: 'income',  category: 'salary',    amountCents: 200000, date: '2025-01-05' },
    { id: '2', type: 'expense', category: 'groceries', amountCents: 4500,   date: '2025-01-06' },
    { id: '3', type: 'expense', category: 'food_dining', amountCents: 1500, date: '2025-01-07' },
    { id: '4', type: 'expense', category: 'food_dining', amountCents: 1300, date: '2025-01-08' },
    { id: '5', type: 'expense', category: 'food_dining', amountCents: 500,  date: '2024-12-30' }
  ];

  it('splits income and expense correctly', () => {
    expect(sumIncome(txns)).toBe(200000);
    expect(sumExpense(txns)).toBe(4500 + 1500 + 1300 + 500);
    expect(netCashFlow(txns)).toBe(200000 - 7800);
  });
  it('groups expense by category', () => {
    const m = expenseByCategory(txns);
    expect(m.get('groceries')).toBe(4500);
    expect(m.get('food_dining')).toBe(3300);
  });
  it('sums a single category', () => {
    expect(sumByCategory(txns, 'food_dining')).toBe(3300);
  });
  it('produces monthly series oldest-first', () => {
    const series = monthlySeries(txns, ['2024-12', '2025-01']);
    expect(series[0].key).toBe('2024-12');
    expect(series[1].key).toBe('2025-01');
    expect(series[0].expense).toBe(500);
    expect(series[1].expense).toBe(7300);
    expect(series[1].income).toBe(200000);
  });
  it('computes expense delta vs previous month as increase', () => {
    const r = expenseDeltaVsPreviousMonth(txns, '2025-01');
    expect(r.direction).toBe('up');
    expect(r.previous).toBe(500);
    expect(r.current).toBe(7300);
    expect(r.delta).toBe(6800);
  });
});
