import React, { useMemo, useState } from 'react';
import {
  Search, Calendar, ArrowDownNarrowWide, ArrowUpNarrowWide, Plus,
  ChevronLeft, ChevronRight, Inbox
} from 'lucide-react';
import TransactionTable from '../components/transactions/TransactionTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { transactionsForMonth } from '../utils/aggregate.js';
import { formatMoney, formatPercent } from '../utils/format.js';
import { sumIncome, sumExpense } from '../utils/aggregate.js';
import {
  EXPENSE_CATEGORIES, INCOME_CATEGORIES, categoryLabel
} from '../data/categories.js';
import { monthKeyLabel } from '../utils/date.js';

export default function TransactionsPage({
  month, setMonth, transactions, currency,
  onOpenAdd, onOpenEdit, onOpenDelete
}) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sort, setSort] = useState({ by: 'date', dir: 'desc' });
  const [range, setRange] = useState({ from: '', to: '' });

  const monthTx = useMemo(() => transactionsForMonth(transactions, month), [transactions, month]);

  const filtered = useMemo(() => {
    let list = [...monthTx];
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((t) => t.title.toLowerCase().includes(q));
    if (typeFilter !== 'all') list = list.filter((t) => t.type === typeFilter);
    if (categoryFilter !== 'all') list = list.filter((t) => t.category === categoryFilter);
    if (range.from) list = list.filter((t) => t.date >= range.from);
    if (range.to) list = list.filter((t) => t.date <= range.to);
    list.sort((a, b) => {
      let r = 0;
      if (sort.by === 'date') r = a.date < b.date ? -1 : a.date > b.date ? 1 : a.createdAt < b.createdAt ? -1 : 1;
      else if (sort.by === 'amount') r = a.amountCents - b.amountCents;
      return sort.dir === 'desc' ? -r : r;
    });
    return list;
  }, [monthTx, search, typeFilter, categoryFilter, range, sort]);

  const visibleIncome = useMemo(() => sumIncome(filtered), [filtered]);
  const visibleExpense = useMemo(() => sumExpense(filtered), [filtered]);
  const net = visibleIncome - visibleExpense;

  const toggleSort = (field) =>
    setSort((s) => (s.by === field ? { by: field, dir: s.dir === 'desc' ? 'asc' : 'desc' } : { by: field, dir: 'desc' }));

  const categoryOptions = useMemo(() => {
    const cats = typeFilter === 'income' ? INCOME_CATEGORIES : typeFilter === 'expense' ? EXPENSE_CATEGORIES : [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
    const seen = new Set();
    return cats.filter((c) => (seen.has(c.id) ? false : (seen.add(c.id), true)));
  }, [typeFilter]);

  const shift = (d) => {
    const [y, m] = month.split('-').map(Number);
    const t = new Date(y, m - 1 + d, 1);
    setMonth(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <div className="space-y-4 anim-fade-up">
      {/* Toolbar */}
      <div className="card card-pad">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-faint-c"
              aria-hidden
            />
            <input
              type="search"
              className="input pl-9"
              placeholder="Search by title or merchant…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search transactions"
            />
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1 rounded-lg px-1 py-1"
              style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
            >
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
          </div>
          <button className="btn btn-primary" onClick={onOpenAdd}>
            <Plus size={16} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-3">
          <div>
            <label className="label" htmlFor="f-type">Type</label>
            <select id="f-type" className="input" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCategoryFilter('all'); }}>
              <option value="all">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="f-cat">Category</label>
            <select id="f-cat" className="input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All categories</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="f-from">From</label>
            <input
              id="f-from" type="date" max={`${month}-31`.slice(0, 10)}
              className="input" value={range.from}
              onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
            />
          </div>
          <div>
            <label className="label" htmlFor="f-to">To</label>
            <input
              id="f-to" type="date"
              className="input" value={range.to}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            />
          </div>
          <div>
            <label className="label" htmlFor="f-sort">Sort by</label>
            <select id="f-sort" className="input" value={sort.by} onChange={(e) => setSort((s) => ({ ...s, by: e.target.value }))}>
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="f-dir">Order</label>
            <select id="f-dir" className="input" value={sort.dir} onChange={(e) => setSort((s) => ({ ...s, dir: e.target.value }))}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3" style={{ borderTop: '1px solid var(--border-soft)' }}>
          <span className="text-[12px] text-muted-c">
            {filtered.length} transaction{filtered.length > 1 ? 's' : ''} ·
            Income <strong className="tabular" style={{ color: 'var(--success)' }}>{formatMoney(visibleIncome, currency)}</strong> ·
            Expense <strong className="tabular" style={{ color: 'var(--danger)' }}>{formatMoney(visibleExpense, currency)}</strong> ·
            Net <strong className="tabular" style={{ color: net >= 0 ? 'var(--info)' : 'var(--warning)' }}>{formatMoney(Math.abs(net), currency)}</strong>
          </span>
          {(search || typeFilter !== 'all' || categoryFilter !== 'all' || range.from || range.to) && (
            <button
              className="link-btn text-[12px] ml-auto"
              onClick={() => { setSearch(''); setTypeFilter('all'); setCategoryFilter('all'); setRange({ from: '', to: '' }); }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={monthTx.length === 0 ? 'No transactions yet' : 'No transactions match your filters'}
          body={
            monthTx.length === 0
              ? `You haven't recorded anything for ${monthKeyLabel(month)}. Try adding one.`
              : 'Try widening your search or clearing the filters above.'
          }
          action={<button className="btn btn-primary btn-sm" onClick={onOpenAdd}><Plus size={14} />Add transaction</button>}
        />
      ) : (
        <div className="card overflow-hidden">
          <TransactionTable
            transactions={filtered}
            currency={currency}
            onEdit={(t) => onOpenEdit?.(t)}
            onDelete={(t) => onOpenDelete?.(t)}
          />
        </div>
      )}
    </div>
  );
}
