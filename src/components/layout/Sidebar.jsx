import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Target,
  BarChart3,
  Settings as SettingsIcon,
  Wallet,
  Menu,
  X
} from 'lucide-react';

const SECTIONS = [
  { id: 'overview',   label: 'Overview',        icon: LayoutDashboard },
  { id: 'transactions',label: 'Transactions',  icon: Receipt },
  { id: 'budgets',   label: 'Budgets',         icon: PiggyBank },
  { id: 'goals',     label: 'Savings Goals',   icon: Target },
  { id: 'reports',   label: 'Reports',         icon: BarChart3 },
  { id: 'settings',  label: 'Settings',        icon: SettingsIcon }
];

export default function Sidebar({ section, onNavigate, demoBadge }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-4">
        <div
          className="rounded-lg flex items-center justify-center shrink-0"
          style={{
            width: '2.25rem', height: '2.25rem',
            background: 'linear-gradient(135deg, var(--primary-strong), var(--primary-dim))',
            boxShadow: '0 1px 2px rgba(0,0,0,.2)'
          }}
        >
          <Wallet size={18} color="#fff" />
        </div>
        <div className="leading-tight">
          <div className="font-bold text-[15px] tracking-tight">Spendly</div>
          <div className="text-[10px] text-muted-c tracking-wide">PERSONAL FINANCE</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1" aria-label="Primary">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const active = section === s.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                onNavigate(s.id);
                setMobileOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: active ? 'color-mix(in srgb, var(--primary) 14%, transparent)' : 'transparent',
                color: active ? 'var(--text)' : 'var(--text-muted)',
                border: active ? '1px solid color-mix(in srgb, var(--primary) 28%, transparent)' : '1px solid transparent'
              }}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={18} style={{ color: active ? 'var(--primary)' : undefined }} />
              <span className="flex-1 text-left">{s.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3">
        {demoBadge && (
          <div
            className="rounded-lg px-3 py-2.5 text-[11px] mb-2 flex items-center gap-2"
            style={{ background: 'color-mix(in srgb, var(--info) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--info) 24%, transparent)' }}
          >
            <span style={{ color: 'var(--info)', fontWeight: 700 }}>DEMO</span>
            <span className="text-muted-c">Showing demonstration data</span>
          </div>
        )}
        <div className="text-[10px] text-faint-c px-2 leading-relaxed">
          Data is stored locally in this browser. Export a backup from Settings before clearing it.
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        className="lg:hidden sticky top-3 z-30 flex items-center gap-2 ml-3 bg-surface border rounded-lg px-3 py-2 text-sm"
        onClick={() => setMobileOpen(true)}
        style={{ borderColor: 'var(--border)' }}
        aria-label="Open navigation"
      >
        <Menu size={18} />
        <span>Menu</span>
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40" role="dialog" aria-modal="true">
          <div className="absolute inset-0" style={{ background: 'var(--overlay)' }} onClick={() => setMobileOpen(false)} />
          <aside
            className="absolute left-0 top-0 h-full w-72 bg-bg anim-fade"
            style={{ borderRight: '1px solid var(--border)' }}
          >
            <div className="flex justify-end p-3">
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
                <X size={16} />
              </button>
            </div>
            {content}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 shrink-0 h-screen sticky top-0" style={{ borderRight: '1px solid var(--border)', background: 'var(--bg)' }}>
        {content}
      </aside>
    </>
  );
}