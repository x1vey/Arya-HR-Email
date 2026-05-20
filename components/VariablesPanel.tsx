"use client";

import type { VariableDef } from "@/lib/blocks/types";

interface VariablesPanelProps {
  variables: VariableDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

/**
 * The "data source" stand-in. In production this maps to a row pulled from
 * the customer's connected database. In the POC, you edit values by hand to
 * see how the email re-renders.
 */
export function VariablesPanel({ variables, values, onChange }: VariablesPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold text-ink">Data</h2>
        <p className="text-xs text-muted mt-1 leading-relaxed">
          Stand-in for a row from the connected data source. In production
          these get filled per recipient.
        </p>
      </div>
      {variables.map((v) => (
        <label key={v.key} className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">
            {v.label} <code className="text-[10px] text-slate-400">{`{{${v.key}}}`}</code>
          </span>
          <input
            type="text"
            value={values[v.key] ?? ""}
            onChange={(e) => onChange(v.key, e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </label>
      ))}
    </div>
  );
}
