// Category definitions. `color` is a hex value used across charts and UI
// badges. Colors are hand-tuned to be legible on both dark and light themes.

export const EXPENSE_CATEGORIES = [
  { id: 'food_dining',  label: 'Food & Dining',   color: '#f97316' },
  { id: 'groceries',    label: 'Groceries',       color: '#22c55e' },
  { id: 'transport',    label: 'Transport',       color: '#0ea5e9' },
  { id: 'shopping',     label: 'Shopping',        color: '#d946ef' },
  { id: 'entertainment',label: 'Entertainment',   color: '#f43f5e' },
  { id: 'education',    label: 'Education',       color: '#8b5cf6' },
  { id: 'housing',      label: 'Housing',         color: '#eab308' },
  { id: 'bills',        label: 'Bills & Utilities',color: '#14b8a6' },
  { id: 'health',       label: 'Health',          color: '#ef4444' },
  { id: 'travel',       label: 'Travel',          color: '#3b82f6' },
  { id: 'subscriptions',label: 'Subscriptions',   color: '#a3e635' },
  { id: 'other_expense',label: 'Other',           color: '#94a3b8' }
];

export const INCOME_CATEGORIES = [
  { id: 'salary',     label: 'Salary',     color: '#22c55e' },
  { id: 'allowance',  label: 'Allowance',  color: '#34d399' },
  { id: 'freelance',  label: 'Freelance',  color: '#10b981' },
  { id: 'scholarship',label: 'Scholarship',color: '#059669' },
  { id: 'gifts',      label: 'Gifts',      color: '#86efac' },
  { id: 'other_income',label: 'Other',     color: '#94a3b8' }
];

export const PAYMENT_METHODS = [
  { id: 'cash',           label: 'Cash' },
  { id: 'debit',          label: 'Debit Card' },
  { id: 'credit',         label: 'Credit Card' },
  { id: 'bank_transfer',  label: 'Bank Transfer' },
  { id: 'mobile_wallet',  label: 'Mobile Wallet' }
];

const EXPENSE_MAP = Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c.id, c]));
const INCOME_MAP = Object.fromEntries(INCOME_CATEGORIES.map((c) => [c.id, c]));

export function categoryList(type) {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function categoryById(id, type) {
  const map = type === 'income' ? INCOME_MAP : EXPENSE_MAP;
  return map[id] || { id, label: id, color: '#94a3b8' };
}

export function categoryColor(id, type = 'expense') {
  return categoryById(id, type).color;
}

export function categoryLabel(id, type) {
  return categoryById(id, type).label;
}

export function methodLabel(id) {
  return (PAYMENT_METHODS.find((m) => m.id === id) || { label: id }).label;
}
