// Demo dataset. Loaded ONCE on first launch (when no stored data exists).
// All values are in integer cents. Dates are built relative to today so the
// dashboard always looks "current". Clearly labeled as demonstration data so the
// user knows it is not their own bank data.

import { nowISO } from './date.js';

function d(day, monthOffset = 0) {
  const now = new Date();
  const dte = new Date(now.getFullYear(), now.getMonth() + monthOffset, day);
  const p = (n) => String(n).padStart(2, '0');
  return `${dte.getFullYear()}-${p(dte.getMonth() + 1)}-${p(dte.getDate())}`;
}

function m(monthOffset) {
  const now = new Date();
  const t = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`;
}

function uid(prefix = 't') {
  const rand =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Math.floor(Math.random() * 1e9).toString(36)}-${Date.now().toString(36)}`;
  return `${prefix}_${rand}`;
}

function dxn(o) {
  return {
    ...o,
    id: o.id || uid('t'),
    amountCents: Math.round(Number(o.amount) * 100),
    description: o.description || null,
    paymentMethod: o.paymentMethod || null,
    createdAt: o.createdAt || nowISO()
  };
}

export function buildDemoTransactions() {
  const L = (t) => d(t, 0);
  const P = (t) => d(t, -1);
  const T = (t) => d(t, 1);
  const txs = [];
  // A realistic mix of real-life transactions for the current month,
  // last month, and next-month projected salary/bill.
  // ---- This month ----
  txs.push(dxn({ title: 'Monthly Rent (Housing)', type: 'expense', category: 'housing', date: L(3), amount: 950.0, description: 'Rent for the month', createdAt: nowISO() }));
  txs.push(dxn({ title: 'Landlord: electricity', type: 'expense', category: 'bills', date: L(5), amount: 62.4, description: 'Electric bill', createdAt: nowISO() }));
  txs.push(dxn({ title: 'Internet Bill', type: 'expense', category: 'bills', date: L(6), amount: 40.0, description: 'Fiber 100mbps', createdAt: nowISO() }));
  txs.push(dxn({ title: 'Nearest Grocery Store', type: 'expense', category: 'groceries', date: L(2), amount: 88.2, description: 'Weekly groceries', createdAt: nowISO() }));
  txs.push(dxn({ title: 'Nearest Grocery Store', type: 'expense', category: 'groceries', date: L(8), amount: 104.7, description: 'Weekly groceries', createdAt: nowISO() }));
  txs.push(dxn({ title: 'Nearest Grocery Store', type: 'expense', category: 'groceries', date: L(15), amount: 76.3, description: 'Weekly groceries', createdAt: nowISO() }));
  txs.push(dxn({ title: 'Café Crema (Lunch)', type: 'expense', category: 'food_dining', date: L(3), amount: 18.5, description: 'Lunch burger', createdAt: nowISO() }));
  txs.push(dxn({ title: 'Sushi Night', type: 'expense', category: 'food_dining', date: L(10), amount: 42.0, description: 'Dinner out with friends', createdAt: nowISO() }));
  txs.push(dxn({ title: 'Priori Books — Textbooks', type: 'expense', category: 'education', date: L(4), amount: 120.0, description: 'Spring book list', createdAt: nowISO() }));
  txs.push(dxn({ title: 'City Bus (Weekly pass)', type: 'expense', category: 'transport', date: L(4), amount: 30.0, description: 'Weekly transit', createdAt: nowISO() }));
  txs.push(dxn({ title: 'Ride Share to Airport', type: 'expense', category: 'transport', date: L(20), amount: 28.4, description: 'Ride share', createdAt: nowISO() }));
  txs.push(dxn({ title: 'Neighborhood Pharmacy', type: 'expense', category: 'health', date: L(12), amount: 14.8, description: 'Cough syrup', createdAt: nowISO() }));
  txs.push(dxn({ title: 'Neibu G - Gaming bundle', type: 'expense', category: 'entertainment', date: L(11), amount: 59.99, description: 'Steam deal', createdAt: nowISO() }));
  txs.push(dxn({ title: 'Season 2 tickets (Cinemark)', type: 'expense', category: 'entertainment', date: L(16), amount: 26.5, description: 'Movie night', createdAt: nowISO() }));
  txs.push(dxn({ title: 'Uplift Boutique — Shirt', type: 'expense', category: 'shopping', date: L(14), amount: 45.0, description: 'Casual shirt', createdAt: nowISO() }));
  txs.push(dxn({ title: 'Neighborhood Gym (Day)', type: 'expense', category: 'other_expense', date: L(13), amount: 25.0, description: 'Guest day', createdAt: nowISO() }));
  txs.push(dxn({ title: 'Netflix', type: 'expense', category: 'subscriptions', date: L(7), amount: 15.99, description: 'Streaming', createdAt: nowISO() }));
  txs.push(dxn({ title: 'Spotify Premium', type: 'expense', category: 'subscriptions', date: L(9), amount: 10.99, description: 'Music', createdAt: nowISO() }));
  txs.push(dxn({ title: 'Salary', type: 'income', category: 'salary', date: L(1), amount: 2100.0, description: 'Monthly payslip', createdAt: nowISO() }));
  txs.push(dxn({ title: 'Freelance Project — Web', type: 'income', category: 'freelance', date: L(18), amount: 240.0, description: 'Client: Acme Co', createdAt: nowISO() }));

  // ---- Last month (for chart trends) ----
  txs.push(dxn({ title: 'Monthly Rent (Housing)', type: 'expense', category: 'housing', date: P(3), amount: 950.0, createdAt: nowISO() }));
  txs.push(dxn({ title: 'Internet Bill', type: 'expense', category: 'bills', date: P(6), amount: 40.0, createdAt: nowISO() }));
  txs.push(dxn({ title: 'Friday Grocery Store', type: 'expense', category: 'groceries', date: P(2), amount: 89.6, createdAt: nowISO() }));
  txs.push(dxn({ title: 'Friday Grocery Store', type: 'expense', category: 'groceries', date: P(9), amount: 72.4, createdAt: nowISO() }));
  txs.push(dxn({ title: 'Friday Grocery Store', type: 'expense', category: 'groceries', date: P(16), amount: 95.1, createdAt: nowISO() }));
  txs.push(dxn({ title: 'Café Crema (Lunch)', type: 'expense', category: 'food_dining', date: P(8), amount: 17.5, createdAt: nowISO() }));
  txs.push(dxn({ title: 'City Bus pass', type: 'expense', category: 'transport', date: P(4), amount: 30.0, createdAt: nowISO() }));
  txs.push(dxn({ title: 'Sushi Night', type: 'expense', category: 'food_dining', date: P(11), amount: 38.0, createdAt: nowISO() }));
  txs.push(dxn({ title: 'Kinopik — Sneakers', type: 'expense', category: 'shopping', date: P(20), amount: 79.99, createdAt: nowISO() }));
  txs.push(dxn({ title: 'Charger - Travel', type: 'expense', category: 'other_expense', date: P(14), amount: 12.0, createdAt: nowISO() }));
  txs.push(dxn({ title: 'Neibu G - Console game', type: 'expense', category: 'entertainment', date: P(10), amount: 69.99, createdAt: nowISO() }));
  txs.push(dxn({ title: 'Salary', type: 'income', category: 'salary', date: P(1), amount: 1850.0, createdAt: nowISO() }));
  txs.push(dxn({ title: 'Freelance Project — Content', type: 'income', category: 'freelance', date: P(22), amount: 180.0, createdAt: nowISO() }));

  // ---- Next month (projected bills) ----
  txs.push(dxn({ title: 'Monthly Rent (Housing) — budgeted', type: 'expense', category: 'housing', date: T(3), amount: 950.0, description: 'Budgeted bill, not yet spent', createdAt: nowISO() }));
  txs.push(dxn({ title: 'Salary (projected)', type: 'income', category: 'salary', date: T(1), amount: 2100.0, description: 'Projected for the month ahead', createdAt: nowISO() }));

  return txs;
}

export function buildDemoBudgets() {
  const cur = m(0);
  const uid2 = () => uid('b');
  return [
    { id: uid2(), category: 'groceries', month: cur, budgetCents: 300.0 * 100, note: 'Weekly shopping' },
    { id: uid2(), category: 'food_dining', month: cur, budgetCents: 120.0 * 100, note: null },
    { id: uid2(), category: 'entertainment', month: cur, budgetCents: 80.0 * 100, note: null },
    { id: uid2(), category: 'transport', month: cur, budgetCents: 50.0 * 100, note: null },
    { id: uid2(), category: 'shopping', month: cur, budgetCents: 75.0 * 100, note: 'Clothes only' }
  ];
}

export function buildDemoGoals() {
  const uid3 = () => uid('g');
  // Target dates anchored relative to "today" so the demo feels current.
  const inDays = (days) => {
    const t = new Date();
    const d = new Date(t);
    d.setDate(t.getDate() + days);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };
  const cur = m(0);
  return [
    {
      id: uid3(),
      name: 'Emergency Fund',
      targetCents: 1500.0 * 100,
      savedCents: 840.0 * 100,
      targetDate: inDays(90),
      description: 'A buffer for the unexpected',
      month: cur
    },
    {
      id: uid3(),
      name: 'New Laptop',
      targetCents: 750.0 * 100,
      savedCents: 480.0 * 100,
      targetDate: inDays(120),
      description: 'For university project work',
      month: cur
    },
    {
      id: uid3(),
      name: 'Summer Trip',
      targetCents: 500.0 * 100,
      savedCents: 150.0 * 100,
      targetDate: inDays(180),
      description: 'Weekend getaway with friends',
      month: cur
    }
  ];
}