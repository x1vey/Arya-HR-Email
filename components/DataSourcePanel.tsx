"use client";

import { useState, useRef, useCallback } from "react";
import type { VariableDef } from "@/lib/blocks/types";
import {
  type DataSource,
  type DataSourceField,
  type FieldMapping,
  parseCsv,
  headerToKey,
  autoMapFields,
  loadDataSources,
  saveDataSources,
} from "@/lib/data-sources/types";

interface DataSourcePanelProps {
  variables: VariableDef[];
  variableValues: Record<string, string>;
  onVariableChange: (key: string, value: string) => void;
}

export function DataSourcePanel({
  variables,
  variableValues,
  onVariableChange,
}: DataSourcePanelProps) {
  const [sources, setSources] = useState<DataSource[]>(() => loadDataSources());
  const [showAdd, setShowAdd] = useState(false);
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const [showMapping, setShowMapping] = useState(false);

  const persist = useCallback((next: DataSource[]) => {
    setSources(next);
    saveDataSources(next);
  }, []);

  const removeSource = useCallback(
    (id: string) => {
      persist(sources.filter((s) => s.id !== id));
      if (activeSourceId === id) setActiveSourceId(null);
    },
    [sources, persist, activeSourceId]
  );

  const applyPreview = useCallback(
    (source: DataSource) => {
      // Apply first row of data as preview values
      for (const m of source.mappings) {
        const field = source.fields.find((f) => f.key === m.sourceField);
        if (field) onVariableChange(m.variableKey, field.sample);
      }
    },
    [onVariableChange]
  );

  const activeSource = sources.find((s) => s.id === activeSourceId) ?? null;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold text-ink">Data sources</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Connect data to populate merge tags with real values.
        </p>
      </div>

      {/* Connected sources */}
      {sources.length > 0 && (
        <div className="flex flex-col gap-2">
          {sources.map((s) => (
            <div
              key={s.id}
              className={`group flex items-center gap-3 rounded-xl border p-3 transition cursor-pointer ${
                activeSourceId === s.id
                  ? "border-brand bg-brand-light"
                  : "border-brand-pale bg-white hover:border-brand/30"
              }`}
              onClick={() => setActiveSourceId(activeSourceId === s.id ? null : s.id)}
            >
              <SourceIcon type={s.type} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-ink">{s.name}</div>
                <div className="text-[11px] text-muted">
                  {s.recordCount} records &middot; {s.mappings.length} mapped
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeSource(s.id); }}
                className="rounded-md p-1 text-muted opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                title="Remove"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Active source details */}
      {activeSource && (
        <div className="rounded-xl border border-brand-pale bg-white p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink">Field mappings</span>
            <button
              onClick={() => {
                applyPreview(activeSource);
              }}
              className="rounded-md border border-brand-pale px-2 py-0.5 text-[10px] font-medium text-brand transition hover:bg-brand-light"
            >
              Preview data
            </button>
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            {activeSource.mappings.length === 0 ? (
              <p className="text-[11px] text-muted">No fields mapped yet.</p>
            ) : (
              activeSource.mappings.map((m) => (
                <div key={m.variableKey} className="flex items-center gap-2 text-[11px]">
                  <code className="rounded bg-brand-light px-1.5 py-0.5 font-mono text-[10px] text-brand">{`{{${m.variableKey}}}`}</code>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3 text-muted">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <span className="text-ink">{m.sourceField}</span>
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => setShowMapping(!showMapping)}
            className="mt-2 text-[11px] font-medium text-brand transition hover:text-brand-dark"
          >
            {showMapping ? "Hide mapping editor" : "Edit mappings"}
          </button>
          {showMapping && (
            <MappingEditor
              source={activeSource}
              variables={variables}
              onUpdate={(mappings) => {
                const updated = sources.map((s) =>
                  s.id === activeSource.id ? { ...s, mappings } : s
                );
                persist(updated);
              }}
            />
          )}
        </div>
      )}

      {/* Add new source */}
      {showAdd ? (
        <AddSourceFlow
          variables={variables}
          onAdded={(source) => {
            persist([...sources, source]);
            setActiveSourceId(source.id);
            setShowAdd(false);
          }}
          onCancel={() => setShowAdd(false)}
        />
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2.5 rounded-xl border-2 border-dashed border-brand-pale p-3 text-left transition hover:border-brand/40 hover:bg-brand-light/30"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span>
            <span className="block text-sm font-medium text-ink">Add data source</span>
            <span className="block text-[11px] text-muted">CSV, Airtable, or CRM</span>
          </span>
        </button>
      )}

      {/* Merge tags reference */}
      {variables.length > 0 && (
        <div className="rounded-xl border border-brand-pale bg-white p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">Merge tags</div>
          <div className="mt-2 flex flex-col gap-1.5">
            {variables.map((v) => (
              <label key={v.key} className="flex flex-col gap-0.5">
                <span className="flex items-center gap-1.5 text-xs font-medium text-ink">
                  {v.label}
                  <code className="rounded bg-brand-light px-1 py-0.5 text-[10px] text-brand">{`{{${v.key}}}`}</code>
                </span>
                <input
                  type="text"
                  value={variableValues[v.key] ?? ""}
                  onChange={(e) => onVariableChange(v.key, e.target.value)}
                  className="w-full rounded-lg border border-brand-pale bg-white px-3 py-1.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Source type icon ── */

function SourceIcon({ type }: { type: string }) {
  if (type === "csv") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-teal/15 text-accent-teal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14,2 14,8 20,8" />
        </svg>
      </div>
    );
  }
  if (type === "airtable") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-blue/15 text-accent-blue">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </svg>
      </div>
    );
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-purple/15 text-accent-purple">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    </div>
  );
}

/* ── Add source flow ── */

function AddSourceFlow({
  variables,
  onAdded,
  onCancel,
}: {
  variables: VariableDef[];
  onAdded: (s: DataSource) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState<"pick" | "csv" | "airtable" | "crm">("pick");
  const [csvText, setCsvText] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [airtableBase, setAirtableBase] = useState("");
  const [airtableTable, setAirtableTable] = useState("");
  const [airtableKey, setAirtableKey] = useState("");
  const [crmProvider, setCrmProvider] = useState("hubspot");
  const [crmUrl, setCrmUrl] = useState("");
  const [crmKey, setCrmKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSourceName(file.name.replace(/\.[^.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCsvText(ev.target?.result as string ?? "");
    };
    reader.readAsText(file);
  };

  const handleCsvSubmit = () => {
    setError(null);
    const { headers, rows } = parseCsv(csvText);
    if (headers.length === 0) {
      setError("No columns detected. Paste valid CSV data.");
      return;
    }
    const fields: DataSourceField[] = headers.map((h) => ({
      key: headerToKey(h),
      label: h,
      sample: rows[0]?.[headers.indexOf(h)] ?? "",
    }));
    const mappings = autoMapFields(
      fields,
      variables.map((v) => ({ key: v.key, label: v.label }))
    );
    const source: DataSource = {
      id: `ds_csv_${Date.now()}`,
      name: sourceName || "CSV Import",
      type: "csv",
      fields,
      mappings,
      connectedAt: new Date().toISOString(),
      recordCount: rows.length,
      config: { type: "csv", fileName: sourceName, rawCsv: csvText },
    };
    onAdded(source);
  };

  const handleAirtableSubmit = () => {
    setError(null);
    if (!airtableBase || !airtableTable || !airtableKey) {
      setError("All fields are required.");
      return;
    }
    // Create a placeholder source — actual Airtable fetch would happen server-side
    const source: DataSource = {
      id: `ds_at_${Date.now()}`,
      name: sourceName || `Airtable: ${airtableTable}`,
      type: "airtable",
      fields: [],
      mappings: [],
      connectedAt: new Date().toISOString(),
      recordCount: 0,
      config: { type: "airtable", baseId: airtableBase, tableId: airtableTable, apiKey: airtableKey },
    };
    onAdded(source);
  };

  const handleCrmSubmit = () => {
    setError(null);
    if (!crmUrl || !crmKey) {
      setError("API URL and key are required.");
      return;
    }
    const source: DataSource = {
      id: `ds_crm_${Date.now()}`,
      name: sourceName || `${crmProvider} CRM`,
      type: "crm",
      fields: [],
      mappings: [],
      connectedAt: new Date().toISOString(),
      recordCount: 0,
      config: { type: "crm", provider: crmProvider, apiUrl: crmUrl, apiKey: crmKey },
    };
    onAdded(source);
  };

  if (step === "pick") {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-brand-pale bg-white p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink">Choose source type</span>
          <button onClick={onCancel} className="text-[11px] text-muted hover:text-ink">Cancel</button>
        </div>
        <button
          onClick={() => setStep("csv")}
          className="flex items-center gap-3 rounded-lg border border-brand-pale p-2.5 text-left transition hover:border-brand/30 hover:bg-brand-light/30"
        >
          <SourceIcon type="csv" />
          <div>
            <div className="text-sm font-medium text-ink">CSV file</div>
            <div className="text-[11px] text-muted">Upload or paste a spreadsheet</div>
          </div>
        </button>
        <button
          onClick={() => setStep("airtable")}
          className="flex items-center gap-3 rounded-lg border border-brand-pale p-2.5 text-left transition hover:border-brand/30 hover:bg-brand-light/30"
        >
          <SourceIcon type="airtable" />
          <div>
            <div className="text-sm font-medium text-ink">Airtable</div>
            <div className="text-[11px] text-muted">Connect a base and table</div>
          </div>
        </button>
        <button
          onClick={() => setStep("crm")}
          className="flex items-center gap-3 rounded-lg border border-brand-pale p-2.5 text-left transition hover:border-brand/30 hover:bg-brand-light/30"
        >
          <SourceIcon type="crm" />
          <div>
            <div className="text-sm font-medium text-ink">CRM / API</div>
            <div className="text-[11px] text-muted">HubSpot, Salesforce, or custom</div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-brand-pale bg-white p-3">
      <div className="flex items-center justify-between">
        <button onClick={() => setStep("pick")} className="flex items-center gap-1 text-[11px] font-medium text-muted hover:text-ink">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
        <button onClick={onCancel} className="text-[11px] text-muted hover:text-ink">Cancel</button>
      </div>

      <input
        type="text"
        value={sourceName}
        onChange={(e) => setSourceName(e.target.value)}
        placeholder="Source name"
        className="w-full rounded-lg border border-brand-pale bg-white px-3 py-1.5 text-sm placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      />

      {step === "csv" && (
        <>
          <div className="flex gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 rounded-lg border border-brand-pale py-2 text-center text-xs font-medium text-brand transition hover:bg-brand-light"
            >
              Upload .csv
            </button>
            <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={handleCsvFile} />
          </div>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={"name,email,department\nJane Doe,jane@acme.com,Engineering\nJohn Smith,john@acme.com,Sales"}
            rows={6}
            className="w-full resize-y rounded-lg border border-brand-pale bg-canvas px-3 py-2 font-mono text-xs text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          <button
            onClick={handleCsvSubmit}
            disabled={!csvText.trim()}
            className="rounded-lg bg-brand-gradient py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            Import CSV
          </button>
        </>
      )}

      {step === "airtable" && (
        <>
          <input
            type="text"
            value={airtableBase}
            onChange={(e) => setAirtableBase(e.target.value)}
            placeholder="Base ID (e.g. appXXXXXXXX)"
            className="w-full rounded-lg border border-brand-pale bg-white px-3 py-1.5 text-sm placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          <input
            type="text"
            value={airtableTable}
            onChange={(e) => setAirtableTable(e.target.value)}
            placeholder="Table name or ID"
            className="w-full rounded-lg border border-brand-pale bg-white px-3 py-1.5 text-sm placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          <input
            type="password"
            value={airtableKey}
            onChange={(e) => setAirtableKey(e.target.value)}
            placeholder="Personal access token"
            className="w-full rounded-lg border border-brand-pale bg-white px-3 py-1.5 text-sm placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          <p className="text-[10px] text-muted">
            Get a token at <a href="https://airtable.com/create/tokens" target="_blank" rel="noopener noreferrer" className="text-brand underline">airtable.com/create/tokens</a>
          </p>
          <button
            onClick={handleAirtableSubmit}
            className="rounded-lg bg-brand-gradient py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Connect Airtable
          </button>
        </>
      )}

      {step === "crm" && (
        <>
          <select
            value={crmProvider}
            onChange={(e) => setCrmProvider(e.target.value)}
            className="w-full rounded-lg border border-brand-pale bg-white px-3 py-1.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            <option value="hubspot">HubSpot</option>
            <option value="salesforce">Salesforce</option>
            <option value="pipedrive">Pipedrive</option>
            <option value="custom">Custom API</option>
          </select>
          <input
            type="text"
            value={crmUrl}
            onChange={(e) => setCrmUrl(e.target.value)}
            placeholder="API endpoint URL"
            className="w-full rounded-lg border border-brand-pale bg-white px-3 py-1.5 text-sm placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          <input
            type="password"
            value={crmKey}
            onChange={(e) => setCrmKey(e.target.value)}
            placeholder="API key or token"
            className="w-full rounded-lg border border-brand-pale bg-white px-3 py-1.5 text-sm placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          <button
            onClick={handleCrmSubmit}
            className="rounded-lg bg-brand-gradient py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Connect CRM
          </button>
        </>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}

/* ── Mapping editor ── */

function MappingEditor({
  source,
  variables,
  onUpdate,
}: {
  source: DataSource;
  variables: VariableDef[];
  onUpdate: (mappings: FieldMapping[]) => void;
}) {
  const [mappings, setMappings] = useState<FieldMapping[]>(source.mappings);

  const update = (variableKey: string, sourceField: string) => {
    const next = mappings.filter((m) => m.variableKey !== variableKey);
    if (sourceField) next.push({ variableKey, sourceField });
    setMappings(next);
    onUpdate(next);
  };

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      {variables.map((v) => {
        const current = mappings.find((m) => m.variableKey === v.key);
        return (
          <div key={v.key} className="flex items-center gap-2">
            <span className="w-1/2 truncate text-[11px] text-ink">{v.label}</span>
            <select
              value={current?.sourceField ?? ""}
              onChange={(e) => update(v.key, e.target.value)}
              className="w-1/2 rounded border border-brand-pale bg-white px-2 py-1 text-[11px] focus:border-brand focus:outline-none"
            >
              <option value="">-- unmapped --</option>
              {source.fields.map((f) => (
                <option key={f.key} value={f.key}>{f.label}</option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}
