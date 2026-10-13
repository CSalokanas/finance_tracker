import React from 'react';
import Modal from './Modal.jsx';
import { TriangleAlert, Info, AlertTriangle } from 'lucide-react';

const TONE = {
  danger: { icon: TriangleAlert, color: 'var(--danger)' },
  warning: { icon: AlertTriangle, color: 'var(--warning)' },
  primary: { icon: Info, color: 'var(--primary)' }
};

export default function ConfirmDialog({
  open = true,
  tone = 'primary',
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  confirmDisabled,
  busy
}) {
  const meta = TONE[tone] || TONE.primary;
  const Icon = meta.icon;
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      maxWidth="28rem"
      labelledBy="confirm-title"
    >
      <div className="flex gap-3">
        <div
          className="flex items-center justify-center rounded-full shrink-0"
          style={{
            width: '2.5rem',
            height: '2.5rem',
            background: 'color-mix(in srgb, var(--danger) 10%, transparent)',
            border: '1px solid var(--border)'
          }}
        >
          <Icon size={18} style={{ color: 'var(' + (tone === 'danger' ? '--danger' : tone === 'warning' ? '--warning' : '--primary') + ')' }} />
        </div>
        <p className="text-sm text-muted-c leading-relaxed">{body}</p>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <button className="btn btn-ghost" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </button>
        <button
          className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`}
          onClick={onConfirm}
          disabled={confirmDisabled || busy}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}