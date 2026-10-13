import React from 'react';

/**
 * Simple progress bar. Endpoint colors and overflow overshoot are dynamic
 * based on the ratio.
 */
export default function ProgressBar({
  ratio, // 0..1+ (can exceed 1 when over)
  color // optional explicit hex/`var(--color)`
}) {
  const r = Number.isFinite(ratio) ? ratio : 0;
  const clamped = Math.min(Math.max(r, 0), 1.2); // allow a 20% overshoot visual
  const pct = Math.min(r * 100, 100);
  const autoColor = r >= 1 ? 'var(--danger)' : r >= 0.8 ? 'var(--warning)' : 'var(--primary)';
  const fill = color || autoColor;
  return (
    <div className="progress-track">
      <div
        className="progress-fill"
        style={{ width: `${clampWidth(clamped)}%`, background: fill }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
      />
    </div>
  );
}

function clampWidth(w) {
  return Number.isFinite(w) ? w : 0;
}