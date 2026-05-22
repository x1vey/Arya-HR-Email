"use client";

import { useEffect, useMemo, useReducer, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Block, Template, VariableDef, EmailSettings } from "@/lib/blocks/types";
import { DEFAULT_EMAIL_SETTINGS } from "@/lib/blocks/types";
import { TEMPLATE_LIBRARY, getTemplateById } from "@/lib/templates";
import { renderTemplate, cloneTemplate } from "@/lib/blocks/render";
import type { PaletteItem, LayoutPreset } from "@/lib/blocks/palette";
import { checkSpam, type SpamResult } from "@/lib/email/spam-checker";
import { htmlToPlainText } from "@/lib/email/plain-text";
import { PropertyPanel } from "./PropertyPanel";
import { PreviewPane, type BlockAction, type CanvasKey } from "./PreviewPane";
import { ElementsPanel } from "./ElementsPanel";
import { TemplateGallery } from "./TemplateGallery";
import { DataSourcePanel } from "./DataSourcePanel";
import { AiGenerateModal } from "./AiGenerateModal";
import { ImportHtmlModal } from "./ImportHtmlModal";

type Tab = "build" | "templates";

// ── template history (undo/redo) ──────────────────────────────────────────────

interface HistoryState {
  present: Template;
  past: Template[];
  future: Template[];
  coalesceKey: string | null;
}

type HistoryAction =
  | { type: "reset"; template: Template }
  | { type: "mutate"; fn: (t: Template) => Template; coalesceKey?: string }
  | { type: "undo" }
  | { type: "redo" };

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case "reset":
      return { present: action.template, past: [], future: [], coalesceKey: null };
    case "mutate": {
      const next = action.fn(state.present);
      if (next === state.present) return state;
      const coalesce = !!action.coalesceKey && action.coalesceKey === state.coalesceKey;
      return {
        present: next,
        past: coalesce ? state.past : [...state.past, state.present].slice(-100),
        future: [],
        coalesceKey: action.coalesceKey ?? null,
      };
    }
    case "undo": {
      if (state.past.length === 0) return state;
      const prev = state.past[state.past.length - 1];
      return { present: prev, past: state.past.slice(0, -1), future: [state.present, ...state.future], coalesceKey: null };
    }
    case "redo": {
      if (state.future.length === 0) return state;
      const nxt = state.future[0];
      return { present: nxt, past: [...state.past, state.present], future: state.future.slice(1), coalesceKey: null };
    }
    default:
      return state;
  }
}

export function BlockEditor() {
  const router = useRouter();
  const [history, dispatch] = useReducer(historyReducer, undefined, () => ({
    present: cloneTemplate(TEMPLATE_LIBRARY[0]),
    past: [],
    future: [],
    coalesceKey: null,
  }));
  const template = history.present;

  const [variableValues, setVariableValues] = useState<Record<string, string>>(() =>
    buildInitialVariables(TEMPLATE_LIBRARY[0].variables)
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    () => TEMPLATE_LIBRARY[0].blocks[0]?.id ?? null
  );
  const [showFinalHtml, setShowFinalHtml] = useState(false);
  const [showPlainText, setShowPlainText] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("build");
  const [draggingItem, setDraggingItem] = useState<PaletteItem | null>(null);
  const [clipboard, setClipboard] = useState<Block | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({ ...DEFAULT_EMAIL_SETTINGS });

  const selectedRef = useRef(selectedBlockId);
  const presentRef = useRef(template);
  const clipboardRef = useRef<Block | null>(null);
  const draggingRef = useRef<PaletteItem | null>(null);
  useEffect(() => void (selectedRef.current = selectedBlockId), [selectedBlockId]);
  useEffect(() => void (presentRef.current = template), [template]);
  useEffect(() => void (clipboardRef.current = clipboard), [clipboard]);

  const selectedBlock = useMemo(
    () => template.blocks.find((b) => b.id === selectedBlockId) ?? null,
    [template.blocks, selectedBlockId]
  );

  const variableScope = useMemo(() => {
    const scope: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(variableValues)) setPath(scope, key, value);
    return scope;
  }, [variableValues]);

  const renderedHtml = useMemo(
    () => renderTemplate(template, variableScope),
    [template, variableScope]
  );

  // ── spam checker (debounced) ──
  const [spamResult, setSpamResult] = useState<SpamResult | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      const result = checkSpam(renderedHtml, {
        subject: emailSettings.subject,
        hasUnsubscribe: !!emailSettings.unsubscribe_url,
        hasPlainText: false,
      });
      setSpamResult(result);
    }, 500);
    return () => clearTimeout(timer);
  }, [renderedHtml, emailSettings.subject, emailSettings.unsubscribe_url]);

  const mutate = useCallback(
    (fn: (t: Template) => Template, coalesceKey?: string) => dispatch({ type: "mutate", fn, coalesceKey }),
    []
  );
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const switchTemplate = useCallback((id: string) => {
    const t = getTemplateById(id);
    if (!t) return;
    dispatch({ type: "reset", template: cloneTemplate(t) });
    setVariableValues(buildInitialVariables(t.variables));
    setSelectedBlockId(t.blocks[0]?.id ?? null);
    if (t.settings) setEmailSettings({ ...t.settings });
  }, []);

  const loadAiTemplate = useCallback(
    (t: Template) => {
      dispatch({ type: "reset", template: cloneTemplate(t) });
      setVariableValues(buildInitialVariables(t.variables));
      setSelectedBlockId(t.blocks[0]?.id ?? null);
      if (t.settings) setEmailSettings({ ...t.settings });
      showToast(`Loaded "${t.name}"`);
    },
    [showToast]
  );

  const deleteBlock = useCallback(
    (id: string) => {
      const blk = presentRef.current.blocks.find((b) => b.id === id);
      if (blk?.locked) {
        showToast("This block is locked and can't be deleted");
        return;
      }
      mutate((t) => ({ ...t, blocks: t.blocks.filter((b) => b.id !== id) }));
      setSelectedBlockId((cur) => (cur === id ? null : cur));
      showToast("Block deleted");
    },
    [mutate, showToast]
  );

  const insertBlockAt = useCallback(
    (item: PaletteItem, index: number) => {
      const nb = item.make();
      mutate((t) => {
        const blocks = [...t.blocks];
        blocks.splice(Math.max(0, Math.min(index, blocks.length)), 0, nb);
        return { ...t, blocks };
      });
      setSelectedBlockId(nb.id);
    },
    [mutate]
  );

  const clickInsertIndex = useCallback(() => {
    const blocks = presentRef.current.blocks;
    const selIdx = blocks.findIndex((b) => b.id === selectedRef.current);
    if (selIdx !== -1) return selIdx + 1;
    if (blocks.length && blocks[blocks.length - 1].locked) return blocks.length - 1;
    return blocks.length;
  }, []);

  const addBlock = useCallback(
    (item: PaletteItem) => insertBlockAt(item, clickInsertIndex()),
    [insertBlockAt, clickInsertIndex]
  );

  const addLayout = useCallback(
    (preset: LayoutPreset) => {
      const newBlocks = preset.make();
      if (newBlocks.length === 0) return;
      const at = clickInsertIndex();
      mutate((t) => {
        const blocks = [...t.blocks];
        blocks.splice(Math.max(0, Math.min(at, blocks.length)), 0, ...newBlocks);
        return { ...t, blocks };
      });
      setSelectedBlockId(newBlocks[0].id);
    },
    [mutate, clickInsertIndex]
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      let newId: string | null = null;
      mutate((t) => {
        const idx = t.blocks.findIndex((b) => b.id === id);
        if (idx === -1) return t;
        const copy: Block = {
          ...(JSON.parse(JSON.stringify(t.blocks[idx])) as Block),
          id: (newId = freshId(t.blocks[idx].type)),
          locked: false,
        };
        const blocks = [...t.blocks];
        blocks.splice(idx + 1, 0, copy);
        return { ...t, blocks };
      });
      if (newId) setSelectedBlockId(newId);
    },
    [mutate]
  );

  const moveBlock = useCallback(
    (id: string, dir: "up" | "down") => {
      mutate((t) => {
        const idx = t.blocks.findIndex((b) => b.id === id);
        const ni = dir === "up" ? idx - 1 : idx + 1;
        if (idx === -1 || ni < 0 || ni >= t.blocks.length) return t;
        const blocks = [...t.blocks];
        [blocks[idx], blocks[ni]] = [blocks[ni], blocks[idx]];
        return { ...t, blocks };
      });
    },
    [mutate]
  );

  const reorderBlock = useCallback(
    (fromId: string, targetId: string | null, position: "before" | "after") => {
      mutate((t) => {
        const fromIdx = t.blocks.findIndex((b) => b.id === fromId);
        if (fromIdx === -1) return t;
        const block = t.blocks[fromIdx];
        const without = t.blocks.filter((b) => b.id !== fromId);
        let insertAt = without.length;
        if (targetId) {
          const tIdx = without.findIndex((b) => b.id === targetId);
          if (tIdx !== -1) insertAt = position === "before" ? tIdx : tIdx + 1;
        }
        const blocks = [...without];
        blocks.splice(insertAt, 0, block);
        return { ...t, blocks };
      });
    },
    [mutate]
  );

  const pasteAfterSelected = useCallback(() => {
    const src = clipboardRef.current;
    if (!src) return;
    const copy: Block = {
      ...(JSON.parse(JSON.stringify(src)) as Block),
      id: freshId(src.type),
      locked: false,
    };
    mutate((t) => {
      const blocks = [...t.blocks];
      const idx = blocks.findIndex((b) => b.id === selectedRef.current);
      blocks.splice(idx === -1 ? blocks.length : idx + 1, 0, copy);
      return { ...t, blocks };
    });
    setSelectedBlockId(copy.id);
  }, [mutate]);

  const handleCanvasAction = useCallback(
    (action: BlockAction, id: string) => {
      if (action === "delete") deleteBlock(id);
      else if (action === "duplicate") duplicateBlock(id);
      else if (action === "up") moveBlock(id, "up");
      else if (action === "down") moveBlock(id, "down");
    },
    [deleteBlock, duplicateBlock, moveBlock]
  );

  const updateProp = useCallback(
    (blockId: string, propKey: string, value: string) => {
      mutate(
        (t) => ({
          ...t,
          blocks: t.blocks.map((b) =>
            b.id === blockId ? { ...b, props: { ...b.props, [propKey]: value } } : b
          ),
        }),
        `prop:${blockId}:${propKey}`
      );
    },
    [mutate]
  );

  const updateVariable = useCallback((key: string, value: string) => {
    setVariableValues((cur) => ({ ...cur, [key]: value }));
  }, []);

  const updateSetting = useCallback((key: keyof EmailSettings, value: string) => {
    setEmailSettings((cur) => ({ ...cur, [key]: value }));
  }, []);

  // ── keyboard shortcuts ──
  const runShortcut = useCallback(
    (k: CanvasKey): boolean => {
      const mod = k.metaKey || k.ctrlKey;
      const key = k.key.toLowerCase();
      if (mod && key === "z") { k.shiftKey ? redo() : undo(); return true; }
      if (mod && key === "y") { redo(); return true; }
      const id = selectedRef.current;
      const blk = id ? presentRef.current.blocks.find((b) => b.id === id) ?? null : null;
      if (mod && key === "d") { if (id) duplicateBlock(id); return true; }
      if (mod && key === "c") { if (blk) setClipboard(blk); return true; }
      if (mod && key === "v") { pasteAfterSelected(); return true; }
      if (k.key === "Delete" || k.key === "Backspace") {
        if (!id) return false;
        if (!blk?.locked) deleteBlock(id);
        return true;
      }
      if (k.key === "ArrowUp") { if (!id) return false; moveBlock(id, "up"); return true; }
      if (k.key === "ArrowDown") { if (!id) return false; moveBlock(id, "down"); return true; }
      if (k.key === "Escape") { setSelectedBlockId(null); return true; }
      return false;
    },
    [undo, redo, duplicateBlock, deleteBlock, moveBlock, pasteAfterSelected]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (runShortcut({ key: e.key, metaKey: e.metaKey, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey })) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [runShortcut]);

  // ── drag-to-add ──
  const onPaletteDrop = useCallback(
    (targetId: string | null, position: "before" | "after") => {
      const item = draggingRef.current;
      draggingRef.current = null;
      setDraggingItem(null);
      if (!item) return;
      const blocks = presentRef.current.blocks;
      let at = blocks.length;
      if (targetId) {
        const idx = blocks.findIndex((b) => b.id === targetId);
        if (idx !== -1) at = position === "before" ? idx : idx + 1;
      } else if (blocks.length && blocks[blocks.length - 1].locked) {
        at = blocks.length - 1;
      }
      insertBlockAt(item, at);
    },
    [insertBlockAt]
  );

  const startDrag = useCallback((item: PaletteItem) => { draggingRef.current = item; setDraggingItem(item); }, []);
  const endDrag = useCallback(() => { draggingRef.current = null; setDraggingItem(null); }, []);

  const handleMockSend = async () => {
    const res = await fetch("/api/send-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template_id: template.id,
        subject: emailSettings.subject || `Preview: ${template.name}`,
        to: "demo@example.com",
        html: renderedHtml,
      }),
    });
    const data = await res.json();
    showToast(`Test sent — quota: ${data.daily_quota_remaining} remaining`);
  };

  const saveTemplate = useCallback(
    (name: string) => {
      const saved = { ...template, name, id: `saved_${Date.now()}`, settings: emailSettings };
      const key = "arya_saved_templates";
      const existing: Template[] = JSON.parse(localStorage.getItem(key) ?? "[]");
      existing.push(saved);
      localStorage.setItem(key, JSON.stringify(existing));
      showToast(`Saved "${name}"`);
    },
    [template, emailSettings, showToast]
  );

  /** Save current template to localStorage and navigate to automations builder
   *  with this template pre-selected. */
  const useInAutomation = useCallback(() => {
    const id = `tpl_editor_${Date.now()}`;
    const saved = { ...template, id, settings: emailSettings };
    const key = "arya_saved_templates";
    const existing: Template[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    existing.push(saved);
    localStorage.setItem(key, JSON.stringify(existing));
    localStorage.setItem("arya_automation_template", id);
    showToast("Template saved — opening automation builder");
    setTimeout(() => router.push("/automations"), 400);
  }, [template, emailSettings, showToast, router]);

  return (
    <div className="flex h-screen flex-col bg-canvas">
      {/* ── Top toolbar ── */}
      <header className="flex items-center justify-between border-b border-brand-pale bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 rounded-lg px-1 py-1 transition hover:bg-brand-light">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-gradient text-xs font-bold text-white">A</div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-ink">Arya</div>
            </div>
          </Link>
          <div className="mx-1 h-5 w-px bg-brand-pale" />
          <span className="rounded bg-brand-light px-2 py-0.5 text-[11px] font-medium text-brand-dark">
            {template.name}
          </span>
          {spamResult && (
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                spamResult.rating === "good"
                  ? "bg-green-50 text-green-700"
                  : spamResult.rating === "warning"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-red-50 text-red-700"
              }`}
              title={`Deliverability: ${100 - spamResult.score}/100`}
            >
              {100 - spamResult.score}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 rounded-lg border border-brand-pale px-1">
            <HeaderIcon label="Undo" disabled={history.past.length === 0} onClick={undo}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="M3 10h13a4 4 0 010 8H7" /><path d="M3 10l4-4M3 10l4 4" />
              </svg>
            </HeaderIcon>
            <HeaderIcon label="Redo" disabled={history.future.length === 0} onClick={redo}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="M21 10H8a4 4 0 000 8h9" /><path d="M21 10l-4-4M21 10l-4 4" />
              </svg>
            </HeaderIcon>
          </div>

          <button onClick={() => setShowImportModal(true)} className="rounded-md px-2.5 py-1.5 text-xs font-medium text-muted transition hover:bg-brand-light hover:text-brand">
            Import
          </button>
          <button onClick={() => setShowPlainText(true)} className="rounded-md px-2.5 py-1.5 text-xs font-medium text-muted transition hover:bg-brand-light hover:text-brand">
            Plain text
          </button>
          <button onClick={() => setShowFinalHtml(true)} className="rounded-md px-2.5 py-1.5 text-xs font-medium text-muted transition hover:bg-brand-light hover:text-brand">
            HTML
          </button>

          <div className="mx-0.5 h-5 w-px bg-brand-pale" />

          <button onClick={useInAutomation} className="flex items-center gap-1.5 rounded-md border border-brand-pale px-2.5 py-1.5 text-xs font-medium text-ink transition hover:border-brand/40 hover:bg-brand-light">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Automate
          </button>

          <button onClick={handleMockSend} className="rounded-md bg-brand-gradient px-3 py-1.5 text-xs font-semibold text-white shadow-soft transition hover:opacity-90">
            Send test
          </button>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left rail + panel */}
        <div className="flex shrink-0">
          <nav className="flex w-14 flex-col items-center gap-1 border-r border-brand-pale bg-rail py-3">
            <RailBtn active={activeTab === "build"} onClick={() => setActiveTab("build")} label="Build"
              icon={`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="7" r="4"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><path d="M3 16l4 5 4-5z"/><rect x="13" y="14" width="8" height="7" rx="1.5"/></svg>`}
            />
            <RailBtn active={activeTab === "templates"} onClick={() => setActiveTab("templates")} label="Gallery"
              icon={`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`}
            />
          </nav>

          <aside className="w-[300px] overflow-y-auto border-r border-brand-pale bg-white">
            {activeTab === "templates" ? (
              <div className="p-4">
                <TemplateGallery
                  templates={TEMPLATE_LIBRARY}
                  activeId={template.id}
                  onSwitch={switchTemplate}
                  onOpenAi={() => setShowAiModal(true)}
                />
              </div>
            ) : (
              <div className="flex flex-col">
                {/* AI generate button — prominent at top */}
                <div className="border-b border-brand-pale p-3">
                  <button
                    onClick={() => setShowAiModal(true)}
                    className="flex w-full items-center gap-2.5 rounded-xl bg-brand-gradient p-3 text-left text-white transition hover:opacity-90"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div>
                      <div className="text-sm font-semibold">Generate with AI</div>
                      <div className="text-[11px] text-white/70">Describe your email</div>
                    </div>
                  </button>
                </div>

                {/* Elements */}
                <div className="border-b border-brand-pale p-4">
                  <ElementsPanel
                    onAdd={addBlock}
                    onAddLayout={addLayout}
                    onDragStart={startDrag}
                    onDragEnd={endDrag}
                  />
                </div>

                {/* Data sources */}
                <div className="p-4">
                  <DataSourcePanel
                    variables={template.variables}
                    variableValues={variableValues}
                    onVariableChange={updateVariable}
                  />
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Canvas */}
        <main className="flex-1 overflow-hidden">
          <PreviewPane
            template={template}
            variables={variableScope}
            selectedBlockId={selectedBlockId}
            onSelectBlock={setSelectedBlockId}
            onAction={handleCanvasAction}
            onPaletteDrop={onPaletteDrop}
            onBlockReorder={reorderBlock}
            onCanvasKey={runShortcut}
            onEditProp={updateProp}
            dropActive={!!draggingItem}
          />
        </main>

        {/* Right panel — properties */}
        <aside className="w-[300px] shrink-0 border-l border-brand-pale bg-white">
          <PropertyPanel
            block={selectedBlock}
            onChange={updateProp}
            variables={template.variables}
            variableValues={variableValues}
            onVariableChange={updateVariable}
            onSaveTemplate={saveTemplate}
            templateName={template.name}
            emailSettings={emailSettings}
            onSettingsChange={updateSetting}
            spamResult={spamResult}
          />
        </aside>
      </div>

      {/* Modals */}
      <AiGenerateModal open={showAiModal} onClose={() => setShowAiModal(false)} onGenerated={loadAiTemplate} />
      <ImportHtmlModal open={showImportModal} onClose={() => setShowImportModal(false)} onImported={loadAiTemplate} />

      {showFinalHtml && <CodeModal title="Final HTML" subtitle="What gets handed to the SMTP transport." code={renderedHtml} onClose={() => setShowFinalHtml(false)} />}
      {showPlainText && <CodeModal title="Plain text version" subtitle="Include this as the text/plain MIME part." code={htmlToPlainText(renderedHtml)} onClose={() => setShowPlainText(false)} />}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-[fadeInUp_0.2s_ease-out] rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-white shadow-float">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ── Rail button ── */

function RailBtn({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-11 flex-col items-center gap-0.5 rounded-md py-1.5 text-[9px] font-medium transition ${
        active ? "bg-white/15 text-white" : "text-white/45 hover:bg-white/8 hover:text-white/75"
      }`}
    >
      <span className="[&_svg]:h-4 [&_svg]:w-4" dangerouslySetInnerHTML={{ __html: icon }} />
      {label}
    </button>
  );
}

/* ── Header icon button ── */

function HeaderIcon({ children, label, onClick, disabled }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-7 w-7 items-center justify-center rounded-md transition ${
        disabled ? "cursor-not-allowed text-brand-pale" : "text-muted hover:bg-brand-light hover:text-brand"
      }`}
    >
      {children}
    </button>
  );
}

/* ── Code modal (HTML / Plain text) ── */

function CodeModal({ title, subtitle, code, onClose }: { title: string; subtitle: string; code: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6" onClick={onClose}>
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-xl2 bg-white shadow-float" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-brand-pale px-4 py-3">
          <div>
            <h3 className="font-semibold text-ink">{title}</h3>
            <p className="text-xs text-muted">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="rounded-md border border-brand-pale px-3 py-1 text-sm text-ink transition hover:bg-brand-light">
              {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={onClose} className="rounded-md px-2 py-1 text-sm text-muted hover:bg-brand-light">Close</button>
          </div>
        </div>
        <pre className="flex-1 overflow-auto bg-canvas p-4 text-xs leading-relaxed text-ink whitespace-pre-wrap">{code}</pre>
      </div>
    </div>
  );
}

/* ── Utilities ── */

function buildInitialVariables(vars: VariableDef[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const v of vars) out[v.key] = v.sample;
  return out;
}

let dupCounter = 0;
function freshId(type: string): string {
  dupCounter += 1;
  return `blk_${type}_dup${dupCounter}_${Math.random().toString(36).slice(2, 7)}`;
}

function setPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(".");
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!(key in cur) || typeof cur[key] !== "object" || cur[key] === null) cur[key] = {};
    cur = cur[key] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}
