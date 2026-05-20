/**
 * Automation pipelines — a small, GoHighLevel-inspired workflow model.
 *
 * A Pipeline = one Trigger + an ordered list of Steps. When the trigger fires
 * for a Contact, that contact is "enrolled" and walks through the steps over
 * time: `wait` steps delay the next step, `send_email` steps render a template
 * and hand it to the Mailer.
 *
 *   Trigger ──> [ send_email ] ──> [ wait 3 days ] ──> [ send_email ] ──> done
 *
 * The four primitives requested map cleanly onto this model:
 *   - Trigger   -> Trigger (below)
 *   - Wait time -> Step { type: "wait" }
 *   - Scheduler -> AutomationEngine.runUntilIdle / tick (engine.ts)
 *   - Mailer    -> Mailer (mailer.ts)
 */

/** A recipient. `data` is the nested scope used for {{variable}} substitution
 *  AND for date-trigger matching, e.g.
 *  { employee: { first_name: "Arjun", birthday: "1995-05-20" },
 *    company: { name: "Arya" }, manager: { first_name: "Sara" } } */
export interface Contact {
  id: string;
  email: string;
  data: Record<string, unknown>;
}

/** Milliseconds. Use the helpers below to build readable durations. */
export type Duration = number;

export type Trigger =
  /** Enrolled by hand (engine.enroll). */
  | { kind: "manual" }
  /** Fires when engine.fireEvent("<event>", contacts) is called. */
  | { kind: "event"; event: string }
  /**
   * Fires when a date field on the contact matches "today" (per the engine's
   * clock), evaluated via engine.evaluateDateTriggers (run this daily in prod).
   *
   *   field      dot-path to an ISO date ("1995-05-20") or "MM-DD" on the contact
   *   recurring  "annual" matches month+day every year (birthdays, anniversaries);
   *              "once" matches the exact calendar date.
   *   offsetDays fire this many days BEFORE the date (0 = on the day,
   *              3 = three days before). Lets you do "send 3 days before renewal".
   */
  | {
      kind: "date_field";
      field: string;
      recurring: "annual" | "once";
      offsetDays?: number;
    };

export type Step =
  | { type: "wait"; duration: Duration; label?: string }
  | {
      /** Render `templateId` with the contact's data and send it. `subject`
       *  may itself contain {{variables}}. */
      type: "send_email";
      templateId: string;
      subject: string;
      label?: string;
    };

export interface Pipeline {
  id: string;
  name: string;
  trigger: Trigger;
  steps: Step[];
}

export type EnrollmentStatus = "active" | "completed" | "failed";

export interface HistoryEntry {
  stepIndex: number;
  type: Step["type"] | "enrolled";
  at: number;
  detail: string;
}

export interface Enrollment {
  id: string;
  pipelineId: string;
  contact: Contact;
  /** Index of the NEXT step to execute. */
  stepIndex: number;
  /** Epoch ms; the step runs once the clock reaches this. */
  nextRunAt: number;
  status: EnrollmentStatus;
  history: HistoryEntry[];
}

// ── Duration helpers ────────────────────────────────────────────────────────

export const seconds = (n: number): Duration => n * 1000;
export const minutes = (n: number): Duration => n * 60_000;
export const hours = (n: number): Duration => n * 3_600_000;
export const days = (n: number): Duration => n * 86_400_000;

/** "3d 4h", "45m", "30s" — for readable logs. */
export function formatDuration(ms: Duration): string {
  if (ms <= 0) return "0s";
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return [d && `${d}d`, h && `${h}h`, m && `${m}m`, s && `${s}s`]
    .filter(Boolean)
    .join(" ");
}
