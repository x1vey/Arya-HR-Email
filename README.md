# Arya — HR Email Builder POC

Proof of concept for the core idea: **reverse-engineer hand-crafted HTML email templates into editable block trees**, then expose them in a drag-and-drop builder so HRs can customize without losing design integrity. Automation later fills in employee data per recipient.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000

## What's in this POC

- **Five real templates** in `lib/templates/`, each hand-crafted as HTML then converted into a `Template` block tree:
  - `newsletter.ts` — classic email-safe newsletter (FullSphere). All `<table>`-based, inline styles, dark footer.
  - `birthday.ts` — gradient hero, signature on tinted footer.
  - `onboarding-day1.ts` — clean professional design with a unique `checklist` block type.
  - `cart-abandonment.ts` — modern card design with faux Mac chrome (CSS custom properties, flexbox — modern email clients only).
  - `sales-nurture.ts` — long-form letter with simulated email-client "preview chrome", insight quote, symptom list, accent CTA card, signed P.S.
- **Block-aware editor** at `/editor` with:
  - Drag-reorder via `@dnd-kit`
  - Click-to-select (in either the left list or the live preview)
  - Side-panel property editor with type-aware inputs (text / longtext / color / image / link / alignment)
  - Sample variables panel (stands in for a connected data-source row)
  - "View final HTML" modal — what gets handed to the SMTP transport
  - "Send test (mock)" — POSTs to a stub API route that simulates Gmail Workspace quota tracking
- **Two-pass renderer** at `lib/blocks/render.ts`:
  1. Substitute each block's `props` into its `html_template`
  2. Substitute template-level variables (e.g., `{{employee.first_name}}`)
  3. Splice block HTML into the template wrapper

## Project layout

```
app/
  page.tsx              landing page
  editor/page.tsx       editor entry — renders <BlockEditor/>
  api/send-test/        mock send endpoint (logs + fake quota)
components/
  BlockEditor.tsx       main editor container, holds template state
  BlockList.tsx         left panel — drag-sortable block list
  PreviewPane.tsx       center — iframe preview with click-to-select
  PropertyPanel.tsx     right — prop inputs for the selected block
  VariablesPanel.tsx    sample data row editor
  TemplateSwitcher.tsx  switch between templates in the library
lib/
  blocks/
    types.ts            Block, Template, VariableDef
    render.ts           renderTemplate / renderBlock / cloneTemplate
    substitute.ts       {{path.to.value}} placeholder replacement
  templates/
    birthday.ts         reverse-engineered birthday template
    onboarding-day1.ts  reverse-engineered onboarding template
    index.ts            TEMPLATE_LIBRARY registry
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
| Google OAuth + Gmail API transport | `lib/transports/gmail.ts` (next milestone) |
| Microsoft Graph transport | `lib/transports/microsoft.ts` |
| Per-identity quota tracking + token-bucket rate limiter | `lib/transports/quota.ts` |
| Data-source connectors (Sheets, Postgres, HRIS) | `lib/connectors/` |
| Workflow engine (cron / date-relative / event triggers) | `lib/workflows/` (Inngest functions) |
| Auth + multi-tenant workspaces | Clerk + Postgres + Drizzle |
| Schema mapping UI (source field → template variable) | `app/mappings/` |

## Next steps

The most impactful next pieces, in order:

1. **Real Gmail OAuth + send** — replace the mock route with a real Gmail API transport. Requires a Google Cloud OAuth app and starting the verification process for the `gmail.send` scope.
2. **One more template per category** (interview confirmation, work anniversary) — fleshes out the block-type library and stress-tests the schema.
3. **Save templates server-side** — Postgres + Drizzle, then a templates list/CRUD UI.
4. **Workflow trigger primitive** — start with cron-only ("every day at 9am, query this source, render this template, send via this identity").

See `memory/project_arya_hr_email.md` for the full product context.
