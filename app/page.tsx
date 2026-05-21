import Link from "next/link";

const FEATURES = [
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-6 w-6"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
    title: "AI generation",
    desc: "Describe what you need, pick a provider (Gemini, Groq, OpenRouter), and get a fully editable email template in seconds.",
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-6 w-6"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
    title: "15 pro templates",
    desc: "Hand-crafted, email-safe HTML templates — newsletters, onboarding, birthdays, policy updates, and more.",
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-6 w-6"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    title: "Import HTML",
    desc: "Paste any existing HTML email — the AI reverse-engineers it into editable blocks you can customize.",
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-6 w-6"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
    title: "No-code workflows",
    desc: "Visual trigger → wait → send pipelines. Date-based, event-based, or manual. Test-run with a virtual clock.",
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-6 w-6"><path d="M9 12l2 2 4-4"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    title: "Deliverability scoring",
    desc: "Real-time spam-word scanner, caps checker, structure analysis. Catch problems before you hit send.",
  },
  {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-6 w-6"><path d="M17 3a2.85 2.85 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`,
    title: "Inline editing",
    desc: "Double-click any text to edit in place. Merge tags like {{employee.name}} stay intact, never baked in.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#EDE7FF_0%,#F4F2FB_60%,#F4F2FB_100%)]" />
        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white/80 px-4 py-1.5 text-xs font-medium text-brand-dark backdrop-blur">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-gradient text-[10px] font-bold text-white">A</span>
            Arya Email Studio
          </div>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-6xl">
            Email that builds itself.<br />
            <span className="bg-brand-gradient bg-clip-text text-transparent">Workflows that run themselves.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            AI-powered email builder for HR teams. Describe what you need, get a
            ready-to-edit template, set up automated sends — no code, no design skills,
            no deliverability guesswork.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/editor"
              className="group inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:shadow-xl hover:shadow-brand/30"
            >
              Open the editor
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 transition group-hover:translate-x-0.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/automations"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-ink shadow-sm transition hover:border-brand/40 hover:shadow-md"
            >
              Build an automation
            </Link>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-200/80 bg-white p-6 transition hover:border-brand/30 hover:shadow-panel"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand transition group-hover:bg-brand group-hover:text-white [&_svg]:h-5 [&_svg]:w-5"
                dangerouslySetInnerHTML={{ __html: f.icon }}
              />
              <h3 className="mt-4 text-sm font-semibold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap strip */}
      <section className="border-t border-slate-200/80 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-muted">Coming next</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {[
              "Gmail / Microsoft OAuth",
              "SMTP delivery",
              "Data-source connectors",
              "Workflow scheduler",
              "Domain verification (DKIM/SPF)",
              "Multi-tenant workspaces",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-medium text-slate-500"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
