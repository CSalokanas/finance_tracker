// Currency + number formatting.
// All money is stored as INTEGER CENTS (minor units). These helpers only
// convert to display strings and never round the stored integer.

const CURRENCY_META = {
  EUR: { symbol: '€', name: 'Euro' },
  USD: { symbol: '$', name: 'US Dollar' },
  GBP: { symbol: '£', name: 'British Pound' }
};

export const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' }
];

export function currencySymbol(code) {
  return (CURRENCY_META[code] || CURRENCY_META.EUR).symbol;
}

let cache = new Map();
function getFormatter(currency) {
  if (cache.has(currency)) return cache.get(currency);
  const nf = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  cache.set(currency, nf);
  return nf;
}

/**
 * Format an integer-cents amount into a currency string.
 * Known limitation: currency change does NOT perform FX conversion.
 * @param {number} cents  integer minor units
 * @param {string} currency ISO currency code (EUR|USD|GBP)
 * @param {boolean} sign   include a leading minus for negative amounts
 */
export function formatMoney(cents, currency = 'EUR', { sign = false } = {}) {
  if (!Number.isFinite(cents)) cents = 0;
  const units = cents / 100;
  const val = sign ? units : Math.abs(units);
  let out;
  try {
    out = getFormatter(currency).format(val);
  } catch {
    out = `${currencySymbol(currency)}${val.toFixed(2)}`;
  }
  if (sign && cents < 0 && !out.startsWith('-')) out = `-${out}`;
  return out;
}

// Signed display used in transaction lists: income "€x", expense "-€x".
export function formatMoneySigned(cents, type, currency) {
  return `${type === 'income' ? '+' : '-'}${formatMoney(Math.abs(cents), currency)}`;
}

export function formatPercent(value, { digits = 0 } = {}) {
  if (!Number.isFinite(value)) return '0%';
  return `${value.toFixed(digits)}%`;
}

export function formatCompact(cents, currency = 'EUR') {
  const units = cents / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1, minimumFractionDigits: 0
    }).format(units);
  } catch {
    return formatMoney(cents, currency);
  }
}