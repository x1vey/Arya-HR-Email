# Arya — HR Email Builder Poc

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

- **15 templates** in `lib/templates/`, each hand-crafted as HTML then converted into a `Template` block tree — five foundational designs plus ten HR "Ori" originals (announcement, policy update, all-hands, etc.). Highlights:
  - `newsletter.ts` — classic email-safe newsletter (FullSphere). All `<table>`-based, inline styles, dark footer.
  - `birthday.ts` — gradient hero, signature on tinted footer.
  - `onboarding-day1.ts` — clean professional design with a unique `checklist` block type.
  - `cart-abandonment.ts` — modern card design with faux Mac chrome (CSS custom properties, flexbox — modern email clients only).
  - `sales-nurture.ts` — long-form letter with simulated email-client "preview chrome", insight quote, symptom list, accent CTA card, signed P.S.
- **Canva-style email editor** at `/editor`:
  - Left icon rail with two panels — **Templates** (visual gallery + **Start from scratch** blank canvas), **Elements** (layouts + blocks); merge-tag editing and **Save template** live in the right property panel
  - **Element library** (`lib/blocks/palette.ts`) — **click to add or drag onto the canvas** (heading / text / button / image / callout / divider / spacer); a drop indicator shows where it lands. **Layout presets** (title+body, image+text, hero+button, callout+button) drop several blocks at once
  - **Hover any section** for a Canva-style action toolbar (move / duplicate / delete) that follows the cursor; clicking selects, and the toolbar stays on the selected block
  - **Double-click-to-edit text in place** — inline editing shows the raw value so merge tags like `{{employee.first_name}}` are preserved instead of baked in
  - **Keyboard shortcuts + undo/redo**: ⌫ delete, ⌘/Ctrl+D duplicate, ⌘/Ctrl+Z / ⌘⇧Z undo-redo, ↑/↓ move, ⌘/Ctrl+C·V copy-paste, Esc deselect (shortcuts work even when focus is in the preview iframe, via key forwarding)
  - Type-aware property inputs (text / longtext / color / image / link / alignment)
  - "View HTML" modal — what gets handed to the SMTP transport
  - "Send test" — POSTs to a stub API route that simulates Gmail Workspace quota tracking
- **No-code workflow builder** at `/automations`:
  - **Automations dashboard** — create, open, duplicate, and delete multiple workflows; saved to `localStorage` so they persist across reloads (no backend yet)
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
  page.tsx              landing page
  editor/page.tsx       editor entry — renders <BlockEditor/>
  automations/page.tsx  automations entry — renders <AutomationsApp/>
  api/send-test/        mock send endpoint (logs + fake quota)
components/
  BlockEditor.tsx       main editor container, holds template state
  BlockList.tsx         Layers panel — drag-sortable block list
  ElementsPanel.tsx     Elements panel — click-to-add block library
  TemplateGallery.tsx   Templates panel — visual template picker
  PreviewPane.tsx       center — iframe preview, click-to-select + canvas toolbar
  PropertyPanel.tsx     right — prop inputs for the selected block
  VariablesPanel.tsx    Data panel — sample data row editor
  automation/
    AutomationsApp.tsx  container — switches between dashboard and builder
    AutomationsList.tsx dashboard of saved automations (create/open/dup/delete)
    WorkflowBuilder.tsx node canvas + header + nav (edits one automation)
    StepInspector.tsx   right-panel editors for trigger / wait / send_email
    TestRunModal.tsx    simulates a contact through the flow, shows timeline
lib/
  blocks/
    types.ts            Block, Template, VariableDef
    render.ts           renderTemplate / renderBlock / cloneTemplate
    substitute.ts       {{path.to.value}} placeholder replacement
    palette.ts          insertable elements + layout presets (Elements panel)
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
| Data-source connectors (Sheets, Postgres, HRIS) | `lib/connectors/` |
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
