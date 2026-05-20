"use client";

import { useState, useRef, useEffect } from "react";
import type { Template } from "@/lib/blocks/types";
import type { AiProvider } from "@/lib/ai/generate-email";

interface AiGenerateModalProps {
  open: boolean;
  onClose: () => void;
  onGenerated: (template: Template) => void;
}

const SUGGESTIONS = [
  "Welcome email for new employees with company values and first-day checklist",
  "Birthday celebration email with colorful design and warm wishes",
  "Policy update announcement with summary, effective date, and action items",
  "Monthly newsletter with company news, team spotlight, and upcoming events",
  "Work anniversary congratulations with milestone badge and team message",
  "Benefits enrollment reminder with deadline, key changes, and enrollment link",
];

const STORAGE_KEYS: Record<AiProvider, string> = {
  gemini: "arya_gemini_api_key",
  groq: "arya_groq_api_key",
};

const PROVIDER_META: Record<AiProvider, { label: string; placeholder: string; envHint: string }> = {
  gemini: {
    label: "Gemini",
    placeholder: "AIza... (or set GEMINI_API_KEY in .env.local)",
    envHint: "aistudio.google.com/apikey",
  },
  groq: {
    label: "Groq",
    placeholder: "gsk_... (or set GROQ_API_KEY in .env.local)",
    envHint: "console.groq.com",
  },
};

export function AiGenerateModal({ open, onClose, onGenerated }: AiGenerateModalProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<AiProvider>("gemini");
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      const saved = localStorage.getItem("arya_ai_provider") as AiProvider | null;
      const p = saved === "groq" ? "groq" : "gemini";
      setProvider(p);
      setApiKey(localStorage.getItem(STORAGE_KEYS[p]) ?? "");
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open]);

  // Sync key when provider changes
  const switchProvider = (p: AiProvider) => {
    setProvider(p);
    setApiKey(localStorage.getItem(STORAGE_KEYS[p]) ?? "");
    localStorage.setItem("arya_ai_provider", p);
  };

  if (!open) return null;

  const meta = PROVIDER_META[provider];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    if (apiKey.trim()) {
      localStorage.setItem(STORAGE_KEYS[provider], apiKey.trim());
    }

    try {
      const res = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          provider,
          ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      onGenerated(data.template);
      setPrompt("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">Generate with AI</h3>
              <p className="text-xs text-muted">Describe the email you want to create</p>
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

        {/* Body */}
        <div className="flex flex-col gap-4 px-6 py-5">
          {/* Prompt input */}
          <div className="flex flex-col gap-1.5">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && prompt.trim() && !loading) {
                  handleGenerate();
                }
              }}
              placeholder="e.g. A warm welcome email for new hires with company culture highlights, a team photo section, and a first-week checklist..."
              rows={4}
              disabled={loading}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
            />
            <p className="text-[11px] text-muted">
              Be specific about the purpose, tone, sections, and any dynamic fields (employee name, dates, etc.).
              Press <kbd className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-medium">Ctrl+Enter</kbd> to
              generate.
            </p>
          </div>

          {/* Suggestions */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Try a suggestion
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  disabled={loading}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600 transition hover:border-brand/40 hover:bg-brand-light hover:text-brand-dark disabled:opacity-50"
                >
                  {s.length > 50 ? s.slice(0, 50) + "..." : s}
                </button>
              ))}
            </div>
          </div>

          {/* Provider + API key */}
          <div className="flex flex-col gap-2">
            {/* Provider toggle */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Provider
              </span>
              <div className="flex rounded-lg border border-slate-200">
                {(["gemini", "groq"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => switchProvider(p)}
                    className={`px-3 py-1 text-xs font-medium transition ${
                      provider === p
                        ? "bg-brand-light text-brand-dark"
                        : "text-slate-500 hover:text-ink"
                    } ${p === "gemini" ? "rounded-l-md" : "rounded-r-md border-l border-slate-200"}`}
                  >
                    {PROVIDER_META[p].label}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-muted">
                {provider === "groq" ? "Llama 3.3 70B — fast, generous free tier" : "Gemini 2.0 Flash"}
              </span>
            </div>

            {/* Key input */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="flex items-center gap-1 self-start text-[11px] font-medium text-muted transition hover:text-brand"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`h-3 w-3 transition ${showKeyInput ? "rotate-90" : ""}`}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
                {apiKey ? `${meta.label} key saved` : `${meta.label} API key`}
              </button>
              {showKeyInput && (
                <div className="flex flex-col gap-1">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={meta.placeholder}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                  <p className="text-[10px] text-muted">
                    Get a key at{" "}
                    <a
                      href={`https://${meta.envHint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand underline"
                    >
                      {meta.envHint}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
            className="flex items-center gap-2 rounded-lg bg-brand-gradient px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Spinner />
                Generating...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Generate email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path
        d="M4 12a8 8 0 018-8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-75"
      />
    </svg>
  );
}
