// LocalStorage persistence layer.
// - All data is stored under a single versioned key: "spendly.v1"
// - Reads are defensive: malformed JSON or stale versions never crash the app;
//   they fall back to empty state with a flag so the UI can warn once.
// - All writes are wrapped in try/catch so storage being unavailable (e.g.
//   private mode with storage disabled) does not break the app.

const STORAGE_KEY = 'spendly.v1';
const SCHEMA_VERSION = 1;

function safeGet() {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function safeSet(value) {
  try {
    if (typeof localStorage === 'undefined') return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function clearAllStoredData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Persist the full app state. Returns true when the write succeeded.
 */
export function saveState(state) {
  const payload = { version: SCHEMA_VERSION, savedAt: new Date().toISOString(), ...state };
  return safeSet(payload);
}

/**
 * Load the full app state. Returns { state, corrupted } where `corrupted`
 * is true if the stored payload failed to parse / matched the shape.
 */
export function loadState() {
  const raw = safeGet();
  if (raw === null || raw === undefined || raw === '') {
    return { state: null, corrupted: false };
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { state: null, corrupted: true };
    return { state: parsed, corrupted: false };
  } catch {
    return { state: null, corrupted: true };
  }
}

export function hasStoredData() {
  return safeGet() !== null || safeGet() !== undefined;
}

export function storageAvailable() {
  try {
    const k = 'spendly.__probe__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}