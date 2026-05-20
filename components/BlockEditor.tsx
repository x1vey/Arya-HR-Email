"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import type { Block, Template, VariableDef } from "@/lib/blocks/types";
import { TEMPLATE_LIBRARY, getTemplateById } from "@/lib/templates";
import { renderTemplate, cloneTemplate } from "@/lib/blocks/render";
import type { PaletteItem } from "@/lib/blocks/palette";
import { BlockList } from "./BlockList";
import { PropertyPanel } from "./PropertyPanel";
import { PreviewPane, type BlockAction } from "./PreviewPane";
import { VariablesPanel } from "./VariablesPanel";
import { ElementsPanel } from "./ElementsPanel";
import { TemplateGallery } from "./TemplateGallery";

type Tab = "templates" | "elements" | "layers" | "data";

export function BlockEditor() {
  const [template, setTemplate] = useState<Template>(() => cloneTemplate(TEMPLATE_LIBRARY[0]));
  const [variableValues, setVariableValues] = useState<Record<string, string>>(() =>
    buildInitialVariables(TEMPLATE_LIBRARY[0].variables)
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    () => TEMPLATE_LIBRARY[0].blocks[0]?.id ?? null
  );
  const [showFinalHtml, setShowFinalHtml] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("elements");

  const selectedBlock = useMemo(
    () => template.blocks.find((b) => b.id === selectedBlockId) ?? null,
    [template.blocks, selectedBlockId]
  );

  /** Convert the flat key→value record into the nested scope expected by
   *  the renderer (e.g., { "employee.first_name": "Priya" } →
   *  { employee: { first_name: "Priya" } }). */
  const variableScope = useMemo(() => {
    const scope: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(variableValues)) {
      setPath(scope, key, value);
    }
    return scope;
  }, [variableValues]);

  const switchTemplate = useCallback((id: string) => {
    const t = getTemplateById(id);
    if (!t) return;
    setTemplate(cloneTemplate(t));
    setVariableValues(buildInitialVariables(t.variables));
    setSelectedBlockId(t.blocks[0]?.id ?? null);
  }, []);

  const reorderBlocks = useCallback((newBlocks: Block[]) => {
    setTemplate((t) => ({ ...t, blocks: newBlocks }));
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setTemplate((t) => ({ ...t, blocks: t.blocks.filter((b) => b.id !== id) }));
    setSelectedBlockId((cur) => (cur === id ? null : cur));
  }, []);

  /** Insert a fresh block from the element palette, just after the current
   *  selection (or before a trailing locked footer when nothing is selected). */
  const addBlock = useCallback(
    (item: PaletteItem) => {
      const nb = item.make();
      setTemplate((t) => {
        const blocks = [...t.blocks];
        const selIdx = blocks.findIndex((b) => b.id === selectedBlockId);
        if (selIdx !== -1) {
          blocks.splice(selIdx + 1, 0, nb);
        } else if (blocks.length && blocks[blocks.length - 1].locked) {
          blocks.splice(blocks.length - 1, 0, nb);
        } else {
          blocks.push(nb);
        }
        return { ...t, blocks };
      });
      setSelectedBlockId(nb.id);
    },
    [selectedBlockId]
  );

  const duplicateBlock = useCallback((id: string) => {
    setTemplate((t) => {
      const idx = t.blocks.findIndex((b) => b.id === id);
      if (idx === -1) return t;
      const orig = t.blocks[idx];
      const copy: Block = {
        ...(JSON.parse(JSON.stringify(orig)) as Block),
        id: freshId(orig.type),
        locked: false
      };
      const blocks = [...t.blocks];
      blocks.splice(idx + 1, 0, copy);
      return { ...t, blocks };
    });
  }, []);

  const moveBlock = useCallback((id: string, dir: "up" | "down") => {
    setTemplate((t) => {
      const idx = t.blocks.findIndex((b) => b.id === id);
      const ni = dir === "up" ? idx - 1 : idx + 1;
      if (idx === -1 || ni < 0 || ni >= t.blocks.length) return t;
      const blocks = [...t.blocks];
      [blocks[idx], blocks[ni]] = [blocks[ni], blocks[idx]];
      return { ...t, blocks };
    });
  }, []);

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
      setTemplate((t) => ({
        ...t,
        blocks: t.blocks.map((b) =>
          b.id === blockId ? { ...b, props: { ...b.props, [propKey]: value } } : b
        )
      }));
    },
    []
  );

  const updateVariable = useCallback((key: string, value: string) => {
    setVariableValues((cur) => ({ ...cur, [key]: value }));
  }, []);

  const handleMockSend = async () => {
    const finalHtml = renderTemplate(template, variableScope);
    const res = await fetch("/api/send-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template_id: template.id,
        subject: `Preview: ${template.name}`,
        to: "demo@example.com",
        html: finalHtml
      })
    });
    const data = await res.json();
    alert(
      `Mock send response:\n\n` +
        `provider: ${data.provider}\n` +
        `message_id: ${data.message_id}\n` +
        `daily_quota_remaining: ${data.daily_quota_remaining}\n\n` +
        `(Final HTML logged to server console.)`
    );
  };

  return (
    <div className="flex h-screen flex-col bg-canvas">
      {/* Top toolbar */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-sm font-bold text-white">
            A
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-ink">Arya</div>
            <div className="text-[11px] text-muted">Email Studio</div>
          </div>
          <span className="ml-2 rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-semibold text-brand-dark">
            {template.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/automations"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-brand"
          >
            Automations →
          </Link>
          <button
            onClick={() => setShowFinalHtml(true)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300"
          >
            View HTML
          </button>
          <button
            onClick={handleMockSend}
            className="rounded-lg bg-brand-gradient px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Send test
          </button>
        </div>
      </header>

      {/* Main layout: icon rail · panel · canvas · properties */}
      <div className="flex flex-1 overflow-hidden">
        <IconRail active={activeTab} onChange={setActiveTab} />

        {/* Active tab panel */}
        <aside className="w-[300px] shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-4">
          {activeTab === "templates" && (
            <TemplateGallery
              templates={TEMPLATE_LIBRARY}
              activeId={template.id}
              onSwitch={switchTemplate}
            />
          )}
          {activeTab === "elements" && <ElementsPanel onAdd={addBlock} />}
          {activeTab === "layers" && (
            <BlockList
              blocks={template.blocks}
              selectedId={selectedBlockId}
              onSelect={setSelectedBlockId}
              onReorder={reorderBlocks}
              onDelete={deleteBlock}
            />
          )}
          {activeTab === "data" && (
            <VariablesPanel
              variables={template.variables}
              values={variableValues}
              onChange={updateVariable}
            />
          )}
        </aside>

        {/* Center: live canvas */}
        <main className="flex-1 overflow-hidden">
          <PreviewPane
            template={template}
            variables={variableScope}
            selectedBlockId={selectedBlockId}
            onSelectBlock={setSelectedBlockId}
            onAction={handleCanvasAction}
          />
        </main>

        {/* Right: property panel */}
        <aside className="w-[320px] shrink-0 overflow-y-auto border-l border-slate-200 bg-white p-4">
          <PropertyPanel block={selectedBlock} onChange={updateProp} />
        </aside>
      </div>

      {showFinalHtml && (
        <FinalHtmlModal
          html={renderTemplate(template, variableScope)}
          onClose={() => setShowFinalHtml(false)}
        />
      )}
    </div>
  );
}

const RAIL_TABS: { tab: Tab; label: string; icon: string }[] = [
  {
    tab: "templates",
    label: "Templates",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`
  },
  {
    tab: "elements",
    label: "Elements",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="7" r="4"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><path d="M3 16l4 5 4-5z"/><rect x="13" y="14" width="8" height="7" rx="1.5"/></svg>`
  },
  {
    tab: "layers",
    label: "Layers",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>`
  },
  {
    tab: "data",
    label: "Data",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>`
  }
];

function IconRail({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="flex w-[76px] shrink-0 flex-col items-center gap-1 bg-rail py-3">
      {RAIL_TABS.map(({ tab, label, icon }) => {
        const on = tab === active;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`flex w-[60px] flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium transition ${
              on
                ? "bg-white/10 text-white"
                : "text-white/55 hover:bg-white/5 hover:text-white/90"
            }`}
          >
            <span
              className="[&_svg]:h-5 [&_svg]:w-5"
              dangerouslySetInnerHTML={{ __html: icon }}
            />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

function FinalHtmlModal({ html, onClose }: { html: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-xl2 bg-white shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h3 className="font-semibold text-ink">Final HTML</h3>
            <p className="text-xs text-muted">This is what gets handed to the SMTP transport.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
        <pre className="flex-1 overflow-auto bg-slate-50 p-4 text-xs leading-relaxed text-slate-800">
          {html}
        </pre>
      </div>
    </div>
  );
}

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
    if (!(key in cur) || typeof cur[key] !== "object" || cur[key] === null) {
      cur[key] = {};
    }
    cur = cur[key] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}
