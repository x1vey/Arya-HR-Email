"use client";

import Link from "next/link";
import { formatDuration, type Step, type Trigger } from "@/lib/automation/types";
import type { StoredAutomation } from "@/lib/automation/store";
import { TRIGGER_PRESETS } from "./StepInspector";

interface AutomationsListProps {
  automations: StoredAutomation[];
  onCreate: () => void;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

/** Dashboard of all saved automations — the entry point for managing more
 *  than one workflow. */
export function AutomationsList({
  automations,
  onCreate,
  onOpen,
  onDuplicate,
  onDelete
}: AutomationsListProps) {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="flex items-center justify-between border-b border-brand-pale bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-sm font-bold text-white">
            A
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-ink">Arya</div>
            <div className="text-[11px] text-muted">Automations</div>
          </div>
        </div>
        <Link
          href="/editor"
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-brand-light hover:text-brand"
        >
          ← Email Studio
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Your automations</h1>
            <p className="mt-1 text-sm text-muted">
              {automations.length} workflow{automations.length === 1 ? "" : "s"} · trigger → wait → send, on autopilot.
            </p>
          </div>
          <button
            onClick={onCreate}
            className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            + New automation
          </button>
        </div>

        {automations.length === 0 ? (
          <EmptyState onCreate={onCreate} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {automations.map((a) => (
              <AutomationCard
                key={a.id}
                automation={a}
                onOpen={() => onOpen(a.id)}
                onDuplicate={() => onDuplicate(a.id)}
                onDelete={() => onDelete(a.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function AutomationCard({
  automation,
  onOpen,
  onDuplicate,
  onDelete
}: {
  automation: StoredAutomation;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const sends = automation.steps.filter((s) => s.type === "send_email").length;
  return (
    <div className="group flex flex-col rounded-xl border border-brand-pale bg-white p-4 shadow-soft transition hover:border-brand/50">
      <button onClick={onOpen} className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-warm/10 text-base text-accent-warm">
            ⚡
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-ink">{automation.name}</div>
            <div className="truncate text-xs text-muted">{triggerLabel(automation.trigger)}</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {automation.steps.length === 0 ? (
            <span className="rounded-full bg-brand-light px-2 py-0.5 text-[11px] text-muted">No steps yet</span>
          ) : (
            automation.steps.slice(0, 4).map((s, i) => (
              <span key={i} className="rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-medium text-brand-dark">
                {stepChip(s)}
              </span>
            ))
          )}
          {automation.steps.length > 4 && (
            <span className="rounded-full bg-brand-light px-2 py-0.5 text-[11px] text-muted">
              +{automation.steps.length - 4}
            </span>
          )}
        </div>
      </button>

      <div className="mt-4 flex items-center justify-between border-t border-brand-pale pt-3">
        <span className="text-[11px] text-muted">
          {sends} email{sends === 1 ? "" : "s"} · updated {timeAgo(automation.updatedAt)}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onOpen}
            className="rounded-md px-2 py-1 text-xs font-medium text-brand transition hover:bg-brand-light"
          >
            Open
          </button>
          <button
            onClick={onDuplicate}
            title="Duplicate"
            className="rounded-md px-2 py-1 text-xs text-muted transition hover:bg-brand-light"
          >
            Duplicate
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete "${automation.name}"?`)) onDelete();
            }}
            title="Delete"
            className="rounded-md px-2 py-1 text-xs text-muted transition hover:bg-red-50 hover:text-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-pale bg-white py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-xl text-brand">⚡</span>
      <h2 className="mt-3 text-base font-semibold text-ink">No automations yet</h2>
      <p className="mt-1 max-w-xs text-sm text-muted">
        Create your first workflow to send emails automatically on a trigger and schedule.
      </p>
      <button
        onClick={onCreate}
        className="mt-4 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
      >
        + New automation
      </button>
    </div>
  );
}

function triggerLabel(t: Trigger): string {
  return TRIGGER_PRESETS.find((p) => p.match(t))?.label ?? "Custom trigger";
}

function stepChip(s: Step): string {
  return s.type === "wait" ? `Wait ${formatDuration(s.duration)}` : "Send email";
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
