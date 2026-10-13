import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ReferenceLine
} from 'recharts';
import { formatMoney } from '../../utils/format.js';

// A Tooltip that renders formatted cents (values are stored as integer cents).
function MoneyTooltip({ active, payload, label, currency, prefix = '' }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="card p-2.5 text-xs"
      style={{ boxShadow: 'var(--shadow)' }}
    >
      {label !== undefined && <div className="font-semibold mb-1.5">{prefix}{label}</div>}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="cat-dot" style={{ background: p.color || p.name }} />
            <span className="text-muted-c capitalize">{p.name}</span>
            <span className="font-semibold tabular ml-auto pl-3" style={{ color: p.color }}>
              {formatMoney(p.value, currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function IncomeExpenseBar({ series, currency, height = 240 }) {
  const data = series.map((s) => ({
    label: s.label,
    Income: s.income,
    Expense: s.expense
  }));
  if (!data.length) return null;
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: 'var(--chart-grid)' }} interval="preserveStartEnd" />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={54}
            tickFormatter={(v) => formatMoney(v, currency)}
          />
          <Tooltip cursor={{ fill: 'color-mix(in srgb, var(--primary) 6%, transparent)' }} content={<MoneyTooltip currency={currency} />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="Income" name="Income" fill="var(--success)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="Expense" name="Expense" fill="var(--danger)" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ExpenseTrendLine({ series, currency, height = 220 }) {
  const data = series.map((s) => ({ label: s.label, value: s.expense }));
  if (data.every((d) => d.value === 0)) return null;
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: 'var(--chart-grid)' }} interval="preserveStartEnd" />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={54}
            tickFormatter={(v) => formatMoney(v, currency)}
          />
          <Tooltip content={<MoneyTooltip currency={currency} prefix="" />} />
          <ReferenceLine y={0} stroke="var(--chart-grid)" />
          <Line
            type="monotone"
            dataKey="value"
            name="Expense"
            stroke="var(--danger)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: 'var(--danger)', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryDonut({ data, currency, height = 230 }) {
  // data: [{ id, label, value, color }]
  const chart = data.filter((d) => d.value > 0);
  const total = chart.reduce((s, d) => s + d.value, 0);
  if (!chart.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chart}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              stroke="var(--surface)"
              strokeWidth={1}
            >
              {chart.map((d) => (
                <Cell key={d.id} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const p = payload[0];
                const pct = total > 0 ? (p.value / total) * 100 : 0;
                return (
                  <div className="card p-2.5 text-xs" style={{ boxShadow: 'var(--shadow)' }}>
                    <div className="font-semibold mb-1">{label}</div>
                    <div className="tabular" style={{ color: p.payload.color }}>
                      {formatMoney(p.value, currency)} · {pct.toFixed(0)}%
                    </div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2 text-sm" style={{ max_height: height }}>
        {chart.map((d) => (
          <li key={d.id} className="flex items-center gap-2">
            <span className="cat-dot" style={{ background: d.color }} />
            <span className="text-muted-c flex-1 truncate">{d.label}</span>
            <span className="font-semibold tabular">{formatMoney(d.value, currency)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}