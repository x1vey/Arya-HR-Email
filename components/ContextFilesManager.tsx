"use client";

import { useState, useEffect, useCallback } from "react";

export interface ContextFile {
  id: string;
  name: string;
  content: string;
  active: boolean;
}

const STORAGE_KEY = "arya_context_files";

function load(): ContextFile[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(files: ContextFile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

interface Props {
  disabled?: boolean;
}

export function useContextFiles() {
  const [files, setFiles] = useState<ContextFile[]>([]);
  useEffect(() => setFiles(load()), []);

  const persist = useCallback((next: ContextFile[]) => {
    setFiles(next);
    save(next);
  }, []);

  const activeFiles = files.filter((f) => f.active && f.content.trim());

  return { files, setFiles: persist, activeFiles };
}

export function ContextFilesManager({ disabled }: Props) {
  const { files, setFiles } = useContextFiles();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftContent, setDraftContent] = useState("");

  const add = () => {
    const id = `ctx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setEditingId(id);
    setDraftName("");
    setDraftContent("");
  };

  const startEdit = (f: ContextFile) => {
    setEditingId(f.id);
    setDraftName(f.name);
    setDraftContent(f.content);
  };

  const saveEdit = () => {
    if (!draftName.trim()) return;
    const exists = files.find((f) => f.id === editingId);
    if (exists) {
      setFiles(files.map((f) => (f.id === editingId ? { ...f, name: draftName.trim(), content: draftContent } : f)));
    } else {
      setFiles([...files, { id: editingId!, name: draftName.trim(), content: draftContent, active: true }]);
    }
    setEditingId(null);
  };

  const toggle = (id: string) => setFiles(files.map((f) => (f.id === id ? { ...f, active: !f.active } : f)));
  const remove = (id: string) => setFiles(files.filter((f) => f.id !== id));

  const EXAMPLES = [
    { name: "Brand colors & style", content: "Primary: #2563EB, Secondary: #7C3AED\nFont: Inter, clean and modern\nTone: Professional but friendly\nUse rounded corners (12px), generous whitespace\nButton style: pill-shaped, bold CTA text" },
    { name: "Company info", content: "Company: Acme Corp\nIndustry: Tech / SaaS\nLogo: https://yourlogo.com/logo.png\nAddress: 123 Main St, San Francisco, CA\nSign off as: The People Team" },
    { name: "Design inspiration", content: "Style: Apple-inspired minimalism\nBig bold headlines with tight letter-spacing\nSubtle gradient backgrounds\nPremium feel — think luxury, not corporate\nUse product-quality placeholder images" },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          Context files
          {files.filter((f) => f.active).length > 0 && (
            <span className="ml-1.5 rounded-full bg-green-50 px-1.5 py-0.5 text-[9px] font-bold normal-case text-green-600">
              {files.filter((f) => f.active).length} active
            </span>
          )}
        </span>
        <button
          onClick={add}
          disabled={disabled}
          className="rounded-md px-2 py-0.5 text-[11px] font-medium text-brand transition hover:bg-brand-light disabled:opacity-50"
        >
          + Add
        </button>
      </div>

      {/* Saved files list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-1">
          {files.map((f) => (
            <div
              key={f.id}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 transition ${
                f.active ? "border-brand/30 bg-brand-light/40" : "border-brand-pale bg-white opacity-60"
              }`}
            >
              <button
                onClick={() => toggle(f.id)}
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                  f.active
                    ? "border-brand bg-brand text-white"
                    : "border-brand-pale bg-white text-transparent"
                }`}
              >
                {f.active ? "✓" : ""}
              </button>
              <button onClick={() => startEdit(f)} className="flex-1 truncate text-left text-xs font-medium text-ink">
                {f.name}
              </button>
              <button
                onClick={() => remove(f.id)}
                className="shrink-0 text-[10px] text-muted transition hover:text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit / create form */}
      {editingId && (
        <div className="flex flex-col gap-2 rounded-xl border border-brand/30 bg-canvas p-3">
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="File name (e.g. Brand colors, Design style)"
            className="w-full rounded-lg border border-brand-pale bg-white px-3 py-1.5 text-xs text-ink placeholder:text-muted/50 focus:border-brand focus:outline-none"
          />
          <textarea
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            placeholder="Paste your brand guidelines, color palette, design preferences, example descriptions..."
            rows={5}
            className="w-full resize-y rounded-lg border border-brand-pale bg-white px-3 py-2 text-xs leading-relaxed text-ink placeholder:text-muted/50 focus:border-brand focus:outline-none"
          />
          <div className="flex items-center justify-between">
            <button
              onClick={() => setEditingId(null)}
              className="rounded-md px-2.5 py-1 text-[11px] text-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              disabled={!draftName.trim()}
              className="rounded-md bg-brand px-3 py-1 text-[11px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Empty state with examples */}
      {files.length === 0 && !editingId && (
        <div className="flex flex-col gap-2 rounded-xl border border-dashed border-brand-pale bg-canvas/50 p-3">
          <p className="text-[11px] text-muted">
            Add context files so every AI email matches your brand. The AI reads these before generating.
          </p>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-muted">Quick-start templates:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.name}
                onClick={() => {
                  setEditingId(`ctx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
                  setDraftName(ex.name);
                  setDraftContent(ex.content);
                }}
                disabled={disabled}
                className="rounded-md border border-brand-pale bg-white px-2.5 py-1.5 text-left text-[11px] text-ink transition hover:border-brand/40 disabled:opacity-50"
              >
                {ex.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
