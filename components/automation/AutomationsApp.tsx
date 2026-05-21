"use client";

import { useEffect, useState } from "react";
import {
  createAutomation,
  deleteAutomation,
  duplicateAutomation,
  loadAutomations,
  persistAutomations,
  upsertAutomation,
  type StoredAutomation
} from "@/lib/automation/store";
import { getTemplateById } from "@/lib/templates";
import { AutomationsList } from "./AutomationsList";
import { WorkflowBuilder } from "./WorkflowBuilder";

/**
 * Top-level automations surface. Holds the list of saved automations (loaded
 * from localStorage after mount to avoid SSR/hydration mismatch) and switches
 * between the dashboard and the per-automation builder.
 */
export function AutomationsApp() {
  const [automations, setAutomations] = useState<StoredAutomation[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const list = loadAutomations();

    // If the editor handed off a template via localStorage, auto-create an
    // automation with a "Send email" step pre-wired to that template.
    const handoff = localStorage.getItem("arya_automation_template");
    if (handoff) {
      localStorage.removeItem("arya_automation_template");
      const tpl = getTemplateById(handoff);
      const a = createAutomation();
      a.name = tpl ? `Send: ${tpl.name}` : "New automation";
      a.steps = [
        { type: "send_email", templateId: handoff, subject: "Hello {{employee.first_name}}" }
      ];
      const updated = [a, ...list];
      persistAutomations(updated);
      setAutomations(updated);
      setEditingId(a.id);
      return;
    }

    setAutomations(list);
  }, []);

  const commit = (list: StoredAutomation[]) => {
    setAutomations(list);
    persistAutomations(list);
  };

  if (!automations) {
    return <div className="flex h-screen items-center justify-center text-sm text-muted">Loading…</div>;
  }

  const editing = editingId ? automations.find((a) => a.id === editingId) ?? null : null;

  if (editing) {
    return (
      <WorkflowBuilder
        key={editing.id}
        automation={editing}
        onBack={() => setEditingId(null)}
        onSave={(updated) => commit(upsertAutomation(automations, updated))}
      />
    );
  }

  return (
    <AutomationsList
      automations={automations}
      onCreate={() => {
        const a = createAutomation();
        commit([a, ...automations]);
        setEditingId(a.id);
      }}
      onOpen={(id) => setEditingId(id)}
      onDuplicate={(id) => {
        const { list } = duplicateAutomation(automations, id);
        commit(list);
      }}
      onDelete={(id) => commit(deleteAutomation(automations, id))}
    />
  );
}
