# Arya — HR Email Studio

Proof of concept for two core ideas:

1. **Reverse-engineer hand-crafted HTML email templates into editable block trees**, then expose them in a Canva-style builder so HRs can customize without losing design integrity.
2. **Automate sends with no-code workflows** — a GoHighLevel-style pipeline of triggers, waits, and emails that fills in employee data per recipient.

## Run it

```bash
npm install
npm run dev          # app at http://localhost:3000
npm run automate     # run the automation engine demo in the terminal
```

- `/editor` — the Canva-style email builder
- `/automations` — the no-code workflow builder

## What's in this POC

- **Soft Sage design system** — earthy green palette (`#4F6B4A` brand, `#F4F6ED` canvas, `#212A20` ink), consistent across editor, automations, landing page, and all modals
- **15 templates** in `lib/templates/`, each hand-crafted as HTML then converted into a `Template` block tree — five foundational designs plus ten HR "Ori" originals (announcement, policy update, all-hands, etc.). Highlights:
  - `newsletter.ts` — classic email-safe newsletter (FullSphere). All `<table>`-based, inline styles, dark footer.
  - `birthday.ts` — gradient hero, signature on tinted footer.
  - `onboarding-day1.ts` — clean professional design with a unique `checklist` block type.
  - `cart-abandonment.ts` — modern card design with faux Mac chrome (CSS custom properties, flexbox — modern email clients only).
  - `sales-nurture.ts` — long-form letter with simulated email-client "preview chrome", insight quote, symptom list, accent CTA card, signed P.S.
- **Canva-style dashboard** at `/editor`:
  - **Dashboard-first experience** — landing page shows saved emails in a grid, folders sidebar, search, create-new menu (blank or from template). Emails auto-save on creation
  - **Folder system** — create, rename, delete folders. Move emails between folders. Unfiled view for uncategorized emails
  - **Email card actions** — right-click menu: open, rename, duplicate, move to folder, delete
- **Email editor** (opens from dashboard):
  - **Clean layout** — left panel has elements + layouts only (no data clutter); toolbar gives one-click access to **Custom Values**, **Settings**, **Import**, **HTML** export, and **Automate**. Back button returns to dashboard
  - **Custom Values (GHL-style)** — full-screen settings page with left sidebar navigation, table-based value layout (Name | Token | Value | Type columns), click-to-copy tokens, inline value editing. System values (company, sender, links) are pre-created; users create their own groups with **Add Group** and add values freely. Company Details is a dedicated form (name, logo, address, website, phone) that auto-populates `{{custom.company_*}}`. Unsubscribe link is a custom value — no manual URL field
  - **AI email generation — two studios** — generation is split into a **Design Studio** (describe the email → a top-tier layout) and a separate **Copy Studio** where a dedicated conversion copywriter rewrites every headline, paragraph and button while keeping layout + merge tags untouched. Steer the copy with an optional tone/audience brief, regenerate for a different take, or use the design as-is. Choose from **Gemini**, **Groq**, or **OpenRouter**; per-IP daily limit (25/day). API key stored in browser or via env vars (`GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`)
  - **Context files** — save reusable brand/voice notes that are fed into *both* the design and copy AI passes
  - **Element library** — **click to add or drag onto the canvas**: heading / text / button / image / callout / divider / spacer / **signature** / **social links**. **Layout presets** (title+body, image+text, hero+button, callout+button) drop several blocks at once
  - **Hover any section** for a Canva-style action toolbar (move / duplicate / delete) that follows the cursor; clicking selects, and the toolbar stays on the selected block
  - **Double-click-to-edit text in place** — inline editing shows the raw value so merge tags like `{{employee.first_name}}` and custom values like `{{custom.company_name}}` are preserved
  - **Keyboard shortcuts + undo/redo**: Del delete, Ctrl+D duplicate, Ctrl+Z / Ctrl+Shift+Z undo-redo, arrows move, Ctrl+C/V copy-paste, Esc deselect
  - **Import HTML** — paste an existing HTML email and AI converts it into an editable block tree (supports all 3 AI providers)
  - **Email settings** — subject, preheader, from name/email, reply-to in a clean Settings modal (accessed from toolbar). Unsubscribe handled via custom values
  - **Deliverability score** — real-time spam-word scanner in the property panel. 0-100 score with per-issue warnings + header badge
  - **Plain text view** — auto-generated text/plain version alongside View HTML, with copy button
  - Type-aware property inputs (text / longtext / color / image / link / alignment)
  - "View HTML" / "Plain text" modals with copy-to-clipboard
  - "Send test" — POSTs to a stub API route that simulates Gmail Workspace quota tracking
- **No-code workflow builder** at `/automations`:
  - **Automations dashboard** — create, open, duplicate, and delete multiple workflows; saved to `localStorage` so they persist across reloads (no backend yet)
  - **Template handoff** — clicking "Automate" in the editor auto-creates a new workflow with the current template pre-selected
  - Vertical node canvas — a trigger plus wait / send-email steps, with inline "+" insert and click-to-edit
  - Friendly trigger presets (employee hired, birthday, work anniversary, manual) with "N days before" timing
  - **Test run** — simulates one sample contact through the flow on a virtual clock and shows the resulting timeline
- **Automation engine** in `lib/automation/` (the builder serializes to this):
  - `types.ts` — `Trigger` (event / date_field / manual), `Step` (wait / send_email), `Pipeline`, `Enrollment`, duration helpers
  - `engine.ts` — pluggable `Clock` (`RealClock` for production, `VirtualClock` to fast-forward waits), enrollment + `tick()` / `runUntilIdle()` scheduler
  - `mailer.ts` — `Mailer` boundary: `Console`, `Http` (reuses `/api/send-test`), `Collecting` (for the in-app Test run)
- **Two-pass renderer** at `lib/blocks/render.ts`:
  1. Substitute each block's `props` into its `html_template`
  2. Substitute template-level variables (e.g., `{{employee.first_name}}`)
  3. Splice block HTML into the template wrapper

## Project layout

```
app/
  page.tsx              landing page (Soft Sage palette)
  editor/page.tsx       dashboard ↔ editor state machine
  automations/page.tsx  automations entry — renders <AutomationsApp/>
  api/send-test/        mock send endpoint (logs + fake quota)
  api/generate-email/   AI email generation (Gemini / Groq / OpenRouter)
components/
  Dashboard.tsx         Canva-style home — saved emails grid, folders, search
  BlockEditor.tsx       main editor — clean Build + Gallery panels, toolbar
  AiGenerateModal.tsx   two-step AI modal — Design Studio → Copy Studio
  CustomValuesModal.tsx GHL-style full-screen settings — table layout, groups
  SettingsModal.tsx     email settings (subject, from, reply-to)
  ImportHtmlModal.tsx   Paste HTML → AI converts to editable blocks
  ElementsPanel.tsx     Elements panel — click-to-add block library
  DataSourcePanel.tsx   CSV / Airtable / CRM data source management
  TemplateGallery.tsx   Templates panel — visual template picker + AI entry
  PreviewPane.tsx       center — iframe preview, click-to-select + canvas toolbar
  PropertyPanel.tsx     right — block props + deliverability score
  automation/
    AutomationsApp.tsx  container — dashboard ↔ builder, template handoff
    AutomationsList.tsx dashboard of saved automations (create/open/dup/delete)
    WorkflowBuilder.tsx node canvas + header + nav (edits one automation)
    StepInspector.tsx   right-panel editors for trigger / wait / send_email
    TestRunModal.tsx    simulates a contact through the flow, shows timeline
db/
  schema.sql            PostgreSQL schema — users, ai_generations, templates,
                        data_sources, automations, send_log
lib/
  blocks/
    types.ts            Block, Template, VariableDef
    render.ts           renderTemplate / renderBlock / cloneTemplate
    substitute.ts       {{path.to.value}} placeholder replacement
    palette.ts          elements + layouts (signature, social links blocks)
  ai/
    generate-email.ts   design + copy passes (separate prompts), multi-provider
  data-sources/
    types.ts            DataSource model, CSV parser, field auto-mapping
  email/
    spam-checker.ts     Deliverability scanner — trigger words, caps, structure
    plain-text.ts       HTML → plain-text converter for multipart emails
  saved-templates/
    store.ts            SavedEmail + Folder interfaces, localStorage CRUD
  custom-values/
    types.ts            CustomValue, CompanyDetails, buildCustomValueScope
    store.ts            localStorage persistence + system value merging
  automation/
    types.ts            Trigger, Step, Pipeline, Enrollment, duration helpers
    engine.ts           Clock + AutomationEngine (triggers, scheduler)
    mailer.ts           Mailer interface + Console/Http/Collecting impls
    store.ts            localStorage persistence + seed (multiple automations)
  templates/
    *.ts                15 reverse-engineered templates
    blank.ts            empty "start from scratch" canvas
    index.ts            TEMPLATE_LIBRARY registry (+ blank)
scripts/
  automation-demo.ts    runnable engine demo (npm run automate)
```

## The reverse-engineering process

When a new HTML template comes in, the conversion is currently manual (Claude reads the HTML, segments it by visual block, and outputs the `Template` JSON). The pattern:

1. Identify the wrapper (outer `<table>` shell, body styles, max-width container) → becomes `wrapper_html` with a `{{__blocks__}}` token.
2. Each top-level `<tr>` inside the inner table becomes one `Block`.
3. For each block, decide:
   - A descriptive `type` (`hero_banner_gradient`, `checklist`, `signature_tinted`, …)
   - Which fragments are editable → become `props`
   - The `propTypes` for each prop (drives the UI control)
   - Replace literal values inside the HTML with `{{prop_name}}` placeholders
4. Detect external variables (`{{employee.first_name}}` etc.) and list them under the template's `variables`.

Once the library has ~20 templates this pattern can be partially automated with a `cheerio`-based parser, but for the first batch manual is faster and more accurate.

## What's not here yet (the real product)

| Subsystem | Where it goes |
|---|---|
| Google OAuth + Gmail API transport | `lib/transports/gmail.ts` (next milestone) — plug in behind the `Mailer` interface |
| Microsoft Graph transport | `lib/transports/microsoft.ts` |
| Per-identity quota tracking + token-bucket rate limiter | `lib/transports/quota.ts` |
| Data-source connectors (live sync — Sheets, Postgres, HRIS) | CSV upload + Airtable + CRM config land in POC; live sync needs `lib/connectors/` |
| Workflow **persistence + production scheduler** | engine exists (`lib/automation/`); still need to store enrollments and drive `tick()` / `evaluateDateTriggers()` from cron (e.g. Inngest) |
| Saving workflows + templates server-side | automations persist client-side in `localStorage` (`lib/automation/store.ts`); needs Postgres + Drizzle + CRUD to be multi-device / multi-tenant |
| Auth + multi-tenant workspaces | Clerk + Postgres + Drizzle |
| Schema mapping UI (source field → template variable) | `app/mappings/` |

## Next steps

The most impactful next pieces, in order:

1. **Real Gmail OAuth + send** — replace the mock route with a real Gmail API transport behind the `Mailer` interface. Requires a Google Cloud OAuth app and verification for the `gmail.send` scope.
2. **Persist + schedule workflows** — store the `Pipeline` the builder produces and the per-contact enrollments in Postgres, then drive `engine.tick()` and `evaluateDateTriggers()` from a daily/minutely cron (e.g. Inngest). This turns the in-memory engine into a real always-on scheduler.
3. **Save templates server-side** — Postgres + Drizzle, then a templates list/CRUD UI.
4. **Data-source connectors** — replace the sample Data panel with a real source (Sheets/Postgres/HRIS) so workflows enroll real employees.

See `memory/project_arya_hr_email.md` for the full product context.
