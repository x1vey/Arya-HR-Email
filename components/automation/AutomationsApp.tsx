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
    setAutomations(loadAutomations());
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
