"use client";

import { useState, useRef, useEffect } from "react";
import type { Template } from "@/lib/blocks/types";

interface ImportHtmlModalProps {
  open: boolean;
  onClose: () => void;
  onImported: (template: Template) => void;
}

export function ImportHtmlModal({ open, onClose, onImported }: ImportHtmlModalProps) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open]);

  if (!open) return null;

  const handleImport = async () => {
    if (!html.trim()) return;
    setLoading(true);
    setError(null);

    const provider = (localStorage.getItem("arya_ai_provider") ?? "gemini") as "gemini" | "groq";
    const keyStore = provider === "groq" ? "arya_groq_api_key" : "arya_gemini_api_key";
    const apiKey = localStorage.getItem(keyStore) ?? "";

    try {
      const res = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Convert this existing HTML email into an editable block-tree template. Preserve the exact visual design, colors, layout, and content. Each section should become a separate editable block with appropriate props. Here is the HTML:\n\n${html.trim()}`,
          provider,
          ...(apiKey ? { apiKey } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Import failed (${res.status})`);

      onImported(data.template);
      setHtml("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setHtml(text);
    } catch {
      // Clipboard API may be blocked
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" onClick={onClose}>
      <div
        className="flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-slate-600">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">Import HTML email</h3>
              <p className="text-xs text-muted">Paste HTML and AI will convert it into editable blocks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-3 px-6 py-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">HTML source</span>
            <button
              onClick={handlePaste}
              className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-500 transition hover:border-slate-300 hover:text-ink"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Paste from clipboard
            </button>
          </div>
          <textarea
            ref={textareaRef}
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder={`<!DOCTYPE html>\n<html>\n<body>\n  <!-- Paste your email HTML here -->\n</body>\n</html>`}
            rows={12}
            disabled={loading}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs leading-relaxed text-ink placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
          />
          <p className="text-[11px] text-muted">
            The AI will analyze the structure, extract editable sections, and create blocks you can customize in the editor.
            Works best with complete HTML emails (including the outer table/body structure).
          </p>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!html.trim() || loading}
            className="flex items-center gap-2 rounded-lg bg-brand-gradient px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
                Converting...
              </>
            ) : (
              "Import & convert"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
