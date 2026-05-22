"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CustomValue, CustomValueType, CustomValueGroup, CompanyDetails } from "@/lib/custom-values/types";
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
  onValuesChange: (values: CustomValue[]) => void;
}

type SideTab = "values" | "company";

const BUILTIN_GROUPS: CustomValueGroup[] = ["company", "sender", "links"];

export function CustomValuesModal({ open, onClose, onValuesChange }: Props) {
  const [sideTab, setSideTab] = useState<SideTab>("values");
  const [values, setValues] = useState<CustomValue[]>([]);
  const [company, setCompany] = useState<CompanyDetails>(DEFAULT_COMPANY);
  const [activeGroup, setActiveGroup] = useState<CustomValueGroup | string>("company");
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [draft, setDraft] = useState({ key: "", label: "", value: "", type: "text" as CustomValueType });
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const v = loadCustomValues();
      setValues(v);
      setCompany(loadCompany());
      setEditingRow(null);
      // Derive user-created groups
      const groups = new Set<string>();
      v.forEach((cv) => {
        if (!BUILTIN_GROUPS.includes(cv.group as CustomValueGroup) && cv.group !== "custom") {
          groups.add(cv.group);
        }
      });
      setUserGroups(Array.from(groups));
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

  /* ── Company ── */
  const updateCompanyField = (key: keyof CompanyDetails, val: string) => {
    const next = { ...company, [key]: val };
    setCompany(next);
    saveCompany(next);
    persist(syncCompanyToValues(next, values));
  };

  /* ── Value CRUD ── */
  const startCreate = () => {
    setEditingRow("__new__");
    setDraft({ key: "", label: "", value: "", type: "text" });
  };

  const startEdit = (v: CustomValue) => {
    setEditingRow(v.id);
    setDraft({ key: v.key, label: v.label, value: v.value, type: v.type });
  };

  const cancelEdit = () => setEditingRow(null);

  const saveEdit = () => {
    if (!draft.label.trim()) return;
    const key =
      draft.key.trim() ||
      draft.label
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");

    if (editingRow === "__new__") {
      const id = `cv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const group = BUILTIN_GROUPS.includes(activeGroup as CustomValueGroup)
        ? "custom"
        : (activeGroup as CustomValueGroup);
      persist([...values, { id, key, label: draft.label.trim(), value: draft.value, type: draft.type, group, system: false }]);
    } else {
      persist(
        values.map((v) =>
          v.id === editingRow
            ? { ...v, key, label: draft.label.trim(), value: draft.value, type: draft.type }
            : v
        )
      );
    }
    setEditingRow(null);
  };

  const updateValueInline = (id: string, val: string) => {
    persist(values.map((v) => (v.id === id ? { ...v, value: val } : v)));
  };

  const removeValue = (id: string) => {
    persist(values.filter((v) => v.id !== id));
  };

  const copyToken = (key: string) => {
    navigator.clipboard.writeText(`{{custom.${key}}}`);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  /* ── Groups ── */
  const handleCreateGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    if (!userGroups.includes(slug)) setUserGroups([...userGroups, slug]);
    setActiveGroup(slug);
    setShowNewGroup(false);
    setNewGroupName("");
  };

  const deleteGroup = (slug: string) => {
    // Move values in this group to "custom"
    persist(values.map((v) => (v.group === slug ? { ...v, group: "custom" as CustomValueGroup } : v)));
    setUserGroups(userGroups.filter((g) => g !== slug));
    if (activeGroup === slug) setActiveGroup("custom");
  };

  if (!open) return null;

  // Which values to show in the current table
  const tableValues =
    activeGroup === "all"
      ? values
      : values.filter((v) => v.group === activeGroup);

  const allGroups: { key: string; label: string; count: number; removable: boolean }[] = [
    ...BUILTIN_GROUPS.map((g) => ({
      key: g,
      label: GROUP_LABELS[g],
      count: values.filter((v) => v.group === g).length,
      removable: false,
    })),
    {
      key: "custom",
      label: "Custom",
      count: values.filter((v) => v.group === "custom").length,
      removable: false,
    },
    ...userGroups.map((slug) => ({
      key: slug,
      label: slug
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      count: values.filter((v) => v.group === slug).length,
      removable: true,
    })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="flex h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Left sidebar ── */}
        <div className="flex w-52 shrink-0 flex-col border-r border-brand-pale bg-canvas">
          <div className="px-4 pt-5 pb-3">
            <h3 className="text-sm font-semibold text-ink">Settings</h3>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 pb-4">
            {/* Company details */}
            <button
              onClick={() => { setSideTab("company"); setActiveGroup("company"); }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                sideTab === "company"
                  ? "bg-white font-medium text-brand-dark shadow-sm"
                  : "text-ink hover:bg-white/60"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v4M12 14v4M16 14v4" />
              </svg>
              Company details
            </button>

            <div className="my-3 h-px bg-brand-pale" />

            <div className="flex items-center justify-between px-3 pb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Value groups</span>
              <button
                onClick={() => setShowNewGroup(true)}
                className="rounded p-0.5 text-muted transition hover:bg-white hover:text-brand"
                title="New group"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>

            {allGroups.map((g) => (
              <div key={g.key} className="group relative">
                <button
                  onClick={() => { setSideTab("values"); setActiveGroup(g.key); }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                    sideTab === "values" && activeGroup === g.key
                      ? "bg-white font-medium text-brand-dark shadow-sm"
                      : "text-ink hover:bg-white/60"
                  }`}
                >
                  <span className="truncate">{g.label}</span>
                  <span className="text-[11px] text-muted">{g.count}</span>
                </button>
                {g.removable && (
                  <button
                    onClick={() => deleteGroup(g.key)}
                    className="absolute right-1 top-1/2 hidden -translate-y-1/2 rounded p-1 text-muted hover:bg-red-50 hover:text-red-500 group-hover:block"
                    title="Delete group"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}

            {/* New group input */}
            {showNewGroup && (
              <div className="mt-1 px-1">
                <input
                  autoFocus
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onBlur={handleCreateGroup}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateGroup();
                    if (e.key === "Escape") { setShowNewGroup(false); setNewGroupName(""); }
                  }}
                  placeholder="Group name"
                  className="w-full rounded-lg border border-brand px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
            )}
          </nav>
        </div>

        {/* ── Main content ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-brand-pale px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">
                {sideTab === "company" ? "Company details" : allGroups.find((g) => g.key === activeGroup)?.label ?? "Values"}
              </h2>
              <p className="text-xs text-muted">
                {sideTab === "company"
                  ? "Fill in once — auto-populates {{custom.company_*}} everywhere"
                  : `Use {{custom.key}} tokens in any email field`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {sideTab === "values" && (
                <button
                  onClick={startCreate}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add value
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-muted transition hover:bg-brand-light hover:text-ink"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {sideTab === "company" ? (
              /* ─── COMPANY DETAILS ─── */
              <div className="mx-auto max-w-lg px-6 py-6">
                <div className="flex flex-col gap-5">
                  <CompanyField label="Company name" value={company.name} onChange={(v) => updateCompanyField("name", v)} placeholder="Acme Corp" token="company_name" />
                  <CompanyField label="Logo URL" value={company.logo_url} onChange={(v) => updateCompanyField("logo_url", v)} placeholder="https://yoursite.com/logo.png" token="company_logo" />
                  {company.logo_url && (
                    <img src={company.logo_url} alt="Logo preview" className="h-12 rounded-lg border border-brand-pale object-contain" />
                  )}
                  <CompanyField label="Address" value={company.address} onChange={(v) => updateCompanyField("address", v)} placeholder="123 Main St, City, State 12345" token="company_address" />
                  <CompanyField label="Website" value={company.website} onChange={(v) => updateCompanyField("website", v)} placeholder="https://yourcompany.com" token="company_website" />
                  <CompanyField label="Phone" value={company.phone} onChange={(v) => updateCompanyField("phone", v)} placeholder="+1 (555) 000-0000" token="company_phone" />
                </div>
              </div>
            ) : (
              /* ─── VALUES TABLE ─── */
              <div className="px-6 py-4">
                {tableValues.length === 0 && editingRow !== "__new__" ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 text-brand">
                        <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <p className="mt-3 text-sm font-medium text-ink">No values in this group</p>
                    <p className="mt-1 text-xs text-muted">Click "Add value" to create one.</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-brand-pale text-left">
                        <th className="pb-2 pr-4 text-[11px] font-semibold uppercase tracking-wider text-muted">Name</th>
                        <th className="pb-2 pr-4 text-[11px] font-semibold uppercase tracking-wider text-muted">Token</th>
                        <th className="pb-2 pr-4 text-[11px] font-semibold uppercase tracking-wider text-muted">Value</th>
                        <th className="pb-2 pr-4 text-[11px] font-semibold uppercase tracking-wider text-muted">Type</th>
                        <th className="pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableValues.map((v) => (
                        <tr key={v.id} className="group border-b border-brand-pale/50 transition hover:bg-canvas/50">
                          {editingRow === v.id ? (
                            <EditRow
                              draft={draft}
                              setDraft={setDraft}
                              onSave={saveEdit}
                              onCancel={cancelEdit}
                            />
                          ) : (
                            <>
                              <td className="py-3 pr-4">
                                <span className="text-sm font-medium text-ink">{v.label}</span>
                                {v.system && (
                                  <span className="ml-1.5 rounded bg-canvas px-1 py-0.5 text-[9px] font-medium text-muted">System</span>
                                )}
                              </td>
                              <td className="py-3 pr-4">
                                <button
                                  onClick={() => copyToken(v.key)}
                                  className="group/token flex items-center gap-1 rounded-md bg-brand-light px-2 py-1 font-mono text-[11px] text-brand transition hover:bg-brand hover:text-white"
                                  title="Click to copy"
                                >
                                  {`{{custom.${v.key}}}`}
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3 opacity-0 transition group-hover/token:opacity-100">
                                    {copied === v.key ? (
                                      <path d="M20 6L9 17l-5-5" />
                                    ) : (
                                      <>
                                        <rect x="9" y="9" width="13" height="13" rx="2" />
                                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                      </>
                                    )}
                                  </svg>
                                </button>
                              </td>
                              <td className="py-3 pr-4">
                                <input
                                  type="text"
                                  value={v.value}
                                  onChange={(e) => updateValueInline(v.id, e.target.value)}
                                  className="w-full max-w-xs rounded-md border border-transparent bg-transparent px-2 py-1 text-sm text-ink transition focus:border-brand-pale focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 hover:border-brand-pale hover:bg-white"
                                  placeholder="Enter value..."
                                />
                              </td>
                              <td className="py-3 pr-4">
                                <span className="rounded-full bg-canvas px-2 py-0.5 text-[11px] font-medium text-muted capitalize">
                                  {v.type}
                                </span>
                              </td>
                              <td className="py-3">
                                <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                                  {!v.system && (
                                    <>
                                      <button
                                        onClick={() => startEdit(v)}
                                        className="rounded-md p-1.5 text-muted transition hover:bg-brand-light hover:text-brand"
                                        title="Edit"
                                      >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                                          <path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() => removeValue(v.id)}
                                        className="rounded-md p-1.5 text-muted transition hover:bg-red-50 hover:text-red-500"
                                        title="Delete"
                                      >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                                          <polyline points="3,6 5,6 21,6" />
                                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                        </svg>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}

                      {/* New value row */}
                      {editingRow === "__new__" && (
                        <tr className="border-b border-brand/20 bg-brand-light/30">
                          <EditRow
                            draft={draft}
                            setDraft={setDraft}
                            onSave={saveEdit}
                            onCancel={cancelEdit}
                          />
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function CompanyField({
  label,
  value,
  onChange,
  placeholder,
  token,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  token: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink">{label}</span>
        <code className="rounded-md bg-brand-light px-1.5 py-0.5 text-[10px] font-medium text-brand">
          {`{{custom.${token}}}`}
        </code>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-brand-pale bg-white px-3 py-2.5 text-sm placeholder:text-muted/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
    </label>
  );
}

function EditRow({
  draft,
  setDraft,
  onSave,
  onCancel,
}: {
  draft: { key: string; label: string; value: string; type: CustomValueType };
  setDraft: (d: { key: string; label: string; value: string; type: CustomValueType }) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <>
      <td className="py-2 pr-3">
        <input
          ref={ref}
          value={draft.label}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          placeholder="Label"
          onKeyDown={(e) => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onCancel(); }}
          className="w-full rounded-md border border-brand-pale bg-white px-2 py-1.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </td>
      <td className="py-2 pr-3">
        <input
          value={draft.key}
          onChange={(e) => setDraft({ ...draft, key: e.target.value.replace(/[^a-z0-9_]/g, "") })}
          placeholder="auto_generated"
          onKeyDown={(e) => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onCancel(); }}
          className="w-full rounded-md border border-brand-pale bg-white px-2 py-1.5 font-mono text-[11px] text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </td>
      <td className="py-2 pr-3">
        <input
          value={draft.value}
          onChange={(e) => setDraft({ ...draft, value: e.target.value })}
          placeholder="Value"
          onKeyDown={(e) => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onCancel(); }}
          className="w-full rounded-md border border-brand-pale bg-white px-2 py-1.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </td>
      <td className="py-2 pr-3">
        <select
          value={draft.type}
          onChange={(e) => setDraft({ ...draft, type: e.target.value as CustomValueType })}
          className="rounded-md border border-brand-pale bg-white px-2 py-1.5 text-sm focus:border-brand focus:outline-none"
        >
          <option value="text">Text</option>
          <option value="url">URL</option>
          <option value="image">Image</option>
        </select>
      </td>
      <td className="py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={onSave}
            disabled={!draft.label.trim()}
            className="rounded-md bg-brand px-2.5 py-1 text-[11px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="rounded-md px-2 py-1 text-[11px] text-muted transition hover:bg-brand-light hover:text-ink"
          >
            Cancel
          </button>
        </div>
      </td>
    </>
  );
}
