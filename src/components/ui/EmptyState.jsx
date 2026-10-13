import React from 'react';
import { Inbox, PiggyBank } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  body,
  action,
  className = ''
}) {
  return (
    <div className={`card card-pad flex flex-col items-center justify-center text-center py-10 ${className}`}>
      <div
        className="rounded-full flex items-center justify-center mb-4"
        style={{
          width: '3.5rem',
          height: '3.5rem',
          background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
          border: '1px solid var(--border)'
        }}
      >
        <Icon size={22} style={{ color: 'var(--primary)' }} />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {body && <p className="text-sm text-muted-c mt-1.5 max-w-md leading-relaxed">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}