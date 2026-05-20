"use client";

import { TEMPLATE_LIBRARY } from "@/lib/templates";
import { days, hours, minutes, type Duration, type Step, type Trigger } from "@/lib/automation/types";

export type NodeSelection = { kind: "trigger" } | { kind: "step"; index: number };

interface StepInspectorProps {
  selection: NodeSelection | null;
  trigger: Trigger;
  steps: Step[];
  onTriggerChange: (t: Trigger) => void;
  onStepChange: (index: number, s: Step) => void;
  onDeleteStep: (index: number) => void;
  onMoveStep: (index: number, dir: "up" | "down") => void;
}

/** Friendly, no-code trigger presets. Selecting one sets the underlying
 *  Trigger object; the engine never sees these labels. */
export const TRIGGER_PRESETS: {
  id: string;
  label: string;
  make: () => Trigger;
  match: (t: Trigger) => boolean;
}[] = [
  {
    id: "hired",
    label: "When an employee is hired",
    make: () => ({ kind: "event", event: "employee_hired" }),
    match: (t) => t.kind === "event" && t.event === "employee_hired"
  },
  {
    id: "left",
    label: "When an employee leaves",
    make: () => ({ kind: "event", event: "employee_offboarded" }),
    match: (t) => t.kind === "event" && t.event === "employee_offboarded"
  },
  {
    id: "birthday",
    label: "On an employee's birthday",
    make: () => ({ kind: "date_field", field: "employee.birthday", recurring: "annual" }),
    match: (t) => t.kind === "date_field" && t.field === "employee.birthday"
  },
  {
    id: "anniversary",
    label: "On a work anniversary",
    make: () => ({ kind: "date_field", field: "employee.hire_date", recurring: "annual" }),
    match: (t) => t.kind === "date_field" && t.field === "employee.hire_date"
  },
  {
    id: "manual",
    label: "Manually enrolled",
    make: () => ({ kind: "manual" }),
    match: (t) => t.kind === "manual"
  }
];

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export function StepInspector({
  selection,
  trigger,
  steps,
  onTriggerChange,
  onStepChange,
  onDeleteStep,
  onMoveStep
}: StepInspectorProps) {
  if (!selection) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
            <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
          </svg>
        </div>
        <p className="text-sm leading-relaxed text-muted">
          Select the trigger or a step to set it up.
        </p>
      </div>
    );
  }

  if (selection.kind === "trigger") {
    return <TriggerEditor trigger={trigger} onChange={onTriggerChange} />;
  }

  const step = steps[selection.index];
  if (!step) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-brand">
            {step.type === "wait" ? "Wait" : "Send email"}
          </div>
          <h3 className="text-base font-semibold text-ink">Step {selection.index + 1}</h3>
        </div>
        <div className="flex items-center gap-1">
          <IconBtn
            label="Move up"
            disabled={selection.index === 0}
            onClick={() => onMoveStep(selection.index, "up")}
          >
            ↑
          </IconBtn>
          <IconBtn
            label="Move down"
            disabled={selection.index === steps.length - 1}
            onClick={() => onMoveStep(selection.index, "down")}
          >
            ↓
          </IconBtn>
          <IconBtn label="Delete" danger onClick={() => onDeleteStep(selection.index)}>
            ✕
          </IconBtn>
        </div>
      </div>

      {step.type === "wait" ? (
        <WaitEditor step={step} onChange={(s) => onStepChange(selection.index, s)} />
      ) : (
        <SendEditor step={step} onChange={(s) => onStepChange(selection.index, s)} />
      )}
    </div>
  );
}

function TriggerEditor({ trigger, onChange }: { trigger: Trigger; onChange: (t: Trigger) => void }) {
  const active = TRIGGER_PRESETS.find((p) => p.match(trigger)) ?? TRIGGER_PRESETS[0];
  const isDate = trigger.kind === "date_field";
  const offset = isDate ? trigger.offsetDays ?? 0 : 0;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-brand">Trigger</div>
        <h3 className="text-base font-semibold text-ink">When should this run?</h3>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-600">Start the workflow…</span>
        <select
          className={inputCls}
          value={active.id}
          onChange={(e) => {
            const preset = TRIGGER_PRESETS.find((p) => p.id === e.target.value);
            if (preset) onChange(preset.make());
          }}
        >
          {TRIGGER_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      {isDate && (
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">Timing</span>
          <select
            className={inputCls}
            value={String(offset)}
            onChange={(e) =>
              onChange({ ...(trigger as Extract<Trigger, { kind: "date_field" }>), offsetDays: Number(e.target.value) })
            }
          >
            <option value="0">On the day</option>
            <option value="1">1 day before</option>
            <option value="3">3 days before</option>
            <option value="7">1 week before</option>
          </select>
        </label>
      )}

      <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-muted">
        {triggerHelp(trigger)}
      </p>
    </div>
  );
}

function WaitEditor({ step, onChange }: { step: Extract<Step, { type: "wait" }>; onChange: (s: Step) => void }) {
  const { value, unit } = splitDuration(step.duration);
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-medium text-slate-600">Wait for</span>
      <div className="flex gap-2">
        <input
          type="number"
          min={1}
          className={`${inputCls} w-24`}
          value={value}
          onChange={(e) => onChange({ ...step, duration: toMs(Math.max(1, Number(e.target.value) || 1), unit) })}
        />
        <select
          className={inputCls}
          value={unit}
          onChange={(e) => onChange({ ...step, duration: toMs(value, e.target.value as Unit) })}
        >
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
          <option value="days">Days</option>
        </select>
      </div>
      <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-muted">
        Holds each contact here before moving to the next step.
      </p>
    </div>
  );
}

function SendEditor({
  step,
  onChange
}: {
  step: Extract<Step, { type: "send_email" }>;
  onChange: (s: Step) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-600">Template</span>
        <select
          className={inputCls}
          value={step.templateId}
          onChange={(e) => onChange({ ...step, templateId: e.target.value })}
        >
          {TEMPLATE_LIBRARY.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-600">Subject line</span>
        <input
          type="text"
          className={inputCls}
          value={step.subject}
          placeholder="Welcome, {{employee.first_name}}!"
          onChange={(e) => onChange({ ...step, subject: e.target.value })}
        />
        <span className="text-[11px] text-muted">
          Use {`{{employee.first_name}}`} and other fields — they fill in per recipient.
        </span>
      </label>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  danger
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded-md border text-sm transition ${
        disabled
          ? "cursor-not-allowed border-slate-100 text-slate-300"
          : danger
            ? "border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-500"
            : "border-slate-200 text-slate-600 hover:border-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

function triggerHelp(t: Trigger): string {
  if (t.kind === "event" && t.event === "employee_hired")
    return "Every newly-hired employee enters this workflow automatically.";
  if (t.kind === "event" && t.event === "employee_offboarded")
    return "Runs when an employee is marked as leaving.";
  if (t.kind === "date_field") {
    const when = !t.offsetDays ? "on the day" : `${t.offsetDays} day(s) before`;
    return `Checked daily — enrolls each employee ${when} their ${t.field.split(".").pop()?.replace("_", " ")}.`;
  }
  return "Add contacts to this workflow yourself, whenever you like.";
}

// ── duration <-> {value, unit} ────────────────────────────────────────────────

type Unit = "minutes" | "hours" | "days";

function splitDuration(ms: Duration): { value: number; unit: Unit } {
  if (ms % 86_400_000 === 0) return { value: ms / 86_400_000, unit: "days" };
  if (ms % 3_600_000 === 0) return { value: ms / 3_600_000, unit: "hours" };
  return { value: Math.max(1, Math.round(ms / 60_000)), unit: "minutes" };
}

function toMs(value: number, unit: Unit): Duration {
  if (unit === "days") return days(value);
  if (unit === "hours") return hours(value);
  return minutes(value);
}
