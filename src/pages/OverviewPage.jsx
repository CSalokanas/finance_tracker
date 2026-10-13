import React, { useMemo } from 'react';
import {
  ArrowUpRight, ArrowDownRight, Scale, Lightbulb,
  AlertTriangle, PiggyBank, Target, LayoutGrid
} from 'lucide-react';
import SummaryCard from '../components/dashboard/SummaryCard.jsx';
import InsightCard from '../components/dashboard/InsightCard.jsx';
import RecentTransactions from '../components/dashboard/RecentTransactions.jsx';
import { CategoryDonut, IncomeExpenseBar } from '../components/charts/Charts.jsx';
import { formatMoney, formatPercent } from '../utils/format.js';
import {
  transactionsForMonth, sumIncome, sumExpense, expenseByCategory,
  totalSaved, monthlySeries
} from '../utils/aggregate.js';
import { buildInsights } from '../utils/insights.js';
import { lastNMonthKeys, monthKeyLabel } from '../utils/date.js';
import { categoryLabel, categoryColor } from '../data/categories.js';

function shortLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'short' });
}

export default function OverviewPage({
  month, transactions, budgets, goals, currency, displayName,
  dataOrigin, onOpenTxn, onNavigate
}) {
  const monthTx = useMemo(() => transactionsForMonth(transactions, month), [transactions, month]);
  const income = useMemo(() => sumIncome(monthTx), [monthTx]);
  const expense = useMemo(() => sumExpense(monthTx), [monthTx]);
  const net = income - expense;
  const saved = useMemo(() => totalSaved(goals), [goals]);

  const monthBudgets = useMemo(() => budgets.filter((b) => b.month === month), [budgets, month]);
  const catTotals = useMemo(() => expenseByCategory(monthTx), [monthTx]);
  const budgetTotals = useMemo(() => {
    let b = 0; let s = 0;
    for (const k of monthBudgets) {
      b += k.budgetCents;
      s += (catTotals.get(k.category) || 0);
    }
    return { budget: b, spent: s };
  }, [monthBudgets, catTotals]);

  const categoryData = useMemo(
    () =>
      [...catTotals.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([id, value]) => ({
          id,
          value,
          label: categoryLabel(id, 'expense'),
          color: categoryColor(id, 'expense')
        })),
    [catTotals]
  );

  const series6 = useMemo(
    () => monthlySeries(transactions, lastNMonthKeys(6, month), shortLabel),
    [transactions, month]
  );

  const insights = useMemo(
    () =>
      buildInsights({
        monthTransactions: monthTx,
        budgets: monthBudgets,
        goals,
        currency,
        monthKey: month,
        allTransactions: transactions
      }),
    [monthTx, monthBudgets, goals, currency, month, transactions]
  );

  const overBudget = monthBudgets.some((b) => (catTotals.get(b.category) || 0) >= b.budgetCents);
  const warnBudget =
    !overBudget && monthBudgets.some((b) => b.budgetCents > 0 && (catTotals.get(b.category) || 0) / b.budgetCents >= 0.8);

  const demo = dataOrigin === 'demo';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 anim-fade-up">
      <div className="xl:col-span-2 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard label="Total Income" value={formatMoney(income, currency)} sub="This month" tone="success" icon={ArrowUpRight} />
          <SummaryCard label="Total Expenses" value={formatMoney(expense, currency)} sub="This month" tone="danger" icon={ArrowDownRight} />
          <SummaryCard
            label="Net Cash Flow"
            value={formatMoney(Math.abs(net), currency)}
            sub={net >= 0 ? 'In surplus' : 'In deficit'}
            tone={net >= 0 ? 'info' : 'warning'}
            icon={Scale}
          />
          <SummaryCard
            label="Budget Used"
            value={budgetTotals.budget > 0 ? formatPercent((budgetTotals.spent / budgetTotals.budget) * 100) : '—'}
            sub={
              budgetTotals.budget > 0
                ? `${formatMoney(budgetTotals.spent, currency)} of ${formatMoney(budgetTotals.budget, currency)}`
                : 'No budgets set this month'
            }
            tone={
              budgetTotals.budget > 0 && budgetTotals.spent >= budgetTotals.budget
                ? 'danger'
                : budgetTotals.budget > 0 && budgetTotals.spent / budgetTotals.budget >= 0.8
                ? 'warning'
                : 'primary'
            }
            icon={PiggyBank}
          />
        </div>

        {(overBudget || warnBudget) && (
          <div
            className="rounded-lg px-4 py-3 flex items-center gap-3"
            role="alert"
            style={{
              border: `1px solid color-mix(in srgb, ${overBudget ? 'var(--danger)' : 'var(--warning)'} 34%, transparent)`,
              background: `color-mix(in srgb, ${overBudget ? 'var(--danger)' : 'var(--warning)'} 8%, transparent)`
            }}
          >
            <AlertTriangle size={18} style={{ color: overBudget ? 'var(--danger)' : 'var(--warning)' }} />
            <div className="text-sm">
              <strong>{overBudget ? 'Over budget' : 'Budget warning'}: </strong>
              {overBudget
                ? 'You are spending over your monthly budget. Review your largest category.'
                : 'You are approaching a budget limit (80%+). Watch your spending.'}
              <button className="link-btn ml-2" onClick={() => onNavigate('budgets')}>
                View budgets →
              </button>
            </div>
          </div>
        )}

        <div className="card card-pad">
          <div className="mb-4">
            <h3 className="font-semibold">Income vs Expense</h3>
            <p className="text-xs text-muted-c">Last 6 months, by month</p>
          </div>
          {series6.some((s) => s.income > 0 || s.expense > 0)
            ? <IncomeExpenseBar series={series6} currency={currency} />
            : <EmptyChart note="No income or expense data in the last 6 months yet." />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card card-pad">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Recent Transactions</h3>
              <button className="link-btn text-xs" onClick={() => onNavigate('transactions')}>
                View all →
              </button>
            </div>
            <RecentTransactions
              transactions={monthTx}
              currency={currency}
              onOpenDetail={(t) => onOpenTxn?.('edit', t)}
            />
          </div>

          <div className="card card-pad">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Monthly Budgets</h3>
              <button className="link-btn text-xs" onClick={() => onNavigate('budgets')}>
                Manage →
              </button>
            </div>
            {monthBudgets.length === 0 ? (
              <div className="text-sm text-muted-c py-6 text-center">
                No budgets for {monthKeyLabel(month)}. Add one to start tracking.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-1">
                {monthBudgets.slice(0, 5).map((b) => {
                  const spent = catTotals.get(b.category) || 0;
                  const ratio = b.budgetCents > 0 ? spent / b.budgetCents : 0;
                  const color = ratio >= 1 ? 'var(--danger)' : ratio >= 0.8 ? 'var(--warning)' : 'var(--primary)';
                  return (
                    <div key={b.id}>
                      <div className="flex justify-between text-[12px] mb-1">
                        <span className="truncate pr-2 text-base-c font-medium">{categoryLabel(b.category, 'expense')}</span>
                        <span className="text-faint-c tabular whitespace-nowrap">
                          {formatMoney(spent, currency)} / {formatMoney(b.budgetCents, currency)}
                        </span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${Math.min(ratio * 100, 100)}%`, background: color }}
                          role="progressbar"
                          aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.min(ratio, 1) * 100)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card card-pad">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} style={{ color: 'var(--primary)' }} />
            <h3 className="font-semibold">Insights</h3>
          </div>
          {insights.length === 0 ? (
            <p className="text-sm text-muted-c">
              Add transactions to see insights. Spendly only surfaces what your own data supports — no predictions.
            </p>
          ) : (
            <div className="space-y-2.5">
              {insights.map((i) => (<InsightCard key={i.id} item={i} />))}
            </div>
          )}
          {demo && (
            <p className="text-[11px] text-faint-c mt-3 leading-relaxed">
              Based on <em>demo</em> data only. Reset from Settings to start with your own figures.
            </p>
          )}
        </div>

        <div className="card card-pad">
          <h3 className="font-semibold mb-3">Spending by Category</h3>
          {categoryData.length === 0 ? (
            <EmptyChart note="No expenses this month." />
          ) : (
            <CategoryDonut data={categoryData} currency={currency} />
          )}
        </div>

        <div className="card card-pad">
          <div className="flex items-center gap-2 mb-3">
            <Target size={16} style={{ color: 'var(--primary)' }} />
            <h3 className="font-semibold">Savings Goals</h3>
          </div>
          {goals.length === 0 ? (
            <p className="text-sm text-muted-c">
              No savings goals yet. <button className="link-btn" onClick={() => onNavigate('goals')}>Create one →</button>
            </p>
          ) : (
            <>
              <div className="text-2xl font-bold tabular">{formatMoney(saved, currency)}</div>
              <div className="text-[11px] text-faint-c">
                Total saved toward {goals.length} goal{goals.length > 1 ? 's' : ''}
              </div>
              <div className="mt-3 space-y-2">
                {goals.slice(0, 3).map((g) => {
                  const pct = g.targetCents > 0 ? (g.savedCents / g.targetCents) * 100 : 0;
                  return (
                    <button key={g.id} onClick={() => onNavigate('goals')} className="w-full text-left">
                      <div className="flex justify-between text-[12px] mb-1">
                        <span className="truncate pr-2 text-base-c">{g.name}</span>
                        <span className="text-faint-c tabular">{formatPercent(pct)}</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 100 ? 'var(--success)' : 'var(--primary)' }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyChart({ note }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <LayoutGrid size={28} style={{ color: 'var(--text-faint)', opacity: 0.6, marginBottom: '0.75rem' }} />
      <div className="text-sm text-muted-c">{note || 'No data available to chart yet.'}</div>
    </div>
  );
}
