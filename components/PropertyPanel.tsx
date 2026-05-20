"use client";

import { useState } from "react";
import type { Block, PropType, VariableDef } from "@/lib/blocks/types";

interface PropertyPanelProps {
  block: Block | null;
  onChange: (blockId: string, propKey: string, value: string) => void;
  variables: VariableDef[];
  variableValues: Record<string, string>;
  onVariableChange: (key: string, value: string) => void;
  onSaveTemplate: (name: string) => void;
  templateName: string;
}

export function PropertyPanel({
  block,
  onChange,
  variables,
  variableValues,
  onVariableChange,
  onSaveTemplate,
  templateName
}: PropertyPanelProps) {
  const [showVars, setShowVars] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [showSave, setShowSave] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {block ? (
          <div className="flex flex-col gap-4 p-4">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-brand">
                {block.type.replace(/_/g, " ")}
              </div>
              <h3 className="text-base font-semibold text-ink">{block.label}</h3>
            </div>
            <div className="flex flex-col gap-3">
              {Object.entries(block.propTypes).map(([key, type]) => (
                <PropertyInput
                  key={key}
                  label={prettify(key)}
                  propKey={key}
                  type={type}
                  value={block.props[key] ?? ""}
                  onChange={(v) => onChange(block.id, key, v)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-brand">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                <path d="M15 15l-2 5L9 9l11 4-5 2z" />
                <path d="M15 15l5 5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-ink">Click any section</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Select a block in the email to edit its text, colors, links, and images here.
              </p>
            </div>
          </div>
        )}

        {variables.length > 0 && (
          <div className="border-t border-slate-200 px-4 py-3">
            <button
              onClick={() => setShowVars(!showVars)}
              className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted"
            >
              <span>Merge tags ({variables.length})</span>
              <span className="text-base">{showVars ? "−" : "+"}</span>
            </button>
            {showVars && (
              <div className="mt-3 flex flex-col gap-2.5">
                <p className="text-[11px] leading-relaxed text-muted">
                  Preview values — replaced per recipient when you send.
                  Use <code className="rounded bg-slate-100 px-1 text-[10px]">{`{{key}}`}</code> in any text field.
                </p>
                {variables.map((v) => (
                  <label key={v.key} className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                      {v.label}
                      <code className="rounded bg-brand-light px-1 py-0.5 text-[10px] text-brand">{`{{${v.key}}}`}</code>
                    </span>
                    <input
                      type="text"
                      value={variableValues[v.key] ?? ""}
                      onChange={(e) => onVariableChange(v.key, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 p-4">
        {showSave ? (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Template name"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && saveName.trim()) {
                  onSaveTemplate(saveName.trim());
                  setShowSave(false);
                  setSaveName("");
                } else if (e.key === "Escape") {
                  setShowSave(false);
                  setSaveName("");
                }
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (saveName.trim()) {
                    onSaveTemplate(saveName.trim());
                    setShowSave(false);
                    setSaveName("");
                  }
                }}
                disabled={!saveName.trim()}
                className="flex-1 rounded-lg bg-brand-gradient py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => { setShowSave(false); setSaveName(""); }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => { setShowSave(true); setSaveName(templateName); }}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-ink transition hover:border-brand/50 hover:text-brand"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17,21 17,13 7,13 7,21" />
              <polyline points="7,3 7,8 15,8" />
            </svg>
            Save template
          </button>
        )}
      </div>
    </div>
  );
}

function PropertyInput({
  label,
  propKey,
  type,
  value,
  onChange
}: {
  label: string;
  propKey: string;
  type: PropType;
  value: string;
  onChange: (v: string) => void;
}) {
  const baseInputCls =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-600">{label}</span>

      {type === "longtext" && (
        <textarea
          className={`${baseInputCls} min-h-[80px] resize-y`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {type === "text" && (
        <input
          type="text"
          className={baseInputCls}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {type === "link_url" && (
        <input
          type="text"
          className={baseInputCls}
          value={value}
          placeholder="https://… or {{links.something}}"
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {type === "image_url" && (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            className={baseInputCls}
            value={value}
            placeholder="https://…"
            onChange={(e) => onChange(e.target.value)}
          />
          {value && (
            <img
              src={value}
              alt="preview"
              className="h-20 w-full rounded border border-slate-200 object-cover"
            />
          )}
        </div>
      )}

      {type === "color" && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={normalizeHex(value)}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded border border-slate-200"
          />
          <input
            type="text"
            className={`${baseInputCls} flex-1`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}

      {type === "alignment" && (
        <div className="flex gap-1">
          {(["left", "center", "right"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm capitalize transition ${
                value === opt
                  ? "border-brand bg-brand-light text-brand-dark"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </label>
  );
}

function prettify(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeHex(v: string): string {
  // Color inputs require #RRGGBB. If the value is a token like
  // {{variable}}, fall back to a neutral color so the input doesn't error.
  if (/^#[0-9A-Fa-f]{6}$/.test(v)) return v;
  return "#888888";
}
