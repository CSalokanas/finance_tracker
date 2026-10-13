import React from 'react';
import { Plus, ChevronLeft, ChevronRight, Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.jsx';
import { monthKeyLabel } from '../../utils/date.js';

const SECTION_TITLES = {
  overview: 'Overview',
  transactions: 'Transactions',
  budgets: 'Budgets',
  goals: 'Savings Goals',
  reports: 'Reports',
  settings: 'Settings'
};

export default function Header({
  section,
  month,
  onPrevMonth,
  onNextMonth,
  onAddTransaction,
  settings,
  setSettings
}) {
  const { theme, toggle } = useTheme();
  const showMonthCtrl = ['overview', 'transactions', 'budgets', 'reports'].includes(section);
  const name = (settings?.displayName || 'there');

  const title = SECTION_TITLES[section] || 'Spendly';

  return (
    <header
      className="sticky top-0 z-20 backdrop-blur px-4 md:px-6 lg:px-8 py-4 flex items-center gap-3 md:gap-4"
      style={{ background: 'color-mix(in srgb, var(--bg) 82%, transparent)', borderBottom: '1px solid var(--border-soft)' }}
    >
      <div className="flex-1 min-w-0">
        <h1 className="text-lg md:text-xl font-bold tracking-tight truncate">{title}</h1>
        <p className="text-xs text-muted-c md:text-[13px]">
          {section === 'overview'
            ? `Welcome back, ${name}! Here's your ${monthKeyLabel(month)} at a glance.`
            : section === 'reports'
            ? 'Reports change with your stored data.'
            : 'Track and manage your finances.'}
        </p>
      </div>

      {showMonthCtrl && (
        <div
          className="hidden sm:flex items-center gap-1 rounded-lg px-1 py-1"
          style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onPrevMonth} aria-label="Previous month">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold px-1.5 min-w-[7.5rem] text-center whitespace-nowrap tabular">
            {monthKeyLabel(month)}
          </span>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onNextMonth} aria-label="Next month">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <button
        className="btn btn-ghost btn-icon btn-sm"
        onClick={toggle}
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      <button className="btn btn-primary" onClick={onAddTransaction}>
        <Plus size={17} />
        <span className="hidden sm:inline">Add Transaction</span>
        <span className="sm:hidden">Add</span>
      </button>
    </header>
  );
}