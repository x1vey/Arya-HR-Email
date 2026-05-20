import { days, type Step, type Trigger } from "./types";

/**
 * Client-side persistence for the workflow builder. There's no backend yet,
 * so automations live in localStorage — enough to create, edit, and manage
 * multiple workflows that survive reloads. When a real API lands, only this
 * module changes; the builder/list components talk to these functions.
 */
export interface StoredAutomation {
  id: string;
  name: string;
  trigger: Trigger;
  steps: Step[];
  updatedAt: number;
}

const KEY = "arya.automations.v1";

let seq = 0;
export function newId(): string {
  seq += 1;
  return `wf_${Date.now().toString(36)}${seq}${Math.random().toString(36).slice(2, 6)}`;
}

/** Shipped examples so the dashboard isn't empty on first visit. */
function seed(): StoredAutomation[] {
  const now = Date.now();
  return [
    {
      id: "wf_seed_onboarding",
      name: "New-hire onboarding",
      trigger: { kind: "event", event: "employee_hired" },
      steps: [
        { type: "send_email", templateId: "tpl_onboarding_day1_v1", subject: "Welcome to {{company.name}}, {{employee.first_name}}!" },
        { type: "wait", duration: days(3) },
        { type: "send_email", templateId: "tpl_onboarding_day1_v1", subject: "{{employee.first_name}}, how is week 1 going?" }
      ],
      updatedAt: now
    },
    {
      id: "wf_seed_birthday",
      name: "Employee birthday",
      trigger: { kind: "date_field", field: "employee.birthday", recurring: "annual" },
      steps: [
        { type: "send_email", templateId: "tpl_birthday_v1", subject: "Happy birthday, {{employee.first_name}}! 🎉" }
      ],
      updatedAt: now - 1000
    }
  ];
}

export function loadAutomations(): StoredAutomation[] {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const initial = seed();
      persistAutomations(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as StoredAutomation[];
    return Array.isArray(parsed) ? parsed : seed();
  } catch {
    return seed();
  }
}

export function persistAutomations(list: StoredAutomation[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // localStorage unavailable (private mode / quota) — non-fatal for the POC.
  }
}

export function createAutomation(): StoredAutomation {
  return {
    id: newId(),
    name: "Untitled automation",
    trigger: { kind: "manual" },
    steps: [],
    updatedAt: Date.now()
  };
}

export function upsertAutomation(
  list: StoredAutomation[],
  automation: StoredAutomation
): StoredAutomation[] {
  const stamped = { ...automation, updatedAt: Date.now() };
  const idx = list.findIndex((a) => a.id === automation.id);
  if (idx === -1) return [stamped, ...list];
  const next = [...list];
  next[idx] = stamped;
  return next;
}

export function deleteAutomation(list: StoredAutomation[], id: string): StoredAutomation[] {
  return list.filter((a) => a.id !== id);
}

export function duplicateAutomation(
  list: StoredAutomation[],
  id: string
): { list: StoredAutomation[]; created: StoredAutomation | null } {
  const orig = list.find((a) => a.id === id);
  if (!orig) return { list, created: null };
  const copy: StoredAutomation = {
    ...(JSON.parse(JSON.stringify(orig)) as StoredAutomation),
    id: newId(),
    name: `${orig.name} (copy)`,
    updatedAt: Date.now()
  };
  return { list: [copy, ...list], created: copy };
}
