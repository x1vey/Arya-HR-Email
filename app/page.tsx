import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Arya — POC
          </p>
          <h1 className="text-4xl font-bold text-ink">HR Email Builder</h1>
          <p className="text-base leading-relaxed text-slate-600">
            Reverse-engineered HTML templates → editable blocks → live preview → final email.
            The core idea proves: designers ship beautiful HTML, HRs get a drag-and-drop
            builder constrained to that design, automation fills in employee data.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-ink">What this POC shows</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>
              <strong>Five real templates</strong> reverse-engineered from raw HTML —
              spanning table-based email-safe (Newsletter), modern card designs
              (Card-Style Reminder), long-form letters (Long-form Letter), and HR
              originals (Birthday, Onboarding Day 1). Each preserves its own visual
              language while exposing the same block-editing model.
            </li>
            <li>
              <strong>Block-aware editor</strong>: drag-reorder, click-to-select in the
              preview (works on tables AND divs via a generic <code>data-block-id</code>
              hook), edit text/colors/links/images in the side panel.
            </li>
            <li>
              <strong>Variable substitution</strong>: <code>{`{{employee.first_name}}`}</code>{" "}
              etc. resolve live as you edit the sample data row.
            </li>
            <li>
              <strong>Final HTML export</strong>: see exactly what would hand off to the
              Gmail / Microsoft Graph transport.
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-ink">Not in this POC (next phases)</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Google / Microsoft OAuth and real SMTP/API delivery</li>
            <li>Data-source connectors (Sheets, Postgres, HRIS)</li>
            <li>Workflow engine (cron + date-relative triggers, sequences)</li>
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
