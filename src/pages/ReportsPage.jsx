import React, { useMemo, useState } from 'react';
import {
  ChevronLeft, ChevronRight, Download, Share2, Printer,
  BarChart3, TrendingUp, PieChart, Trophy, Scale, TrendingDown
} from 'lucide-react';
import { IncomeExpenseBar, CategoryDonut, ExpenseTrendLine } from '../components/charts/Charts.jsx';
import { buildExport, downloadJson } from '../utils/importExport.js';
import {
  lastNMonthKeys, monthKeyLabel, currentMonthKey, shiftMonth
} from '../utils/date.js';
import {
  transactionsForMonth, expenseByCategory,
  sumIncome, sumExpense
} from '../utils/aggregate.js';
import { formatMoney, formatPercent } from '../utils/format.js';
import { buildInsights, topCategories } from '../utils/insights.js';
import { categoryLabel, categoryColor } from '../data/categories.js';

const PERIODS = [
  { value: 'month',  label: 'This month' },
  { value: '3m',     label: 'Last 3 months' },
  { value: '6m',     label: 'Last 6 months' },
  { value: 'year',   label: 'This year' }
];

function shortLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'short' });
}

export default function ReportsPage({
  month, setMonth, transactions, budgets, currency
}) {
  const [period, setPeriod] = useState('month');

  const periodKeys = useMemo(() => {
    if (period === 'month') return [month];
    if (period === '3m') return lastNMonthKeys(3, month);
    if (period === '6m') return lastNMonthKeys(6, month);
    // year
    const y = month.split('-')[0];
    let arr = [];
    for (let m = 1; m <= 12; m++) arr.push(`${y}-${String(m).padStart(2, '0')}`);
    // only up to current month
    const curM = new Date().getMonth() + 1;
    if (String(new Date().getFullYear()) === y) arr = arr.slice(0, curM);
    return arr;
  }, [period, month]);

  const periodTx = useMemo(
    () => transactions.filter((t) => (t.date || '').slice(0, 7) && periodKeys.includes((t.date || '').slice(0, 7))),
    [transactions, periodKeys]
  );

  const income = useMemo(() => sumIncome(periodTx), [periodTx]);
  const expense = useMemo(() => sumExpense(periodTx), [periodTx]);
  const net = income - expense;

  const catTotals = useMemo(() => expenseByCategory(periodTx), [periodTx]);
  const topSpots = useMemo(
    () => topCategories(periodTx, 8).map((x) => ({ id: x.id, value: x.cents, label: categoryLabel(x.id, 'expense'), color: categoryColor(x.id, 'expense') })),
    [periodTx]
  );

  const series = useMemo(
    () =>
      lastNMonthKeys(period === 'year' ? 12 : period === '6m' ? 6 : period === '3m' ? 3 : 6, month).map((key) => {
        const arr = transactionsForMonth(transactions, key);
        return { label: shortLabel(key), income: sumIncome(arr), expense: sumExpense(arr), spending: sumExpense(arr) };
      }),
    [transactions, period, month]
  );

  const insights = useMemo(
    () =>
      buildInsights({
        monthTransactions: periodTx,
        budgets: budgets.filter((b) => periodKeys.includes(b.month)),
        goals: [],
        currency,
        monthKey: periodKeys[periodKeys.length - 1],
        allTransactions: transactions
      }),
    [periodTx, budgets, periodKeys, currency, transactions]
  );

  const shift = (d) => {
    const [y, m] = month.split('-').map(Number);
    const t = new Date(y, m - 1 + d, 1);
    setMonth(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`);
  };

  const onExport = () => {
    downloadJson(
      buildExport({ transactions, budgets, goals: [], settings: {} }),
      `spendly-report-${month}-${period}.json`
    );
  };

  return (
    <div className="space-y-4 anim-fade-up">
      <div className="card card-pad">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => shift(-1)} aria-label="Previous month">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold px-1.5 min-w-[7.5rem] text-center tabular">
              {monthKeyLabel(month)}
            </span>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => shift(1)} aria-label="Next month">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex-1 flex items-center gap-2 flex-wrap">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                className="chip"
                style={
                  period === p.value
                    ? { background: 'color-mix(in srgb, var(--primary) 18%, transparent)', borderColor: 'var(--primary)', color: 'var(--text)' }
                    : {}
                }
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button className="btn btn-outline btn-sm" onClick={() => window.print()} aria-label="Print report">
              <Printer size={14} />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button className="btn btn-outline btn-sm" onClick={onExport} aria-label="Export report data">
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <ReportKpi icon={TrendingUp} tone="success" label={`Income (${periodLabel(period)})`} value={formatMoney(income, currency)} />
          <ReportKpi icon={TrendingDown} tone="danger" label={`Expense (${periodLabel(period)})`} value={formatMoney(expense, currency)} />
          <ReportKpi icon={Scale} tone={net >= 0 ? 'info' : 'warning'} label="Net" value={formatMoney(Math.abs(net), currency)} sub={net >= 0 ? 'In surplus' : 'In deficit'} />
          <div
            className="rounded-lg p-3"
            style={{ background: 'color-mix(in srgb, var(--warning) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--warning) 24%, transparent)' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={16} style={{ color: 'var(--warning)' }} />
              <span className="text-[11px] uppercase tracking-wide text-muted-c">Top category</span>
            </div>
            {topSpots[0] ? (
              <>
                <div className="font-bold text-sm truncate">{topSpots[0].label}</div>
                <div className="tabular text-[12px] text-muted-c mt-0.5">
                  {formatMoney(topSpots[0].value, currency)} · {formatPercent((topSpots[0].value / expense) * 100)}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-c mt-1">No expenses in this period.</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card card-pad">
          <h3 className="font-semibold mb-1">Income vs Expense</h3>
          <p className="text-xs text-muted-c mb-3">Monthly totals</p>
          {series.some((s) => s.income > 0 || s.expense > 0)
            ? <IncomeExpenseBar series={series} currency={currency} />
            : <EmptyReport />}
        </div>

        <div className="card card-pad">
          <h3 className="font-semibold mb-1">Expense Trend</h3>
          <p className="text-xs text-muted-c mb-3">Total spending, month by month</p>
          {series.some((s) => s.expense > 0)
            ? <ExpenseTrendLine series={series} currency={currency} />
            : <EmptyReport />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card card-pad lg:col-span-2">
          <h3 className="font-semibold mb-1">Spending by Category</h3>
          <p className="text-xs text-muted-c mb-3">{periodLabel(period)}</p>
          {topSpots.length ? <CategoryDonut data={topSpots} currency={currency} /> : <EmptyReport />}
          {topSpots.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Category summary</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {topSpots.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2.5 rounded-lg p-2.5"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border-soft)' }}
                  >
                    <span className="cat-dot" style={{ background: c.color }} />
                    <span className="text-sm flex-1 truncate">{c.label}</span>
                    <span className="text-sm font-semibold tabular">{formatMoney(c.value, currency)}</span>
                    <span className="text-[11px] text-faint-c tabular">
                      {formatPercent((c.value / expense) * 100)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card card-pad">
          <h3 className="font-semibold mb-1">Insights</h3>
          <p className="text-xs text-muted-c mb-3">Based on stored transactions only</p>
          {insights.length === 0 ? (
            <EmptyReport />
          ) : (
            <div className="space-y-2.5">
              {insights.map((i) => (
                <div
                  key={i.id}
                  className="rounded-lg p-3 flex gap-3 items-start"
                  style={{
                    background: `color-mix(in srgb, var(--${i.tone === 'info' ? 'info' : i.tone}) 8%, transparent)`,
                    border: '1px solid var(--border-soft)'
                  }}
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold leading-tight">{i.title}</div>
                    {(i.body || '').length > 0 && (
                      <div className="text-[12px] text-muted-c mt-1 leading-relaxed">{i.body}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportKpi({ icon: Icon, tone, label, value, sub }) {
  const colors =
    tone === 'success' ? 'var(--success)' :
    tone === 'danger' ? 'var(--danger)' :
    tone === 'warning' ? 'var(--warning)' :
    'var(--info)';
  return (
    <div
      className="rounded-lg p-3"
      style={{ background: `color-mix(in srgb, ${colors} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${colors} 22%, transparent)` }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} style={{ color: colors }} />
        <span className="text-[11px] uppercase tracking-wide text-muted-c">{label}</span>
      </div>
      <div className="font-bold text-lg tabular">{value}</div>
      {sub && <div className="text-[11px] text-faint-c">{sub}</div>}
    </div>
  );
}

function EmptyReport() {
  return (
    <div className="flex items-center justify-center py-10 text-sm text-muted-c">
      No data available for this period yet.
    </div>
  );
}

function periodLabel(p) {
  const m = {
    month: 'this month',
    '3m': 'last 3 months',
    '6m': 'last 6 months',
    year: 'this year'
  };
  return m[p] || 'period';
}
