"use client";

import { useEffect, useState } from "react";
import { AutomationEngine, VirtualClock } from "@/lib/automation/engine";
import { CollectingMailer } from "@/lib/automation/mailer";
import type { Contact, HistoryEntry, Step, Trigger } from "@/lib/automation/types";
import { getTemplateById } from "@/lib/templates";

interface TestRunModalProps {
  name: string;
  trigger: Trigger;
  steps: Step[];
  onClose: () => void;
}

/**
 * Simulates a single sample contact walking through the workflow on a virtual
 * clock, so multi-day waits resolve instantly and the user sees the resulting
 * timeline. The sample contact's data is assembled from the variable samples
 * declared on whichever templates the workflow sends.
 */
export function TestRunModal({ name, trigger, steps, onClose }: TestRunModalProps) {
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const clock = new VirtualClock(new Date("2026-05-20T00:00:00Z"));
        const engine = new AutomationEngine({ mailer: new CollectingMailer(), clock, log: () => {} });
        const pipeline = { id: "preview", name, trigger, steps };
        engine.register(pipeline);
        engine.enroll("preview", buildSampleContact(steps));
        await engine.runUntilIdle();
        if (!cancelled) setHistory([...(engine.getEnrollments()[0]?.history ?? [])]);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [name, trigger, steps]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl2 bg-white shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <div>
            <h3 className="font-semibold text-ink">Test run · {name}</h3>
            <p className="text-xs text-muted">One sample contact, waits fast-forwarded.</p>
          </div>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!error && !history && <p className="text-sm text-muted">Running…</p>}
          {history && (
            <ol className="flex flex-col gap-3">
              {history.map((h, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${dotCls(h)}`}>
                      {dotIcon(h)}
                    </span>
                    {i < history.length - 1 && <span className="my-1 w-px flex-1 bg-slate-200" />}
                  </div>
                  <div className="pb-1">
                    <div className="text-sm text-ink">{h.detail}</div>
                    <div className="text-[11px] text-muted">{fmt(h.at)}</div>
                  </div>
                </li>
              ))}
              <li className="ml-[2px] flex items-center gap-3 text-sm font-medium text-emerald-600">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">✓</span>
                Workflow complete
              </li>
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

function dotCls(h: HistoryEntry): string {
  if (h.type === "send_email") return "bg-brand-light text-brand";
  if (h.type === "wait") return "bg-amber-100 text-amber-600";
  return "bg-slate-100 text-slate-500";
}
function dotIcon(h: HistoryEntry): string {
  if (h.type === "send_email") return "✉";
  if (h.type === "wait") return "⏱";
  return "★";
}
function fmt(ts: number): string {
  return new Date(ts).toISOString().replace("T", " ").slice(0, 16);
}

function buildSampleContact(steps: Step[]): Contact {
  const data: Record<string, unknown> = {};
  for (const s of steps) {
    if (s.type !== "send_email") continue;
    const tpl = getTemplateById(s.templateId);
    tpl?.variables.forEach((v) => setPath(data, v.key, v.sample));
  }
  // Ensure date-trigger fields exist so previews always have something to show.
  if (!getPath(data, "employee.birthday")) setPath(data, "employee.birthday", "1994-05-20");
  if (!getPath(data, "employee.hire_date")) setPath(data, "employee.hire_date", "2025-05-20");
  return { id: "sample", email: "sample@arya.hr", data };
}

function setPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(".");
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (typeof cur[key] !== "object" || cur[key] === null) cur[key] = {};
    cur = cur[key] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}
