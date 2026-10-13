import React, { useRef, useState } from 'react';
import {
  User, Moon, Sun, Palette, Download, Upload, Trash2, RotateCw, Info, ShieldCheck, RefreshCw
} from 'lucide-react';
import { CURRENCIES, currencySymbol } from '../utils/format.js';
import {
  parseAndValidateFile, buildExport, downloadJson, exportFilename
} from '../utils/importExport.js';
import { useToast } from '../hooks/useToast.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';

export default function SettingsPage({
  settings, setSettings, onExport, onImport, onResetDemo, onClearAll,
  dataOrigin
}) {
  const toast = useToast();
  const fileRef = useRef(null);
  const [importChoice, setImportChoice] = useState(null);
  const [nameDraft, setNameDraft] = useState(settings.displayName || '');

  const handleProfile = (e) => {
    e.preventDefault();
    const v = nameDraft.trim();
    setSettings({ displayName: v });
    toast.success('Profile updated', `Hello, ${v}! Your name is saved to this device.`);
  };

  const handleImportPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseAndValidateFile(file).then((res) => {
      e.target.value = '';
      if (!res.ok) {
        toast.error('Import failed', res.error || 'Invalid file.');
        return;
      }
      setImportChoice(res.data);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 anim-fade-up">
      <div className="lg:col-span-2 space-y-4">
        {/* Profile */}
        <section className="card card-pad">
          <h3 className="text-base font-semibold flex items-center gap-2 mb-3">
            <User size={16} className="text-muted-c" />
            Profile
          </h3>
          <form onSubmit={handleProfile} className="flex flex-col sm:flex-row sm:items-end gap-2">
            <div className="flex-1">
              <label className="label" htmlFor="s-name">Display name</label>
              <input
                id="s-name"
                className="input"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="e.g. Alex"
              />
            </div>
            <button type="submit" className="btn btn-primary">Save</button>
          </form>
          <p className="text-[12px] text-faint-c mt-2">
            This name is only used inside the app (greeting on the dashboard) and is never uploaded anywhere.
          </p>
        </section>

        {/* Display */}
        <section className="card card-pad">
          <h3 className="text-base font-semibold flex items-center gap-2 mb-3">
            <Palette size={16} className="text-muted-c" />
            Display
          </h3>

          <Field label="Theme">
            <div className="grid grid-cols-2 gap-2">
              <ThemeTile
                active={settings.theme === 'dark'}
                onClick={() => { setSettings({ theme: 'dark' }); }}
                icon={<Moon size={16} />}
                label="Dark"
              />
              <ThemeTile
                active={settings.theme === 'light'}
                onClick={() => { setSettings({ theme: 'light' }); }}
                icon={<Sun size={16} />}
                label="Light"
              />
            </div>
          </Field>

          <Field label="Currency" hint="Changing the symbol does NOT perform foreign-exchange conversion. Amounts are stored as numbers and simply formatted in the chosen currency. EUR is the default.">
            <div className="grid grid-cols-3 gap-2">
              {CURRENCIES.map((c) => (
                <ThemeTile
                  key={c.code}
                  active={settings.currency === c.code}
                  onClick={() => { setSettings({ currency: c.code }); }}
                  icon={<span className="text-base font-bold">{currencySymbol(c.code)}</span>}
                  label={`${c.code} · ${c.name}`}
                />
              ))}
            </div>
          </Field>
        </section>

        {/* Data */}
        <section className="card card-pad">
          <h3 className="text-base font-semibold flex items-center gap-2 mb-3">
            <Download size={16} className="text-muted-c" />
            Data
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              className="rounded-lg p-3.5"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border-soft)' }}
            >
              <div className="font-semibold text-sm flex items-center gap-2">
                <Download size={14} className="text-muted-c" />
                Export a backup
              </div>
              <p className="text-[12px] text-muted-c mt-1 line-clamp-2">
                Download all of your transactions, budgets, goals and settings as a JSON file. Great for migrating devices or archiving.
              </p>
              <button className="btn btn-primary btn-sm mt-3 w-full" onClick={onExport}>
                <Download size={14} />
                Export now
              </button>
            </div>

            <div
              className="rounded-lg p-3.5"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border-soft)' }}
            >
              <div className="font-semibold text-sm flex items-center gap-2">
                <Upload size={14} className="text-muted-c" />
                Import a backup
              </div>
              <p className="text-[12px] text-muted-c mt-1 line-clamp-2">
                Restore from a <code>spendly-backup-*.json</code> file. You choose to replace or merge.
              </p>
              <input
                type="file"
                ref={fileRef}
                accept=".json,application/json"
                className="hidden"
                onChange={handleImportPick}
              />
              <button
                className="btn btn-ghost btn-sm mt-3 w-full"
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={14} />
                Choose file…
              </button>
            </div>
          </div>
        </section>

        {/* Danger */}
        <section
          className="card card-pad"
          style={{ borderColor: 'color-mix(in srgb, var(--danger) 30%, transparent)' }}
        >
          <h3 className="text-base font-semibold flex items-center gap-2 mb-3 text-danger">
            <ShieldCheck size={16} />
            Danger zone
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="font-semibold text-sm">Reset demo data</div>
              <p className="text-[12px] text-muted-c mt-1">
                Replace everything with the original demonstration dataset
                {dataOrigin !== 'demo' ? ' (your current data is user/' + dataOrigin + ') ' : ' (you are already on demo) '}.
                Useful when you want a fresh start.
              </p>
              <button className="btn btn-outline btn-sm mt-3 w-full" onClick={onResetDemo}>
                <RotateCw size={14} />
                Reset to demo
              </button>
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: 'var(--danger)' }}>Clear all data</div>
              <p className="text-[12px] text-muted-c mt-1">
                Permanently delete every transaction, budget, goal and preference in this browser.
                There is no recovery — export a backup first.
              </p>
              <button
                className="btn btn-danger btn-sm mt-3 w-full"
                onClick={onClearAll}
                style={{ background: 'var(--danger)', color: 'white' }}
              >
                <Trash2 size={14} />
                Clear everything
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-4">
        <section className="card card-pad">
          <h3 className="text-base font-semibold flex items-center gap-2 mb-2">
            <Info size={16} className="text-muted-c" />
            About
          </h3>
          <dl className="text-[13px] space-y-2">
            <Row k="App" v={<span className="font-semibold">Spendly</span>} />
            <Row k="Tagline" v="Know your money. Own your future." />
            <Row k="Version" v="1.0.0" />
            <Row k="Storage" v="Browser LocalStorage" />
            <Row k="Data" v={`${dataOrigin || 'unknown'} dataset`} />
            <Row
              k="Privacy"
              v={
                <span className="leading-relaxed">
                  All data is stored on this device only. Spendly makes no network requests and does not collect analytics.
                </span>
              }
            />
          </dl>
          <p className="text-[12px] text-faint-c mt-4 leading-relaxed">
            Spendly is a personal budgeting and educational tool. It is not a bank, does not connect to
            financial institutions, and does not give investment advice.
          </p>
        </section>
      </div>

      {importChoice && (
        <ConfirmDialog
          title="Apply imported backup?"
          body={`This file contains ${importChoice.transactions.length} transaction${importChoice.transactions.length === 1 ? '' : 's'}, ${importChoice.budgets.length} budget${importChoice.budgets.length === 1 ? '' : 's'} and ${importChoice.goals.length} goal${importChoice.goals.length === 1 ? '' : 's'}. Replace your current data, or merge it so existing entries are preserved (by id, skipping duplicates)?`}
          tone="primary"
          confirmLabel="Replace"
          cancelLabel="Merge instead"
          onConfirm={() => {
            onImport(importChoice, 'replace');
            toast.success('Imported', 'Your data was replaced from the backup file.');
            setImportChoice(null);
          }}
          onCancel={() => {
            onImport(importChoice, 'merge');
            toast.success('Imported (merged)', 'New entries were added, existing ones preserved.');
            setImportChoice(null);
          }}
        />
      )}
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-c">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="mb-4">
      <label className="label">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-faint-c mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  );
}

function ThemeTile({ active, onClick, icon, label }) {
  return (
    <button
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all"
      style={{
        background: active ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'var(--surface-2)',
        border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
        color: active ? 'var(--text)' : 'var(--text-muted)'
      }}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className="shrink-0" style={{ color: active ? 'var(--primary)' : 'var(--text-muted)' }}>
        {icon}
      </span>
      <span className="font-medium truncate">{label}</span>
      {active && <span className="ml-auto text-[10px] font-bold" style={{ color: 'var(--primary)' }}>ON</span>}
    </button>
  );
}
