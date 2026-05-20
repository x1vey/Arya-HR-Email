import { renderTemplate } from "@/lib/blocks/render";
import { substitute } from "@/lib/blocks/substitute";
import { getTemplateById } from "@/lib/templates";
import type { Mailer } from "./mailer";
import {
  formatDuration,
  type Contact,
  type Enrollment,
  type Pipeline,
  type Trigger
} from "./types";

/**
 * A clock the scheduler advances through. Two implementations:
 *   - RealClock    waits real wall-clock time (production / staging)
 *   - VirtualClock jumps instantly to the next due moment (demo / tests),
 *                  so a 7-day sequence runs in milliseconds.
 *
 * Because the scheduler only ever asks the clock to `advanceTo` the next due
 * step, the same engine code drives both real and simulated time.
 */
export interface Clock {
  now(): number;
  advanceTo(ts: number): Promise<void>;
}

export class RealClock implements Clock {
  now(): number {
    return Date.now();
  }
  async advanceTo(ts: number): Promise<void> {
    const delta = ts - this.now();
    if (delta > 0) await new Promise((r) => setTimeout(r, delta));
  }
}

export class VirtualClock implements Clock {
  private t: number;
  constructor(start: number | Date = Date.now()) {
    this.t = start instanceof Date ? start.getTime() : start;
  }
  now(): number {
    return this.t;
  }
  async advanceTo(ts: number): Promise<void> {
    if (ts > this.t) this.t = ts;
  }
}

let seq = 0;
const uid = (p: string) => `${p}_${Date.now().toString(36)}${(seq += 1)}`;

export interface EngineOptions {
  mailer: Mailer;
  clock?: Clock;
  /** Swap for a no-op in tests, or a structured logger in prod. */
  log?: (msg: string) => void;
}

export class AutomationEngine {
  private readonly pipelines = new Map<string, Pipeline>();
  private readonly enrollments: Enrollment[] = [];
  private readonly mailer: Mailer;
  readonly clock: Clock;
  private readonly log: (msg: string) => void;

  constructor(opts: EngineOptions) {
    this.mailer = opts.mailer;
    this.clock = opts.clock ?? new RealClock();
    this.log = opts.log ?? ((m) => console.log(m));
  }

  register(pipeline: Pipeline): this {
    this.pipelines.set(pipeline.id, pipeline);
    return this;
  }

  getEnrollments(): readonly Enrollment[] {
    return this.enrollments;
  }

  // ── Triggers ──────────────────────────────────────────────────────────────

  /** Fire an `event` trigger: enroll every contact into pipelines listening
   *  for that event. */
  fireEvent(event: string, contacts: Contact[]): void {
    for (const p of this.pipelines.values()) {
      if (p.trigger.kind === "event" && p.trigger.event === event) {
        for (const c of contacts) this.enroll(p.id, c);
      }
    }
  }

  /** Manually enroll contacts into a specific pipeline (manual trigger). */
  enrollManual(pipelineId: string, contacts: Contact[]): void {
    for (const c of contacts) this.enroll(pipelineId, c);
  }

  /** Evaluate every `date_field` trigger against "today" (per the clock) and
   *  enroll matching contacts. In production, run this once a day from cron. */
  evaluateDateTriggers(contacts: Contact[]): void {
    const now = this.clock.now();
    for (const p of this.pipelines.values()) {
      if (p.trigger.kind !== "date_field") continue;
      for (const c of contacts) {
        if (dateTriggerMatches(p.trigger, c.data, now)) this.enroll(p.id, c);
      }
    }
  }

  // ── Enrollment ──────────────────────────────────────────────────────────────

  /** Enroll a contact at step 0, due immediately. Skips if the contact already
   *  has an active enrollment in this pipeline (no double-entry). */
  enroll(pipelineId: string, contact: Contact): Enrollment | null {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) throw new Error(`Unknown pipeline: ${pipelineId}`);

    const already = this.enrollments.some(
      (e) => e.pipelineId === pipelineId && e.contact.id === contact.id && e.status === "active"
    );
    if (already) return null;

    const now = this.clock.now();
    const enrollment: Enrollment = {
      id: uid("enr"),
      pipelineId,
      contact,
      stepIndex: 0,
      nextRunAt: now,
      status: "active",
      history: [
        { stepIndex: -1, type: "enrolled", at: now, detail: `enrolled in "${pipeline.name}"` }
      ]
    };
    this.enrollments.push(enrollment);
    this.log(`+ ${contact.email} enrolled in "${pipeline.name}"`);
    return enrollment;
  }

  // ── Scheduler ──────────────────────────────────────────────────────────────

  /** Process every active enrollment whose step is due now. Does NOT advance
   *  the clock — call this from a cron tick (e.g. every minute) in production. */
  async tick(): Promise<void> {
    const now = this.clock.now();
    const due = this.enrollments.filter((e) => e.status === "active" && e.nextRunAt <= now);
    for (const e of due) await this.runDueSteps(e);
  }

  /**
   * Run all enrollments to completion, advancing the clock to each next due
   * step. With a VirtualClock this fast-forwards through waits instantly; with
   * a RealClock it actually sleeps. Guarded against runaway loops.
   */
  async runUntilIdle(maxIterations = 100_000): Promise<void> {
    let i = 0;
    for (;;) {
      const active = this.enrollments.filter((e) => e.status === "active");
      if (active.length === 0) return;

      const now = this.clock.now();
      const due = active.filter((e) => e.nextRunAt <= now);

      if (due.length === 0) {
        const next = Math.min(...active.map((e) => e.nextRunAt));
        await this.clock.advanceTo(next);
      } else {
        for (const e of due) await this.runDueSteps(e);
      }

      if ((i += 1) > maxIterations) {
        throw new Error("runUntilIdle exceeded max iterations — possible zero-duration loop");
      }
    }
  }

  /** Execute consecutive ready steps for one enrollment (send steps chain
   *  immediately; a wait step schedules the next run and yields). */
  private async runDueSteps(e: Enrollment): Promise<void> {
    const pipeline = this.pipelines.get(e.pipelineId);
    if (!pipeline) {
      e.status = "failed";
      return;
    }

    while (e.status === "active" && e.nextRunAt <= this.clock.now()) {
      const step = pipeline.steps[e.stepIndex];
      if (!step) {
        e.status = "completed";
        this.log(`✓ ${e.contact.email} completed "${pipeline.name}"`);
        return;
      }

      if (step.type === "wait") {
        const at = this.clock.now();
        e.nextRunAt = at + step.duration;
        e.history.push({
          stepIndex: e.stepIndex,
          type: "wait",
          at,
          detail: `wait ${formatDuration(step.duration)}${step.label ? ` (${step.label})` : ""}`
        });
        e.stepIndex += 1;
        return; // yield until the wait elapses
      }

      // send_email
      try {
        const tpl = getTemplateById(step.templateId);
        if (!tpl) throw new Error(`Unknown template: ${step.templateId}`);
        const html = renderTemplate(tpl, e.contact.data);
        const subject = substitute(step.subject, e.contact.data);
        const res = await this.mailer.send({
          to: e.contact.email,
          subject,
          html,
          templateId: tpl.id,
          contact: e.contact
        });
        e.history.push({
          stepIndex: e.stepIndex,
          type: "send_email",
          at: this.clock.now(),
          detail: `sent "${subject}" via ${res.provider} (${res.messageId})`
        });
      } catch (err) {
        e.status = "failed";
        e.history.push({
          stepIndex: e.stepIndex,
          type: "send_email",
          at: this.clock.now(),
          detail: `FAILED: ${(err as Error).message}`
        });
        this.log(`✗ ${e.contact.email} failed at step ${e.stepIndex}: ${(err as Error).message}`);
        return;
      }
      e.stepIndex += 1;
    }

    if (e.stepIndex >= pipeline.steps.length && e.status === "active") {
      e.status = "completed";
      this.log(`✓ ${e.contact.email} completed "${pipeline.name}"`);
    }
  }
}

// ── Date trigger matching ─────────────────────────────────────────────────────

function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * True when the contact's date field falls on the trigger's target day.
 * The target day is `today + offsetDays` (so offsetDays=3 fires three days
 * before the date). "annual" compares month+day only; "once" compares the
 * full calendar date. All comparisons are in UTC to avoid timezone drift.
 */
function dateTriggerMatches(
  trigger: Extract<Trigger, { kind: "date_field" }>,
  data: Record<string, unknown>,
  now: number
): boolean {
  const raw = getPath(data, trigger.field);
  if (typeof raw !== "string" || raw.trim() === "") return false;

  const parsed = parseMonthDay(raw);
  if (!parsed) return false;

  const target = new Date(now);
  target.setUTCDate(target.getUTCDate() + (trigger.offsetDays ?? 0));

  if (trigger.recurring === "annual") {
    return target.getUTCMonth() + 1 === parsed.month && target.getUTCDate() === parsed.day;
  }
  // "once": require a full date on the contact and match Y-M-D exactly
  return (
    parsed.year !== undefined &&
    target.getUTCFullYear() === parsed.year &&
    target.getUTCMonth() + 1 === parsed.month &&
    target.getUTCDate() === parsed.day
  );
}

/** Accepts "YYYY-MM-DD" or "MM-DD". */
function parseMonthDay(s: string): { year?: number; month: number; day: number } | null {
  const full = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (full) return { year: Number(full[1]), month: Number(full[2]), day: Number(full[3]) };
  const md = /^(\d{2})-(\d{2})$/.exec(s.trim());
  if (md) return { month: Number(md[1]), day: Number(md[2]) };
  return null;
}
