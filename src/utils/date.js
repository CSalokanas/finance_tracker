// Date utilities.
// ALL stored dates are YYYY-MM-DD strings in LOCAL time. We deliberately avoid
// using Date.UTC / toISOString for day comparisons, which would shift a date by
// timezone offset and could move a transaction into the wrong day/month.

export function todayLocal() {
  const d = new Date();
  return localToISO(d);
}

export function localToISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function nowISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${localToISO(d)}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function safeParseISO(iso) {
  if (typeof iso !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return isNaN(Date.parse(iso)) ? new Date(iso) : new Date(iso);
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const da = Number(m[3]);
  if (mo < 1 || mo > 12 || da < 1 || da > 31) return null;
  return new Date(y, mo - 1, da);
}

export function isValidISODate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!m) return false;
  const d = safeParseISO(value);
  if (!d) return false;
  return d.getFullYear() === Number(m[1]) &&
    d.getMonth() + 1 === Number(m[2]) &&
    d.getDate() === Number(m[3]);
}

export function startOfIsoMonth(isoDate) {
  const m = /^(\d{4})-(\d{2})/.exec(isoDate || '');
  return m ? `${m[1]}-${m[2]}-01` : `${todayLocal().slice(0, 7)}-01`;
}

export function endOfIsoMonth(isoDate) {
  const m = /^(\d{4})-(\d{2})/.exec(isoDate || '');
  const y = Number(m?.[1] ?? new Date().getFullYear());
  const mo = Number(m?.[2] ?? new Date().getMonth() + 1);
  const last = new Date(y, mo, 0).getDate();
  return `${y}-${String(mo).padStart(2, '0')}-${String(last).padStart(2, '0')}`;
}

// Key for a month in the form "YYYY-MM" derived from any date/iso.
export function monthKey(isoDate) {
  return (isoDate || todayLocal()).slice(0, 7);
}

// Shift a "YYYY-MM"-key by `delta` months (works across year boundaries).
export function shiftMonth(key, delta) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthKeyLabel(key) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function formatDay(isoDate) {
  const d = safeParseISO(isoDate);
  if (!d) return isoDate || '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatShortDay(iso) {
  const d = safeParseISO(iso);
  if (!d) return iso || '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Last N month keys ending at `end` (inclusive). Oldest first.
export function lastNMonthKeys(n, endKey = currentMonthKey()) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) out.push(shiftMonth(endKey, -i));
  return out;
}
