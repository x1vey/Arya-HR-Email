/**
 * Runnable demo of the automation engine.
 *
 *   npm run automate
 *
 * It defines two pipelines (a multi-step onboarding sequence and a birthday
 * greeting), enrolls a handful of contacts via different trigger types, then
 * runs the scheduler on a VirtualClock so multi-day waits resolve instantly.
 * Every send is logged, and a per-contact timeline is printed at the end.
 *
 * Swap VirtualClock -> RealClock and ConsoleMailer -> HttpMailer to drive real
 * timing through the POC's /api/send-test route.
 */
import { AutomationEngine, VirtualClock } from "@/lib/automation/engine";
import { ConsoleMailer } from "@/lib/automation/mailer";
import { days, type Contact, type Pipeline } from "@/lib/automation/types";

// ── Pipelines ─────────────────────────────────────────────────────────────────

const onboarding: Pipeline = {
  id: "pl_onboarding",
  name: "New-hire onboarding",
  trigger: { kind: "event", event: "employee_hired" },
  steps: [
    {
      type: "send_email",
      templateId: "tpl_onboarding_day1_v1",
      subject: "Welcome to {{company.name}}, {{employee.first_name}}! 👋",
      label: "Day 1 welcome"
    },
    { type: "wait", duration: days(3), label: "settle in" },
    {
      type: "send_email",
      templateId: "tpl_onboarding_day1_v1",
      subject: "{{employee.first_name}}, how is week 1 going?",
      label: "Day 3 check-in"
    }
  ]
};

const birthday: Pipeline = {
  id: "pl_birthday",
  name: "Employee birthday",
  trigger: { kind: "date_field", field: "employee.birthday", recurring: "annual" },
  steps: [
    {
      type: "send_email",
      templateId: "tpl_birthday_v1",
      subject: "Happy birthday, {{employee.first_name}}! 🎉",
      label: "Birthday greeting"
    }
  ]
};

// ── Contacts ──────────────────────────────────────────────────────────────────

const arjun: Contact = {
  id: "emp_arjun",
  email: "arjun@arya.hr",
  data: {
    employee: { first_name: "Arjun", birthday: "1996-09-12" },
    company: { name: "Arya" },
    manager: { first_name: "Sara" }
  }
};

const priya: Contact = {
  id: "emp_priya",
  email: "priya@arya.hr",
  data: {
    employee: { first_name: "Priya", birthday: "1994-05-20" }, // birthday == demo "today"
    company: { name: "Arya" },
    sender: { name: "Riya from People Ops" }
  }
};

const dev: Contact = {
  id: "emp_dev",
  email: "dev@arya.hr",
  data: {
    employee: { first_name: "Dev", birthday: "1990-12-01" }, // not today → no birthday enroll
    company: { name: "Arya" }
  }
};

// ── Run ───────────────────────────────────────────────────────────────────────

async function main() {
  const clock = new VirtualClock(new Date("2026-05-20T00:00:00Z"));
  const mailer = new ConsoleMailer(() => clock.now());
  const engine = new AutomationEngine({ mailer, clock });

  engine.register(onboarding).register(birthday);

  console.log("\n=== Arya Automations — demo run (virtual clock @ 2026-05-20) ===\n");

  // Trigger 1 — event: two people were hired today.
  engine.fireEvent("employee_hired", [arjun, dev]);

  // Trigger 2 — date field: enroll anyone whose birthday is "today".
  engine.evaluateDateTriggers([arjun, priya, dev]);

  console.log("\n--- sends (fast-forwarding through waits) ---");
  await engine.runUntilIdle();

  printTimelines(engine);
}

function printTimelines(engine: AutomationEngine) {
  console.log("\n=== Timelines ===");
  for (const e of engine.getEnrollments()) {
    console.log(`\n• ${e.contact.email}  [${e.status}]`);
    for (const h of e.history) {
      console.log(`    ${fmt(h.at)}  ${h.detail}`);
    }
  }
  console.log("");
}

function fmt(ts: number): string {
  return new Date(ts).toISOString().replace("T", " ").slice(0, 16);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
