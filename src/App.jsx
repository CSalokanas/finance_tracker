import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ToastProvider } from './hooks/useToast.jsx';
import { ThemeProvider } from './hooks/useTheme.jsx';
import { loadState, saveState, clearAllStoredData } from './utils/storage.js';
import { buildDemoTransactions, buildDemoBudgets, buildDemoGoals } from './utils/demoData.js';
import { currentMonthKey, monthKeyLabel } from './utils/date.js';
import { buildExport, downloadJson, exportFilename } from './utils/importExport.js';
import Sidebar from './components/layout/Sidebar.jsx';
import Header from './components/layout/Header.jsx';
import Modal from './components/ui/Modal.jsx';
import ConfirmDialog from './components/ui/ConfirmDialog.jsx';
import OverviewPage from './pages/OverviewPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import BudgetsPage from './pages/BudgetsPage.jsx';
import GoalsPage from './pages/GoalsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import TransactionForm from './components/transactions/TransactionForm.jsx';
import { useToast } from './hooks/useToast.jsx';

const EMPTY_STATE = {
  transactions: [],
  budgets: [],
  goals: [],
  settings: {
    displayName: '',
    currency: 'EUR',
    theme: 'dark',
    dashboardMonth: currentMonthKey()
  },
  dataOrigin: 'empty'
};

function newId(prefix) {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${prefix}_${Math.floor(Math.random() * 1e9).toString(36)}${Date.now().toString(36)}`;
}

function pickInitial() {
  const { state, corrupted } = loadState();
  if (corrupted) {
    try { localStorage.removeItem('spendly.v1'); } catch { /* ignore */ }
    return { ...EMPTY_STATE, dataOrigin: 'corrupted', showCorruptedToast: true };
  }
  if (!state) {
    return {
      transactions: buildDemoTransactions(),
      budgets: buildDemoBudgets(),
      goals: buildDemoGoals(),
      settings: { ...EMPTY_STATE.settings, theme: 'dark', currency: 'EUR', dashboardMonth: currentMonthKey() },
      dataOrigin: 'demo'
    };
  }
  return {
    transactions: Array.isArray(state.transactions) ? state.transactions : [],
    budgets: Array.isArray(state.budgets) ? state.budgets : [],
    goals: Array.isArray(state.goals) ? state.goals : [],
    settings: { ...EMPTY_STATE.settings, ...(state.settings || {}) },
    dataOrigin: 'user'
  };
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [section, setSection] = useState('overview');
  const [corrupted, setCorrupted] = useState(false);
  const [dataOrigin, setDataOrigin] = useState('demo');
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [settings, setSettings] = useState(EMPTY_STATE.settings);
  const [month, setMonth] = useState(currentMonthKey());
  const [txnModal, setTxnModal] = useState(null);
  const [txnDelete, setTxnDelete] = useState(null);
  const [budgetDelete, setBudgetDelete] = useState(null);
  const [goalDelete, setGoalDelete] = useState(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  useEffect(() => {
    const init = pickInitial();
    setCorrupted(!!init.showCorruptedToast);
    setDataOrigin(init.dataOrigin || 'demo');
    setTransactions(init.transactions || []);
    setBudgets(init.budgets || []);
    setGoals(init.goals || []);
    const s = { ...init.settings };
    s.dashboardMonth = s.dashboardMonth || currentMonthKey();
    setSettings(s);
    setMonth(s.dashboardMonth || currentMonthKey());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveState({ transactions, budgets, goals, settings });
  }, [transactions, budgets, goals, settings, ready]);

  const themeValue = settings.theme || 'dark';
  const setAppSettings = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), []);

  const addTXShortcut = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      setTxnModal((m) => (m ? m : { mode: 'add' }));
    }
  }, []);
  useEffect(() => {
    window.addEventListener('keydown', addTXShortcut);
    return () => window.removeEventListener('keydown', addTXShortcut);
  }, [addTXShortcut]);

  const monthlyBudgets = useMemo(() => budgets.filter((b) => b.month === month), [budgets, month]);
  const demoBadge = dataOrigin === 'demo';

  const handleAddTransaction = (mode, tx) => setTxnModal({ mode, tx });
  const closeTxnModal = () => setTxnModal(null);

  const saveTransaction = (payload) => {
    const isEdit = txnModal?.mode === 'edit' && txnModal?.tx;
    const editId = isEdit ? txnModal.tx.id : null;
    setTransactions((list) => {
      if (editId) return list.map((t) => (t.id === editId ? { ...t, ...payload, updatedAt: new Date().toISOString() } : t));
      return [{ ...payload, id: newId('t'), createdAt: new Date().toISOString() }, ...list];
    });
    setTxnModal(null);
  };

  const applyImported = (imported, mode) => {
    setTransactions((list) => {
      if (mode === 'replace') return imported.transactions || [];
      const ids = new Set(list.map((t) => t.id));
      return [...list, ...((imported.transactions || []).filter((t) => !ids.has(t.id)))];
    });
    setBudgets((list) => {
      if (mode === 'replace') return imported.budgets || [];
      const keys = new Set(list.map((b) => `${b.category}|${b.month}`));
      return [...list, ...((imported.budgets || []).filter((b) => !keys.has(`${b.category}|${b.month}`)))];
    });
    setGoals((list) => {
      if (mode === 'replace') return imported.goals || [];
      const ids = new Set(list.map((g) => g.id));
      return [...list, ...((imported.goals || []).filter((g) => !ids.has(g.id)))];
    });
    if (mode === 'replace' && imported.settings) {
      setSettings((s) => ({ ...s, displayName: imported.settings.displayName ?? s.displayName }));
    }
  };

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)', color: 'var(--text-muted)' }}>
        <div className="card-pad text-muted-c text-sm">Loading Spendly…</div>
      </div>
    );
  }

  return (
    <ThemeProvider initialTheme={themeValue}>
      <ToastProvider>
        <div className="min-h-screen bg-bg text-ink flex">
          <Sidebar section={section} onNavigate={setSection} demoBadge={demoBadge} />
          <div className="flex-1 min-w-0 flex flex-col">
            <Header
              section={section}
              month={month}
              currency={settings.currency}
              onPrevMonth={() => setMonth((m) => shiftMonth(m, -1))}
              onNextMonth={() => setMonth((m) => shiftMonth(m, 1))}
              onAddTransaction={() => handleAddTransaction('add')}
              settings={settings}
              setSettings={setAppSettings}
              onOpenSettings={() => setSection('settings')}
            />
            <main className="page flex-1 pt-0 mt-0">
              {section === 'overview' && (
                <OverviewPage
                  month={month}
                  setMonth={setMonth}
                  transactions={transactions}
                  budgets={budgets}
                  goals={goals}
                  currency={settings.currency}
                  displayName={settings.displayName}
                  dataOrigin={dataOrigin}
                  onOpenTxn={handleAddTransaction}
                  onNavigate={setSection}
                />
              )}
              {section === 'transactions' && (
                <TransactionsPage
                  month={month}
                  setMonth={setMonth}
                  transactions={transactions}
                  currency={settings.currency}
                  onOpenAdd={() => setTxnModal({ mode: 'add' })}
                  onOpenEdit={(tx) => setTxnModal({ mode: 'edit', tx })}
                  onOpenDelete={(tx) => setTxnDelete(tx)}
                />
              )}
              {section === 'budgets' && (
                <BudgetsPage
                  month={month}
                  setMonth={setMonth}
                  budgets={budgets}
                  setBudgets={setBudgets}
                  transactions={transactions}
                  currency={settings.currency}
                  onOpenDelete={(b) => setBudgetDelete(b)}
                />
              )}
              {section === 'goals' && (
                <GoalsPage
                  goals={goals}
                  setGoals={setGoals}
                  currency={settings.currency}
                  onOpenDelete={(g) => setGoalDelete(g)}
                />
              )}
              {section === 'reports' && (
                <ReportsPage
                  month={month}
                  setMonth={setMonth}
                  transactions={transactions}
                  budgets={budgets}
                  currency={settings.currency}
                />
              )}
              {section === 'settings' && (
                <SettingsPage
                  settings={settings}
                  dataOrigin={dataOrigin}
                  setSettings={setAppSettings}
                  onResetDemo={() => setResetConfirm(true)}
                  onClearAll={() => setClearConfirm(true)}
                  onImport={applyImported}
                  onExport={() =>
                    downloadJson(
                      buildExport({ transactions, budgets, goals, settings }),
                      exportFilename()
                    )
                  }
                />
              )}
            </main>
          </div>
        </div>

        {txnModal && (
          <Modal
            open={!!txnModal}
            onClose={closeTxnModal}
            title={txnModal.mode === 'edit' ? 'Edit transaction' : 'Add transaction'}
            maxWidth="44rem"
          >
            <TransactionForm
              initial={txnModal.tx || null}
              onSubmit={saveTransaction}
              onCancel={closeTxnModal}
              currency={settings.currency}
            />
          </Modal>
        )}

        {txnDelete && (
          <ConfirmDialog
            title="Delete transaction?"
            body={`"${txnDelete.title}" will be permanently removed.`}
            tone="danger"
            confirmLabel="Delete"
            onConfirm={() => {
              setTransactions((list) => list.filter((t) => t.id !== txnDelete.id));
              setTxnDelete(null);
            }}
            onCancel={() => setTxnDelete(null)}
          />
        )}

        {budgetDelete && (
          <ConfirmDialog
            title="Delete budget?"
            body={`The ${monthKeyLabel(budgetDelete.month || month)} "${budgetDelete.category}" budget will be removed.`}
            tone="danger"
            confirmLabel="Delete"
            onConfirm={() => {
              setBudgets((list) => list.filter((b) => b.id !== budgetDelete.id));
              setBudgetDelete(null);
            }}
            onCancel={() => setBudgetDelete(null)}
          />
        )}

        {goalDelete && (
          <ConfirmDialog
            title="Delete savings goal?"
            body={`"${goalDelete.name}" will be removed. This cannot be undone.`}
            tone="danger"
            confirmLabel="Delete"
            onConfirm={() => {
              setGoals((list) => list.filter((g) => g.id !== goalDelete.id));
              setGoalDelete(null);
            }}
            onCancel={() => setGoalDelete(null)}
          />
        )}

        {resetConfirm && (
          <ConfirmDialog
            title="Reset demo data?"
            body="This replaces the current data with the original demonstration dataset. Anything you added will be lost."
            tone="primary"
            confirmLabel="Reset to demo"
            onConfirm={() => {
              clearAllStoredData();
              setTransactions(buildDemoTransactions());
              setBudgets(buildDemoBudgets());
              setGoals(buildDemoGoals());
              setDataOrigin('demo');
              setCorrupted(false);
              setResetConfirm(false);
            }}
            onCancel={() => setResetConfirm(false)}
          />
        )}

        {clearConfirm && (
          <ConfirmDialog
            title="Clear ALL application data?"
            body="This deletes every transaction, budget, savings goal, and preference in this browser. Export a backup from Settings first if you'd like to keep anything."
            tone="danger"
            confirmLabel="Delete everything"
            onConfirm={() => {
              clearAllStoredData();
              setTransactions([]);
              setBudgets([]);
              setGoals([]);
              setSettings(EMPTY_STATE.settings);
              setDataOrigin('empty');
              setCorrupted(false);
              setMonth(currentMonthKey());
              setClearConfirm(false);
            }}
            onCancel={() => setClearConfirm(false)}
          />
        )}

        {corrupted && (
          <CorruptedBanner
            onDismiss={() => setCorrupted(false)}
            onReset={() => {
              clearAllStoredData();
              setTransactions(buildDemoTransactions());
              setBudgets(buildDemoBudgets());
              setGoals(buildDemoGoals());
              setDataOrigin('demo');
              setCorrupted(false);
            }}
          />
        )}
      </ToastProvider>
    </ThemeProvider>
  );
}

function shiftMonth(monthKey, delta) {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function CorruptedBanner({ onDismiss, onReset }) {
  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 sm:right-auto sm:w-96 rounded-lg p-3 flex items-start gap-3"
      style={{ background: 'color-mix(in srgb, var(--warning) 12%, var(--bg))', border: '1px solid var(--warning)' }}
      role="alert"
    >
      <div className="flex-1 text-sm">
        <strong>Stored data was unreadable.</strong>{' '}
        Please add fresh data, or reset to demo.
        <div className="flex gap-2 mt-2">
          <button className="btn btn-ghost btn-sm" onClick={onDismiss}>Dismiss</button>
          <button className="btn btn-primary btn-sm" onClick={onReset}>Reset to demo</button>
        </div>
      </div>
    </div>
  );
}