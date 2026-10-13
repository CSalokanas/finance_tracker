import React from 'react';
import {
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Menu as MenuIcon,
  TrendingUp,
  TrendingDown,
  PieChart,
  AlertTriangle,
  Trash2,
  Target,
  Lightbulb,
  CheckCircle2,
  Banknote,
  Wallet,
  Scale,
  Minus
} from 'lucide-react';

const ICONS = {
  info: Info,
  arrowUpRight: ArrowUpRight,
  arrowDownRight: ArrowDownRight,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
  pieChart: PieChart,
  alertTriangle: AlertTriangle,
  minus: Minus,
  trash2: Trash2,
  target: Target,
  lightbulb: Lightbulb,
  checkCircle: CheckCircle2,
  banknote: Banknote,
  wallet: Wallet,
  scale: Scale,
  menu: MenuIcon
};
const TONE = {
  success: { bg: 'color-mix(in srgb, var(--success) 10%, transparent)', border: 'color-mix(in srgb, var(--success) 24%, transparent)', color: 'var(--success)' },
  warning: { bg: 'color-mix(in srgb, var(--warning) 10%, transparent)', border: 'color-mix(in srgb, var(--warning) 24%, transparent)', color: 'var(--warning)' },
  danger:  { bg: 'color-mix(in srgb, var(--danger) 10%, transparent)', border: 'color-mix(in srgb, var(--danger) 24%, transparent)', color: 'var(--danger)' },
  info:    { bg: 'color-mix(in srgb, var(--info) 10%, transparent)', border: 'color-mix(in srgb, var(--info) 24%, transparent)', color: 'var(--info)' }
};

export default function InsightCard({ item }) {
  const Icon = ICONS[item.icon] || Info;
  const tone = TONE[item.tone] || TONE.info;
  return (
    <div
      className="rounded-lg p-3 flex gap-3 items-start"
      role="note"
      style={{ background: tone.bg, border: `1px solid ${tone.border}` }}
    >
      <div
        className="rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ width: '1.85rem', height: '1.85rem', color: tone.color, background: 'var(--surface)' }}
        aria-hidden
      >
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-base-c leading-tight">{item.title}</div>
        {item.body && (
          <div className="text-[12px] text-muted-c mt-0.5 leading-relaxed">{item.body}</div>
        )}
      </div>
    </div>
  );
}