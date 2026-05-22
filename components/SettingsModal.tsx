"use client";

import type { EmailSettings } from "@/lib/blocks/types";

interface Props {
  open: boolean;
  onClose: () => void;
  settings: EmailSettings;
  onChange: (key: keyof EmailSettings, value: string) => void;
}

export function SettingsModal({ open, onClose, settings, onChange }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6" onClick={onClose}>
      <div
        className="flex w-full max-w-md flex-col rounded-2xl bg-white shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-pale px-6 py-4">
          <div>
            <h3 className="text-base font-semibold text-ink">Email settings</h3>
            <p className="text-xs text-muted">Subject, sender, and delivery options</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted transition hover:bg-brand-light hover:text-ink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3 px-6 py-5">
          <Field label="Subject line" placeholder="e.g. Welcome to {{custom.company_name}}!" value={settings.subject} onChange={(v) => onChange("subject", v)} />
          <Field label="Preheader" placeholder="Preview text shown in inbox (optional)" value={settings.preheader} onChange={(v) => onChange("preheader", v)} />
          <div className="my-1 h-px bg-brand-pale" />
          <Field label="From name" placeholder="e.g. People Ops Team" value={settings.from_name} onChange={(v) => onChange("from_name", v)} />
          <Field label="From email" placeholder="e.g. hr@yourcompany.com" value={settings.from_email} onChange={(v) => onChange("from_email", v)} />
          <Field label="Reply-to" placeholder="e.g. hr@yourcompany.com" value={settings.reply_to} onChange={(v) => onChange("reply_to", v)} />
          <div className="my-1 h-px bg-brand-pale" />
          <p className="text-[11px] leading-relaxed text-muted">
            Unsubscribe link is handled by the custom value{" "}
            <code className="rounded bg-brand-light px-1 text-[10px] font-medium text-brand">{"{{custom.unsub_link}}"}</code>.
            Set it in <strong>Custom Values &rarr; Links</strong>.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-brand-pale px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-brand-gradient px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-ink">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-brand-pale bg-white px-3 py-2 text-sm placeholder:text-muted/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
    </label>
  );
}
