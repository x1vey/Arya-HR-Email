"use client";

import { useState, useRef, useEffect } from "react";
import type { Template } from "@/lib/blocks/types";
import type { AiProvider } from "@/lib/ai/generate-email";
import { ContextFilesManager, useContextFiles } from "./ContextFilesManager";

interface AiGenerateModalProps {
  open: boolean;
  onClose: () => void;
  onGenerated: (template: Template) => void;
}

type Step = "design" | "copy";

const SUGGESTIONS = [
  "Birthday",
  "Welcome new hire",
  "Policy update",
  "Newsletter",
  "Work anniversary",
  "Benefits enrollment",
  "Team offsite invite",
  "Farewell & good luck",
];

const COPY_SUGGESTIONS = [
  "Warmer & more personal",
  "Crisp & executive",
  "Storytelling tone",
  "More motivating",
  "Plain, simple language",
  "Celebratory & upbeat",
];

const STORAGE_KEYS: Record<AiProvider, string> = {
  gemini: "arya_gemini_api_key",
  groq: "arya_groq_api_key",
  openrouter: "arya_openrouter_api_key",
};

const PROVIDER_META: Record<AiProvider, { label: string; sub: string; placeholder: string; envHint: string }> = {
  gemini: {
    label: "Gemini",
    sub: "Google Gemini 2.0 Flash",
    placeholder: "AIza... (or set GEMINI_API_KEY in .env.local)",
    envHint: "aistudio.google.com/apikey",
  },
  groq: {
    label: "Groq",
    sub: "Llama 3.3 70B — fast",
    placeholder: "gsk_... (or set GROQ_API_KEY in .env.local)",
    envHint: "console.groq.com",
  },
  openrouter: {
    label: "OpenRouter",
    sub: "Multi-model gateway",
    placeholder: "sk-or-... (or set OPENROUTER_API_KEY in .env.local)",
    envHint: "openrouter.ai/keys",
  },
};

export function AiGenerateModal({ open, onClose, onGenerated }: AiGenerateModalProps) {
  const [step, setStep] = useState<Step>("design");
  const [prompt, setPrompt] = useState("");
  const [copyBrief, setCopyBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<AiProvider>("gemini");
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [quota, setQuota] = useState<{ remaining: number; limit: number } | null>(null);
  const [designTemplate, setDesignTemplate] = useState<Template | null>(null);
  const [finalTemplate, setFinalTemplate] = useState<Template | null>(null);
  const [copyApplied, setCopyApplied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const copyRef = useRef<HTMLTextAreaElement>(null);
  const { activeFiles } = useContextFiles();

  useEffect(() => {
    if (open) {
      setError(null);
      setStep("design");
      setDesignTemplate(null);
      setFinalTemplate(null);
      setCopyApplied(false);
      const saved = localStorage.getItem("arya_ai_provider");
      const p: AiProvider = saved === "groq" ? "groq" : saved === "openrouter" ? "openrouter" : "gemini";
      setProvider(p);
      setApiKey(localStorage.getItem(STORAGE_KEYS[p]) ?? "");
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (open && step === "copy") setTimeout(() => copyRef.current?.focus(), 100);
  }, [open, step]);

  const switchProvider = (p: AiProvider) => {
    setProvider(p);
    setApiKey(localStorage.getItem(STORAGE_KEYS[p]) ?? "");
    localStorage.setItem("arya_ai_provider", p);
  };

  if (!open) return null;

  const meta = PROVIDER_META[provider];

  const close = () => {
    setPrompt("");
    setCopyBrief("");
    setStep("design");
    setDesignTemplate(null);
    setFinalTemplate(null);
    setCopyApplied(false);
    onClose();
  };

  const callApi = async (body: Record<string, unknown>) => {
    const res = await fetch("/api/generate-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
        contextFiles: activeFiles.map((f) => ({ name: f.name, content: f.content })),
        ...body,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    if (data.quota) setQuota(data.quota);
    return data as { template: Template };
  };

  const handleGenerateDesign = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    if (apiKey.trim()) localStorage.setItem(STORAGE_KEYS[provider], apiKey.trim());

    try {
      const data = await callApi({ mode: "design", prompt: prompt.trim() });
      setDesignTemplate(data.template);
      setFinalTemplate(null);
      setCopyApplied(false);
      setStep("copy");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCopy = async () => {
    if (!designTemplate || loading) return;
    setLoading(true);
    setError(null);

    try {
      // Always rewrite from the original design draft so each take is a clean,
      // independent pass rather than copy-of-a-copy.
      const data = await callApi({
        mode: "copy",
        template: designTemplate,
        brief: copyBrief.trim(),
      });
      setFinalTemplate(data.template);
      setCopyApplied(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const addToEditor = (t: Template | null) => {
    if (!t) return;
    onGenerated(t);
    close();
  };

  const blockChips = (designTemplate?.blocks ?? []).map((b) => b.label || b.type);

  const isCopy = step === "copy";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={close}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-pale px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                isCopy
                  ? "bg-gradient-to-br from-violet-500 to-fuchsia-500"
                  : "bg-brand-gradient"
              }`}
            >
              {isCopy ? (
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
                  <path
                    d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.586 7.586"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="11" cy="11" r="2" stroke="currentColor" strokeWidth="2" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">
                {isCopy ? "Copy Studio" : "Design Studio"}
              </h3>
              <p className="text-xs text-muted">
                {isCopy
                  ? "A dedicated copywriter dials in high-converting words"
                  : "Describe the email and we'll design the layout"}
              </p>
            </div>
          </div>
          <button
            onClick={close}
            className="rounded-lg p-1.5 text-muted transition hover:bg-brand-light hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 border-b border-brand-pale bg-canvas/40 px-6 py-2.5">
          <StepPill index={1} label="Design" state={isCopy ? "done" : "active"} accent="brand" />
          <div className={`h-px flex-1 ${isCopy ? "bg-violet-300" : "bg-brand-pale"}`} />
          <StepPill
            index={2}
            label="Copy"
            state={isCopy ? "active" : "todo"}
            accent="violet"
          />
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          {!isCopy ? (
            /* ───────────── DESIGN STEP ───────────── */
            <>
              <div className="flex flex-col gap-1.5">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && prompt.trim() && !loading) {
                      handleGenerateDesign();
                    }
                  }}
                  placeholder="e.g. A warm welcome email for new hires with company culture highlights, a team photo section, and a first-week checklist..."
                  rows={4}
                  disabled={loading}
                  className="w-full resize-none rounded-xl border border-brand-pale bg-white px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-muted/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
                />
                <p className="text-[11px] text-muted">
                  Focus on the purpose, sections, and structure — the words get perfected in the next
                  step. Press{" "}
                  <kbd className="rounded bg-brand-light px-1 py-0.5 text-[10px] font-medium">Ctrl+Enter</kbd> to
                  design.
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
                      className="rounded-lg border border-brand-pale bg-brand-light/40 px-2.5 py-1.5 text-xs text-ink transition hover:border-brand/40 hover:bg-brand-light disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Context files */}
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setShowContext(!showContext)}
                  className="flex items-center gap-1 self-start text-[11px] font-semibold uppercase tracking-wide text-muted transition hover:text-brand"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`h-3 w-3 transition ${showContext ? "rotate-90" : ""}`}
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                  Context files
                  {activeFiles.length > 0 && (
                    <span className="ml-1 rounded-full bg-green-50 px-1.5 py-0.5 text-[9px] font-semibold normal-case text-green-600">
                      {activeFiles.length} active
                    </span>
                  )}
                </button>
                {showContext && <ContextFilesManager disabled={loading} />}
              </div>

              {/* Provider + API key */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    Provider
                  </span>
                  <div className="flex rounded-lg border border-brand-pale">
                    {(["gemini", "groq", "openrouter"] as const).map((p, i) => (
                      <button
                        key={p}
                        onClick={() => switchProvider(p)}
                        className={`px-3 py-1 text-xs font-medium transition ${
                          provider === p
                            ? "bg-brand-light text-brand-dark"
                            : "text-muted hover:text-ink"
                        } ${i === 0 ? "rounded-l-md" : "border-l border-brand-pale"} ${i === 2 ? "rounded-r-md" : ""}`}
                      >
                        {PROVIDER_META[p].label}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-muted">{meta.sub}</span>
                </div>

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
                        className="w-full rounded-lg border border-brand-pale bg-white px-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
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
            </>
          ) : (
            /* ───────────── COPY STEP ───────────── */
            <>
              {/* Design-ready summary */}
              <div className="flex flex-col gap-2 rounded-xl border border-brand-pale bg-canvas/50 p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-[11px] text-green-600">
                    ✓
                  </span>
                  <span className="text-xs font-semibold text-ink">
                    Design ready — {designTemplate?.name ?? "your email"}
                  </span>
                  <span className="text-[11px] text-muted">{blockChips.length} sections</span>
                </div>
                {blockChips.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {blockChips.map((c, i) => (
                      <span
                        key={`${c}_${i}`}
                        className="rounded-md bg-white px-1.5 py-0.5 text-[10px] text-muted ring-1 ring-brand-pale"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Copy brief */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-violet-500">
                  Copy direction <span className="font-normal normal-case text-muted">(optional)</span>
                </span>
                <textarea
                  ref={copyRef}
                  value={copyBrief}
                  onChange={(e) => setCopyBrief(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !loading) {
                      handleGenerateCopy();
                    }
                  }}
                  placeholder="e.g. Warm and personal, speak directly to the new hire, emphasise our culture of ownership, keep it under a 30-second read..."
                  rows={3}
                  disabled={loading}
                  className="w-full resize-none rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-muted/60 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-300/30 disabled:opacity-60"
                />
                <p className="text-[11px] text-muted">
                  Steer the tone, audience and key message. The copywriter rewrites every headline,
                  paragraph and button — your layout stays exactly the same.
                </p>
              </div>

              {/* Copy suggestions */}
              <div className="flex flex-wrap gap-1.5">
                {COPY_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setCopyBrief(s)}
                    disabled={loading}
                    className="rounded-lg border border-violet-200 bg-violet-50/50 px-2.5 py-1.5 text-xs text-violet-700 transition hover:border-violet-300 hover:bg-violet-50 disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {copyApplied && (
                <div className="flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50/60 px-4 py-3 text-sm text-violet-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-200 text-[11px] text-violet-700">
                    ✓
                  </span>
                  High-converting copy written and dropped into your design. Add it to the editor, or
                  regenerate for a different take.
                </div>
              )}
            </>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-brand-pale px-6 py-4">
          {quota ? (
            <span className={`text-[11px] font-medium ${quota.remaining <= 3 ? "text-amber-600" : "text-muted"}`}>
              {quota.remaining}/{quota.limit} generations left today
            </span>
          ) : (
            <span />
          )}

          {!isCopy ? (
            <div className="flex items-center gap-3">
              <button
                onClick={close}
                disabled={loading}
                className="rounded-lg border border-brand-pale px-4 py-2 text-sm font-medium text-muted transition hover:bg-brand-light disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateDesign}
                disabled={!prompt.trim() || loading}
                className="flex items-center gap-2 rounded-lg bg-brand-gradient px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Spinner />
                    Designing...
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
                    Generate design
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setStep("design");
                  setError(null);
                }}
                disabled={loading}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:text-ink disabled:opacity-50"
              >
                ← Back
              </button>
              {!copyApplied ? (
                <>
                  <button
                    onClick={() => addToEditor(designTemplate)}
                    disabled={loading}
                    className="rounded-lg border border-brand-pale px-4 py-2 text-sm font-medium text-muted transition hover:bg-brand-light disabled:opacity-50"
                  >
                    Use design as-is
                  </button>
                  <button
                    onClick={handleGenerateCopy}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        Writing...
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                          <path
                            d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Write the copy
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleGenerateCopy}
                    disabled={loading}
                    className="rounded-lg border border-violet-200 px-4 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-50 disabled:opacity-50"
                  >
                    {loading ? "Rewriting..." : "Regenerate"}
                  </button>
                  <button
                    onClick={() => addToEditor(finalTemplate)}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg bg-brand-gradient px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:opacity-90 disabled:opacity-50"
                  >
                    Add to editor
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepPill({
  index,
  label,
  state,
  accent,
}: {
  index: number;
  label: string;
  state: "todo" | "active" | "done";
  accent: "brand" | "violet";
}) {
  const activeCls =
    accent === "violet"
      ? "bg-violet-100 text-violet-700"
      : "bg-brand-light text-brand-dark";
  const dotCls =
    state === "done"
      ? "bg-green-500 text-white"
      : state === "active"
      ? accent === "violet"
        ? "bg-violet-500 text-white"
        : "bg-brand text-white"
      : "bg-brand-pale text-muted";

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        state === "active" ? activeCls : "text-muted"
      }`}
    >
      <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${dotCls}`}>
        {state === "done" ? "✓" : index}
      </span>
      {label}
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
