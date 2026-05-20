import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Arya — POC
          </p>
          <h1 className="text-4xl font-bold text-ink">HR Email Studio</h1>
          <p className="text-base leading-relaxed text-slate-600">
            A Canva-style email builder plus a no-code automation builder. Designers ship
            beautiful HTML, HRs customize it in a drag-and-drop editor constrained to that
            design, and visual workflows (trigger → wait → send) fill in employee data and
            deliver on schedule.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-ink">What this POC shows</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>
              <strong>15 real templates</strong> reverse-engineered from raw HTML —
              table-based email-safe newsletters, modern card designs, long-form letters,
              and ten HR originals. Each preserves its own visual language while exposing
              the same block-editing model.
            </li>
            <li>
              <strong>Canva-style editor</strong>: double-click text to edit it in place
              (merge tags preserved), drag elements onto the canvas, a visual template
              gallery, a floating move/duplicate/delete toolbar, undo/redo, and keyboard
              shortcuts (delete, duplicate, move, copy-paste).
            </li>
            <li>
              <strong>No-code workflows</strong>: a dashboard to create and manage multiple
              automations, each a visual builder (trigger → wait → send) backed by an engine
              with date/event triggers, a scheduler, and a pluggable mailer. "Test run"
              fast-forwards waits to preview the whole sequence.
            </li>
            <li>
              <strong>Variable substitution</strong>: <code>{`{{employee.first_name}}`}</code>{" "}
              etc. resolve live in both the editor preview and the workflow test run.
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-ink">Not in this POC (next phases)</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Google / Microsoft OAuth and real SMTP/API delivery (mailer is mocked)</li>
            <li>Data-source connectors (Sheets, Postgres, HRIS) — Data panel is sample-only</li>
            <li>
              Workflow persistence + always-on scheduler (engine runs in-memory; needs a DB
              and cron to drive it in production)
            </li>
            <li>Auth, multi-tenant workspaces, billing</li>
            <li>Automated HTML→block parser (currently a manual step)</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Open the editor →
          </Link>
          <Link
            href="/automations"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-ink hover:border-brand/50"
          >
            Build an automation →
          </Link>
        </div>
      </div>
    </main>
  );
}
