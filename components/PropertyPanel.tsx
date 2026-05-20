"use client";

import type { Block, PropType } from "@/lib/blocks/types";

interface PropertyPanelProps {
  block: Block | null;
  onChange: (blockId: string, propKey: string, value: string) => void;
}

export function PropertyPanel({ block, onChange }: PropertyPanelProps) {
  if (!block) {
    return (
      <div className="text-sm text-muted leading-relaxed">
        Select a block on the left to edit its properties.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">
          {block.type}
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
    "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

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
              className={`flex-1 rounded-md border px-3 py-2 text-sm capitalize transition ${
                value === opt
                  ? "border-blue-500 bg-blue-50 text-blue-700"
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
