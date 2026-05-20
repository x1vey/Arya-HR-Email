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

const KEY = "arya.automations.v2";

let seq = 0;
export function newId(): string {
  seq += 1;
  return `wf_${Date.now().toString(36)}${seq}${Math.random().toString(36).slice(2, 6)}`;
}

/** Shipped examples so the dashboard isn't empty on first visit — a spread of
 *  realistic HR workflows covering every trigger type and varied step counts. */
function seed(): StoredAutomation[] {
  const now = Date.now();
  const hr = 3_600_000;
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
      updatedAt: now - 2 * hr
    },
    {
      id: "wf_seed_anniversary",
      name: "Work anniversary recognition",
      trigger: { kind: "date_field", field: "employee.hire_date", recurring: "annual" },
      steps: [
        { type: "send_email", templateId: "tpl_ori_recognition_v1", subject: "Celebrating your anniversary, {{employee.first_name}}!" }
      ],
      updatedAt: now - 5 * hr
    },
    {
      id: "wf_seed_anniv_heads_up",
      name: "Manager anniversary heads-up",
      trigger: { kind: "date_field", field: "employee.hire_date", recurring: "annual", offsetDays: 7 },
      steps: [
        { type: "send_email", templateId: "tpl_ori_announcement_v1", subject: "{{employee.first_name}}'s work anniversary is coming up" }
      ],
      updatedAt: now - 26 * hr
    },
    {
      id: "wf_seed_offboarding",
      name: "Offboarding farewell",
      trigger: { kind: "event", event: "employee_offboarded" },
      steps: [
        { type: "send_email", templateId: "tpl_ori_announcement_v1", subject: "Wishing you all the best, {{employee.first_name}}" }
      ],
      updatedAt: now - 30 * hr
    },
    {
      id: "wf_seed_newsletter",
      name: "Monthly company newsletter",
      trigger: { kind: "manual" },
      steps: [
        { type: "send_email", templateId: "tpl_newsletter_v1", subject: "{{company.name}} — this month at a glance" }
      ],
      updatedAt: now - 50 * hr
    },
    {
      id: "wf_seed_policy",
      name: "Policy update broadcast",
      trigger: { kind: "manual" },
      steps: [
        { type: "send_email", templateId: "tpl_ori_policy_update_v1", subject: "Important policy update at {{company.name}}" }
      ],
      updatedAt: now - 72 * hr
    },
    {
      id: "wf_seed_benefits",
      name: "Benefits open enrollment",
      trigger: { kind: "manual" },
      steps: [
        { type: "send_email", templateId: "tpl_ori_benefits_v1", subject: "Open enrollment is here, {{employee.first_name}}" },
        { type: "wait", duration: days(5) },
        { type: "send_email", templateId: "tpl_ori_benefits_v1", subject: "Reminder: benefits enrollment closes soon" }
      ],
      updatedAt: now - 96 * hr
    },
    {
      id: "wf_seed_all_hands",
      name: "All-hands reminder + recap",
      trigger: { kind: "manual" },
      steps: [
        { type: "send_email", templateId: "tpl_ori_all_hands_v1", subject: "All-hands this Friday — see you there" },
        { type: "wait", duration: days(1) },
        { type: "send_email", templateId: "tpl_ori_townhall_v1", subject: "Missed the all-hands? Here's the recap" }
      ],
      updatedAt: now - 120 * hr
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
