"use client";

import { useState } from "react";
import Link from "next/link";
import { TEMPLATE_LIBRARY, getTemplateById } from "@/lib/templates";
import { days, formatDuration, type Step, type Trigger } from "@/lib/automation/types";
import type { StoredAutomation } from "@/lib/automation/store";
import { StepInspector, TRIGGER_PRESETS, type NodeSelection } from "./StepInspector";
import { TestRunModal } from "./TestRunModal";

interface WorkflowBuilderProps {
  automation: StoredAutomation;
  onBack: () => void;
  onSave: (automation: StoredAutomation) => void;
}

export function WorkflowBuilder({ automation, onBack, onSave }: WorkflowBuilderProps) {
  const [name, setName] = useState(automation.name);
  const [trigger, setTrigger] = useState<Trigger>(automation.trigger);
  const [steps, setSteps] = useState<Step[]>(automation.steps);
  const [selection, setSelection] = useState<NodeSelection | null>({ kind: "trigger" });
  const [addMenuAt, setAddMenuAt] = useState<number | null>(null);
  const [showTest, setShowTest] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const addStep = (index: number, type: Step["type"]) => {
    const step: Step =
      type === "wait"
        ? { type: "wait", duration: days(1) }
        : { type: "send_email", templateId: TEMPLATE_LIBRARY[0].id, subject: "Hello {{employee.first_name}}" };
    setSteps((prev) => {
      const next = [...prev];
      next.splice(index, 0, step);
      return next;
    });
    setSelection({ kind: "step", index });
    setAddMenuAt(null);
  };

  const updateStep = (index: number, s: Step) =>
    setSteps((prev) => prev.map((x, i) => (i === index ? s : x)));

  const deleteStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
    setSelection(null);
  };

  const moveStep = (index: number, dir: "up" | "down") => {
    const ni = dir === "up" ? index - 1 : index + 1;
    if (ni < 0 || ni >= steps.length) return;
    setSteps((prev) => {
      const next = [...prev];
      [next[index], next[ni]] = [next[ni], next[index]];
      return next;
    });
    setSelection({ kind: "step", index: ni });
  };

  const save = () => {
    onSave({ ...automation, name, trigger, steps, updatedAt: Date.now() });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  };

  return (
    <div className="flex h-screen flex-col bg-canvas">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-brand-pale bg-white px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="rounded-lg px-2 py-1.5 text-sm font-medium text-muted transition hover:bg-brand-light hover:text-brand"
          >
            ← All automations
          </button>
          <span className="h-5 w-px bg-brand-pale" />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md px-2 py-1 text-sm font-semibold text-ink hover:bg-brand-light focus:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div className="flex items-center gap-2">
          {savedFlash && <span className="text-xs font-medium text-emerald-600">Saved ✓</span>}
          <button
            onClick={() => setShowTest(true)}
            className="rounded-lg border border-brand-pale bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:border-brand/40"
          >
            Test run
          </button>
          <button
            onClick={save}
            className="rounded-lg bg-brand-gradient px-4 py-1.5 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
          >
            Save
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* App rail (also nav between the two surfaces) */}
        <nav className="flex w-[76px] shrink-0 flex-col items-center gap-1 bg-rail py-3">
          <RailLink href="/editor" label="Email" icon="✉" />
          <RailLink href="/automations" label="Flows" icon="⚡" active />
        </nav>

        {/* Canvas */}
        <main className="flex-1 overflow-auto p-8" onClick={() => setAddMenuAt(null)}>
          <div className="mx-auto flex max-w-md flex-col items-stretch">
            {/* Trigger node */}
            <NodeCard
              selected={selection?.kind === "trigger"}
              onClick={() => setSelection({ kind: "trigger" })}
              accent="trigger"
              icon="⚡"
              kicker="Trigger"
              title={triggerLabel(trigger)}
              subtitle="Starts the workflow"
            />

            <AddSlot
              open={addMenuAt === 0}
              onToggle={(e) => {
                e.stopPropagation();
                setAddMenuAt((v) => (v === 0 ? null : 0));
              }}
              onAdd={(type) => addStep(0, type)}
            />

            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-stretch">
                <NodeCard
                  selected={selection?.kind === "step" && selection.index === i}
                  onClick={() => setSelection({ kind: "step", index: i })}
                  accent={step.type === "wait" ? "wait" : "send"}
                  icon={step.type === "wait" ? "⏱" : "✉"}
                  kicker={step.type === "wait" ? "Wait" : "Send email"}
                  title={stepTitle(step)}
                  subtitle={stepSubtitle(step)}
                />
                <AddSlot
                  open={addMenuAt === i + 1}
                  onToggle={(e) => {
                    e.stopPropagation();
                    setAddMenuAt((v) => (v === i + 1 ? null : i + 1));
                  }}
                  onAdd={(type) => addStep(i + 1, type)}
                />
              </div>
            ))}

            <div className="mt-1 self-center rounded-full bg-brand-light px-3 py-1 text-[11px] font-medium text-muted">
              End of workflow
            </div>
          </div>
        </main>

        {/* Inspector */}
        <aside className="w-[320px] shrink-0 overflow-y-auto border-l border-brand-pale bg-white p-4">
          <StepInspector
            selection={selection}
            trigger={trigger}
            steps={steps}
            onTriggerChange={setTrigger}
            onStepChange={updateStep}
            onDeleteStep={deleteStep}
            onMoveStep={moveStep}
          />
        </aside>
      </div>

      {showTest && (
        <TestRunModal name={name} trigger={trigger} steps={steps} onClose={() => setShowTest(false)} />
      )}
    </div>
  );
}

function RailLink({ href, label, icon, active }: { href: string; label: string; icon: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex w-[60px] flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium transition ${
        active ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white/90"
      }`}
    >
      <span className="text-lg leading-none">{icon}</span>
      {label}
    </Link>
  );
}

const ACCENTS = {
  trigger: "text-accent-warm bg-accent-warm/10",
  send: "text-brand bg-brand-light",
  wait: "text-muted bg-brand-light"
} as const;

function NodeCard({
  selected,
  onClick,
  accent,
  icon,
  kicker,
  title,
  subtitle
}: {
  selected: boolean;
  onClick: () => void;
  accent: keyof typeof ACCENTS;
  icon: string;
  kicker: string;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex items-center gap-3 rounded-xl border bg-white p-3 text-left shadow-soft transition ${
        selected ? "border-brand ring-2 ring-brand/20" : "border-brand-pale hover:border-brand/50"
      }`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${ACCENTS[accent]}`}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted">{kicker}</span>
        <span className="block truncate text-sm font-medium text-ink">{title}</span>
        <span className="block truncate text-xs text-muted">{subtitle}</span>
      </span>
    </button>
  );
}

function AddSlot({
  open,
  onToggle,
  onAdd
}: {
  open: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onAdd: (type: Step["type"]) => void;
}) {
  return (
    <div className="relative flex flex-col items-center">
      <span className="h-4 w-px bg-brand-pale" />
      <button
        onClick={onToggle}
        className={`flex h-6 w-6 items-center justify-center rounded-full border text-sm transition ${
          open ? "border-brand bg-brand text-white" : "border-brand-pale bg-white text-muted hover:border-brand hover:text-brand"
        }`}
        aria-label="Add step"
      >
        +
      </button>
      <span className="h-4 w-px bg-brand-pale" />
      {open && (
        <div
          className="absolute top-7 z-10 w-44 overflow-hidden rounded-xl border border-brand-pale bg-white shadow-float"
          onClick={(e) => e.stopPropagation()}
        >
          <AddOption icon="✉" label="Send email" onClick={() => onAdd("send_email")} />
          <AddOption icon="⏱" label="Wait" onClick={() => onAdd("wait")} />
        </div>
      )}
    </div>
  );
}

function AddOption({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink transition hover:bg-brand-light"
    >
      <span className="text-base">{icon}</span>
      {label}
    </button>
  );
}

// ── summaries ─────────────────────────────────────────────────────────────────

function triggerLabel(t: Trigger): string {
  return TRIGGER_PRESETS.find((p) => p.match(t))?.label ?? "Custom trigger";
}

function stepTitle(step: Step): string {
  if (step.type === "wait") return formatDuration(step.duration);
  return getTemplateById(step.templateId)?.name ?? step.templateId;
}

function stepSubtitle(step: Step): string {
  if (step.type === "wait") return "then continue";
  return step.subject;
}
