"use client";

import { useMemo, useState, useCallback } from "react";
import type { Block, Template, VariableDef } from "@/lib/blocks/types";
import { TEMPLATE_LIBRARY, getTemplateById } from "@/lib/templates";
import { renderTemplate, cloneTemplate } from "@/lib/blocks/render";
import { BlockList } from "./BlockList";
import { PropertyPanel } from "./PropertyPanel";
import { PreviewPane } from "./PreviewPane";
import { VariablesPanel } from "./VariablesPanel";
import { TemplateSwitcher } from "./TemplateSwitcher";

export function BlockEditor() {
  const [template, setTemplate] = useState<Template>(() => cloneTemplate(TEMPLATE_LIBRARY[0]));
  const [variableValues, setVariableValues] = useState<Record<string, string>>(() =>
    buildInitialVariables(TEMPLATE_LIBRARY[0].variables)
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    () => TEMPLATE_LIBRARY[0].blocks[0]?.id ?? null
  );
  const [showFinalHtml, setShowFinalHtml] = useState(false);

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

  const handleShowFinalHtml = () => setShowFinalHtml(true);

  return (
    <div className="flex h-screen flex-col bg-canvas">
      {/* Top toolbar */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="font-semibold text-ink">Arya · Email Builder</div>
          <span className="text-xs text-muted">POC</span>
        </div>
        <TemplateSwitcher
          templates={TEMPLATE_LIBRARY}
          activeId={template.id}
          onSwitch={switchTemplate}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleShowFinalHtml}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-slate-300"
          >
            View final HTML
          </button>
          <button
            onClick={handleMockSend}
            className="rounded-md bg-ink px-3 py-1.5 text-sm text-white hover:bg-slate-700"
          >
            Send test (mock)
          </button>
        </div>
      </header>

      {/* Main 3-column layout */}
      <div className="grid flex-1 grid-cols-[280px_1fr_320px] overflow-hidden">
        {/* Left: block list + variables */}
        <aside className="flex flex-col gap-6 overflow-y-auto border-r border-slate-200 bg-white p-4">
          <BlockList
            blocks={template.blocks}
            selectedId={selectedBlockId}
            onSelect={setSelectedBlockId}
            onReorder={reorderBlocks}
            onDelete={deleteBlock}
          />
          <hr className="border-slate-200" />
          <VariablesPanel
            variables={template.variables}
            values={variableValues}
            onChange={updateVariable}
          />
        </aside>

        {/* Center: live preview */}
        <main className="overflow-hidden">
          <PreviewPane
            template={template}
            variables={variableScope}
            selectedBlockId={selectedBlockId}
            onSelectBlock={setSelectedBlockId}
          />
        </main>

        {/* Right: property panel */}
        <aside className="overflow-y-auto border-l border-slate-200 bg-white p-4">
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

function FinalHtmlModal({ html, onClose }: { html: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-xl"
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
