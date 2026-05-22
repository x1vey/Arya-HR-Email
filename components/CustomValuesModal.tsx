"use client";

import { useState, useEffect, useCallback } from "react";
import type { CustomValue, CustomValueType, CompanyDetails } from "@/lib/custom-values/types";
import { GROUP_LABELS, DEFAULT_COMPANY } from "@/lib/custom-values/types";
import {
  loadCustomValues,
  saveCustomValues,
  loadCompany,
  saveCompany,
  syncCompanyToValues,
} from "@/lib/custom-values/store";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called whenever values change so the editor can re-render */
  onValuesChange: (values: CustomValue[]) => void;
}

type Tab = "company" | "values";

export function CustomValuesModal({ open, onClose, onValuesChange }: Props) {
  const [tab, setTab] = useState<Tab>("values");
  const [values, setValues] = useState<CustomValue[]>([]);
  const [company, setCompany] = useState<CompanyDetails>(DEFAULT_COMPANY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ key: "", label: "", value: "", type: "text" as CustomValueType });

  useEffect(() => {
    if (open) {
      setValues(loadCustomValues());
      setCompany(loadCompany());
      setEditingId(null);
    }
  }, [open]);

  const persist = useCallback(
    (next: CustomValue[]) => {
      setValues(next);
      saveCustomValues(next);
      onValuesChange(next);
    },
    [onValuesChange]
  );

  const updateCompanyField = (key: keyof CompanyDetails, val: string) => {
    const next = { ...company, [key]: val };
    setCompany(next);
    saveCompany(next);
    // Sync into custom values
    const synced = syncCompanyToValues(next, values);
    persist(synced);
  };

  const startCreate = () => {
    setEditingId("__new__");
    setDraft({ key: "", label: "", value: "", type: "text" });
  };

  const startEdit = (v: CustomValue) => {
    setEditingId(v.id);
    setDraft({ key: v.key, label: v.label, value: v.value, type: v.type });
  };

  const saveEdit = () => {
    if (!draft.label.trim()) return;
    const key = draft.key.trim() || draft.label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    if (editingId === "__new__") {
      const id = `cv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      persist([...values, { id, key, label: draft.label.trim(), value: draft.value, type: draft.type, group: "custom" }]);
    } else {
      persist(values.map((v) => (v.id === editingId ? { ...v, key, label: draft.label.trim(), value: draft.value, type: draft.type } : v)));
    }
    setEditingId(null);
  };

  const updateValue = (id: string, val: string) => {
    persist(values.map((v) => (v.id === id ? { ...v, value: val } : v)));
  };

  const removeValue = (id: string) => {
    persist(values.filter((v) => v.id !== id));
  };

  if (!open) return null;

  const grouped = {
    company: values.filter((v) => v.group === "company"),
    sender: values.filter((v) => v.group === "sender"),
    links: values.filter((v) => v.group === "links"),
    custom: values.filter((v) => v.group === "custom"),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-pale px-6 py-4">
          <div>
            <h3 className="text-base font-semibold text-ink">Custom Values</h3>
            <p className="text-xs text-muted">Reusable placeholders you can drop into any email</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted transition hover:bg-brand-light hover:text-ink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-brand-pale px-6">
          <TabBtn active={tab === "company"} onClick={() => setTab("company")}>Company details</TabBtn>
          <TabBtn active={tab === "values"} onClick={() => setTab("values")}>All values</TabBtn>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "company" ? (
            /* ─── COMPANY DETAILS ─── */
            <div className="flex flex-col gap-4">
              <p className="text-xs leading-relaxed text-muted">
                Fill in your company info once — it auto-populates{" "}
                <code className="rounded bg-brand-light px-1 text-[10px] font-medium text-brand">{"{{custom.company_name}}"}</code>{" "}
                and friends across every email.
              </p>
              <CompanyField label="Company name" value={company.name} onChange={(v) => updateCompanyField("name", v)} placeholder="Acme Corp" />
              <CompanyField label="Logo URL" value={company.logo_url} onChange={(v) => updateCompanyField("logo_url", v)} placeholder="https://yoursite.com/logo.png" />
              {company.logo_url && (
                <img src={company.logo_url} alt="Logo preview" className="h-10 rounded border border-brand-pale object-contain" />
              )}
              <CompanyField label="Address" value={company.address} onChange={(v) => updateCompanyField("address", v)} placeholder="123 Main St, City, State 12345" />
              <CompanyField label="Website" value={company.website} onChange={(v) => updateCompanyField("website", v)} placeholder="https://yourcompany.com" />
              <CompanyField label="Phone" value={company.phone} onChange={(v) => updateCompanyField("phone", v)} placeholder="+1 (555) 000-0000" />
            </div>
          ) : (
            /* ─── ALL VALUES ─── */
            <div className="flex flex-col gap-5">
              <p className="text-xs leading-relaxed text-muted">
                Use <code className="rounded bg-brand-light px-1 text-[10px] font-medium text-brand">{"{{custom.key}}"}</code> in
                any text field. Values stay the same across all recipients — for per-person data use merge tags.
              </p>

              {(["company", "sender", "links", "custom"] as const).map((group) => {
                const items = grouped[group];
                if (items.length === 0 && group !== "custom") return null;
                return (
                  <div key={group} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                        {GROUP_LABELS[group]}
                      </span>
                      {group === "custom" && (
                        <button onClick={startCreate} className="rounded-md px-2 py-0.5 text-[11px] font-medium text-brand transition hover:bg-brand-light">
                          + Create
                        </button>
                      )}
                    </div>
                    {items.map((v) => (
                      <ValueRow
                        key={v.id}
                        cv={v}
                        isEditing={editingId === v.id}
                        onStartEdit={() => startEdit(v)}
                        onValueChange={(val) => updateValue(v.id, val)}
                        onRemove={v.system ? undefined : () => removeValue(v.id)}
                      />
                    ))}
                    {group === "custom" && items.length === 0 && editingId !== "__new__" && (
                      <p className="rounded-lg border border-dashed border-brand-pale px-3 py-4 text-center text-xs text-muted">
                        No custom values yet. Click <strong>+ Create</strong> to add one.
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Create/edit form */}
              {editingId && (
                <div className="flex flex-col gap-2 rounded-xl border border-brand/30 bg-canvas p-3">
                  <span className="text-[11px] font-semibold text-brand">{editingId === "__new__" ? "New custom value" : "Edit value"}</span>
                  <input
                    value={draft.label}
                    onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                    placeholder="Label (e.g. HR Director Name)"
                    className="w-full rounded-lg border border-brand-pale bg-white px-3 py-1.5 text-sm placeholder:text-muted/50 focus:border-brand focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <select
                      value={draft.type}
                      onChange={(e) => setDraft({ ...draft, type: e.target.value as CustomValueType })}
                      className="rounded-lg border border-brand-pale bg-white px-2 py-1.5 text-sm focus:border-brand focus:outline-none"
                    >
                      <option value="text">Text</option>
                      <option value="url">URL</option>
                      <option value="image">Image URL</option>
                    </select>
                    <input
                      value={draft.value}
                      onChange={(e) => setDraft({ ...draft, value: e.target.value })}
                      placeholder={draft.type === "url" || draft.type === "image" ? "https://..." : "Value"}
                      className="flex-1 rounded-lg border border-brand-pale bg-white px-3 py-1.5 text-sm placeholder:text-muted/50 focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button onClick={() => setEditingId(null)} className="rounded-md px-2 py-1 text-[11px] text-muted hover:text-ink">Cancel</button>
                    <button onClick={saveEdit} disabled={!draft.label.trim()} className="rounded-md bg-brand px-3 py-1 text-[11px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40">
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`border-b-2 px-4 py-2.5 text-sm font-medium transition ${
        active ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function CompanyField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
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

function ValueRow({
  cv,
  isEditing,
  onStartEdit,
  onValueChange,
  onRemove,
}: {
  cv: CustomValue;
  isEditing: boolean;
  onStartEdit: () => void;
  onValueChange: (v: string) => void;
  onRemove?: () => void;
}) {
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${isEditing ? "border-brand bg-brand-light/40" : "border-brand-pale bg-white"}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-ink">{cv.label}</span>
          <code className="rounded bg-brand-light px-1 py-0.5 text-[9px] text-brand">
            {`{{custom.${cv.key}}}`}
          </code>
          <span className="rounded bg-canvas px-1 py-0.5 text-[9px] text-muted">{cv.type}</span>
        </div>
        <input
          type="text"
          value={cv.value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="Enter value..."
          className="mt-1 w-full rounded border border-brand-pale bg-canvas px-2 py-1 text-xs text-ink placeholder:text-muted/50 focus:border-brand focus:outline-none"
        />
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {!cv.system && (
          <button onClick={onStartEdit} className="rounded-md p-1 text-muted transition hover:bg-brand-light hover:text-brand" title="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
        {onRemove && (
          <button onClick={onRemove} className="rounded-md p-1 text-muted transition hover:bg-red-50 hover:text-red-500" title="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
