import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import type { Template } from "@/lib/blocks/types";

export type AiProvider = "gemini" | "groq" | "openrouter";

const SYSTEM_PROMPT = `You are an expert email designer for Arya, an HR email studio. You generate stunning, ready-to-send email templates as structured JSON. Users may give you just a single word like "birthday" or "welcome" — your job is to infer the full context (it's an HR email for employees) and produce a beautifully designed, complete template every time.

## Your design philosophy

- Think like a top-tier email designer at Canva or Mailchimp — every email should look like it was crafted by a professional
- Use generous whitespace, clear visual hierarchy, and a warm-but-professional tone
- Write real, thoughtful copy — never use lorem ipsum. For an "onboarding" email, write actual welcome text. For "birthday", write a genuine celebration message
- Include 5-8 blocks minimum: logo/header, hero section, body content (often 2-3 blocks), CTA, signature/sign-off, footer
- Use merge tags like {{employee.first_name}} naturally in the copy so it feels personal
- Every email should feel complete and ready to send — not a skeleton

## Output format

Return ONLY valid JSON matching this TypeScript interface — no markdown, no explanation, no code fences:

interface Template {
  id: string;           // "tpl_ai_" + short slug
  name: string;         // Human-readable name
  category: string;     // e.g. "hr", "corporate", "celebration", "onboarding"
  wrapper_html: string; // Outer email shell with {{__blocks__}} token
  variables: VariableDef[];
  blocks: Block[];
}

interface VariableDef {
  key: string;       // Dot-path like "employee.first_name"
  label: string;     // Human label
  sample: string;    // Preview value used in editor
  required?: boolean;
}

interface Block {
  id: string;              // "blk_" prefix + descriptive slug
  type: string;            // Descriptive: "hero_banner", "body_text", "cta_button", etc.
  label: string;           // Human label shown in editor
  props: Record<string, string>;      // Current editable values
  propTypes: Record<string, PropType>; // What UI control to show
  html_template: string;   // HTML fragment with {{prop_name}} placeholders
  locked?: boolean;        // true for header/footer to prevent deletion
}

type PropType = "text" | "longtext" | "color" | "image_url" | "link_url" | "alignment";

## HTML & styling rules

- ALL HTML must be email-safe: <table>-based layout, inline styles only, no CSS classes, no <style> blocks
- The wrapper_html must be a full HTML document with DOCTYPE, centered 600px max-width table, and {{__blocks__}} token
- Each block's html_template is a <tr>...</tr> fragment (rows inside the wrapper table)
- Use web-safe fonts: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif

### Default color palette (Soft Sage — earthy, professional, warm):
- Page background: #F4F6ED (soft sage canvas)
- Card/content background: #FFFFFF
- Primary brand: #4F6B4A (sage green) — use for buttons, accents, links
- Heading text: #212A20 (deep ink)
- Body text: #475569 (readable gray)
- Muted/secondary text: #7A8474
- Light accent backgrounds: #EAEEE2 (pale sage), #F0F4E8 (softer sage)
- Borders/dividers: #DDE3D2
- Button text: #FFFFFF on #4F6B4A background
- For celebration emails (birthday, anniversary): feel free to add warmer accents — #D4A04A (gold), #C96442 (coral), #7CAAB2 (teal)
- All images use placeholder URLs from https://placehold.co (e.g. https://placehold.co/600x200/4F6B4A/FFFFFF?text=Welcome)

### Typography & spacing:
- Headings: 24-28px, bold, color #212A20
- Body: 16px, line-height 1.6, color #475569
- Small text/captions: 13-14px, color #7A8474
- Padding inside blocks: 24-40px horizontal, 16-32px vertical
- Generous spacing between sections (16-32px padding)
- Border-radius on buttons: 8px. On cards/callouts: 12px

## Block design rules

- Every piece of text that the user should edit must be a prop with a {{prop_name}} placeholder
- Colors the user should change → propType "color"
- URLs (links, buttons) → propType "link_url"
- Images → propType "image_url"
- Short text (headings, labels, button text) → propType "text"
- Long text (paragraphs, descriptions) → propType "longtext"
- Use {{variable.path}} (e.g. {{employee.first_name}}) for per-recipient merge tags — these are NOT props, they're template-level variables listed in the variables array
- First block (header/logo) and last block (footer) should have locked: true
- Block ids must be unique strings starting with "blk_"

## Variable conventions for HR emails

Common variables (include the relevant ones):
- employee.first_name, employee.last_name, employee.email, employee.department, employee.job_title, employee.hire_date
- company.name, company.logo_url
- sender.name, sender.title, sender.email
- Context-specific: event.date, policy.name, benefit.enrollment_deadline, etc.

## Inferring intent from short prompts

When the user gives a brief prompt, expand it intelligently:
- "birthday" → Employee birthday celebration email with warm wishes, possibly a team message section, a fun visual, and company sign-off
- "welcome" or "onboarding" → New hire welcome email with company intro, first-day details, team info, resources/checklist, and warm tone
- "policy" → Policy update announcement with clear summary, effective date, what changed, action items, and who to contact
- "newsletter" → Monthly company newsletter with sections for news, team spotlight, upcoming events, and a CTA
- "anniversary" → Work anniversary congratulations with milestone recognition, warm message, and team celebration
- "benefits" → Benefits enrollment email with key dates, what's new, action steps, and enrollment link
- "farewell" or "offboarding" → Warm goodbye email with well-wishes and transition info
- Always default to professional-yet-warm HR tone unless told otherwise

## Editor compatibility (CRITICAL)

The generated template is loaded into a visual drag-and-drop editor. For blocks to work correctly:
1. Each block's html_template MUST start with <tr> as its very first HTML tag and end with </tr>
2. The <tr> must contain exactly ONE <td> as its direct child (with all content inside that <td>)
3. Every visible text, color, URL, and image MUST be a prop with a {{prop_name}} placeholder
4. Keep blocks self-contained — one visual section per block
5. Max 8-10 props per block — split complex sections into simpler blocks
6. Avoid more than 2 levels of nested tables
7. Use these block types for best editor integration: "header_logo", "hero_banner", "body_text", "heading", "image_full", "image_centered", "cta_button", "callout", "divider", "spacer", "signature", "footer", "product_grid", "icon_row", "stats_row"
8. First block = header/logo with locked: true; Last block = footer with locked: true
9. Use "text" for short strings, "longtext" for paragraphs, "color" for hex colors, "image_url" for images, "link_url" for URLs, "alignment" for left/center/right
10. Prop names must be simple lowercase with underscores: "title", "body_color", "button_url" — NOT "employee.first_name" (those are template variables, not props)

## Example block

{
  "id": "blk_cta",
  "type": "cta_button",
  "label": "CTA button",
  "props": {
    "label": "Get Started",
    "url": "#",
    "button_color": "#4F6B4A",
    "text_color": "#FFFFFF"
  },
  "propTypes": {
    "label": "text",
    "url": "link_url",
    "button_color": "color",
    "text_color": "color"
  },
  "html_template": "<tr><td style=\\"padding:16px 40px;\\"><table role=\\"presentation\\" cellpadding=\\"0\\" cellspacing=\\"0\\" border=\\"0\\"><tr><td style=\\"background-color:{{button_color}};border-radius:8px;\\"><a href=\\"{{url}}\\" style=\\"display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:{{text_color}};text-decoration:none;\\">{{label}}</a></td></tr></table></td></tr>"
}

Produce a complete, polished email every time — even from a single word. The result should look like it came from a professional design agency, not a template generator.`;

// ── Gemini ──

async function generateWithGemini(prompt: string, apiKey: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      {
        role: "model",
        parts: [
          {
            text: "Understood. I will generate email templates as valid JSON matching the Template interface, with email-safe HTML, proper block structure, and editable props. Send me a description of the email you want.",
          },
        ],
      },
    ],
  });

  const result = await chat.sendMessage(
    `Generate an email template for: ${prompt}\n\nReturn ONLY the JSON object — no markdown, no code fences, no explanation.`
  );

  return result.response.text();
}

// ── Groq ──

async function generateWithGroq(prompt: string, apiKey: string): Promise<string> {
  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Generate an email template for: ${prompt}\n\nReturn ONLY the JSON object — no markdown, no code fences, no explanation.`,
      },
    ],
  });

  return completion.choices[0]?.message?.content ?? "";
}

// ── OpenRouter ──

async function generateWithOpenRouter(prompt: string, apiKey: string): Promise<string> {
  const client = new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
  });

  const completion = await client.chat.completions.create({
    model: "google/gemini-2.0-flash-001",
    temperature: 0.7,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Generate an email template for: ${prompt}\n\nReturn ONLY the JSON object — no markdown, no code fences, no explanation.`,
      },
    ],
  });

  return completion.choices[0]?.message?.content ?? "";
}

// ── Post-processing: fix common AI output issues ──

const VALID_PROP_TYPES = new Set(["text", "longtext", "color", "image_url", "link_url", "alignment"]);

function guessPropType(key: string, value: string): string {
  const v = String(value).trim().toLowerCase();
  if (v.startsWith("#") || v.startsWith("rgb") || /^[a-f0-9]{3,8}$/i.test(v)) return "color";
  if (/^https?:\/\//.test(v) && /\.(jpg|jpeg|png|gif|webp|svg|ico)/i.test(v)) return "image_url";
  if (/^https?:\/\//.test(v) || v === "#") return "link_url";
  if (key.includes("color") || key.includes("bg") || key.includes("accent")) return "color";
  if (key.includes("image") || key.includes("avatar") || key.includes("logo_url") || key.includes("photo")) return "image_url";
  if (key.includes("url") || key.includes("link") || key.includes("href")) return "link_url";
  if (key.includes("align")) return "alignment";
  if (v.length > 100) return "longtext";
  return "text";
}

function normalizeAiTemplate(t: Template): Template {
  if (!Array.isArray(t.variables)) t.variables = [];
  if (!Array.isArray(t.blocks)) t.blocks = [];
  if (!t.name) t.name = "AI Generated Email";
  if (!t.category) t.category = "hr";

  const seenIds = new Set<string>();

  for (const block of t.blocks) {
    // Ensure unique ID
    if (!block.id || seenIds.has(block.id)) {
      block.id = `blk_${(block.type || "block").replace(/\s+/g, "_")}_${Math.random().toString(36).slice(2, 8)}`;
    }
    seenIds.add(block.id);

    if (!block.props) block.props = {};
    if (!block.propTypes) block.propTypes = {};
    if (!block.label) block.label = block.type || "Block";
    if (!block.type) block.type = "custom";

    // Fix invalid propType values
    for (const [key, val] of Object.entries(block.propTypes)) {
      if (!VALID_PROP_TYPES.has(val as string)) {
        block.propTypes[key] = guessPropType(key, String(block.props[key] ?? "")) as typeof val;
      }
    }

    // Add missing propTypes for existing props
    for (const key of Object.keys(block.props)) {
      if (!block.propTypes[key]) {
        block.propTypes[key] = guessPropType(key, String(block.props[key])) as "text";
      }
    }

    // Ensure html_template starts with <tr>
    if (block.html_template) {
      const trimmed = block.html_template.replace(/^\s+/, "");
      if (!trimmed.startsWith("<tr")) {
        block.html_template = `<tr><td style="padding:16px 32px;">${block.html_template}</td></tr>`;
      }
    } else {
      // Block has no html_template — create a minimal one
      block.html_template = `<tr><td style="padding:16px 32px;"><p style="margin:0;font-size:16px;color:#475569;">Block content</p></td></tr>`;
    }
  }

  // Ensure first and last blocks are locked
  if (t.blocks.length > 0) {
    t.blocks[0].locked = true;
    t.blocks[t.blocks.length - 1].locked = true;
  }

  return t;
}

// ── Shared validation + entry point ──

export async function generateEmailTemplate(
  prompt: string,
  apiKey: string,
  provider: AiProvider = "gemini"
): Promise<Template> {
  let raw: string;
  switch (provider) {
    case "groq":
      raw = await generateWithGroq(prompt, apiKey);
      break;
    case "openrouter":
      raw = await generateWithOpenRouter(prompt, apiKey);
      break;
    default:
      raw = await generateWithGemini(prompt, apiKey);
  }

  // Strip markdown fences if present (safety net)
  const cleaned = raw
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();

  let parsed: Template;
  try {
    parsed = JSON.parse(cleaned) as Template;
  } catch {
    throw new Error(
      `AI returned invalid JSON. Raw response:\n${raw.slice(0, 500)}`
    );
  }

  // Normalize: fix common AI output issues before validation
  parsed = normalizeAiTemplate(parsed);

  // Validate minimum structure
  if (!parsed.wrapper_html?.includes("{{__blocks__}}")) {
    // Try to fix: wrap in a basic email shell
    parsed.wrapper_html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Email</title></head>
<body style="margin:0;padding:0;background:#F4F6ED;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F6ED;">
<tr><td align="center" style="padding:40px 16px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;border-radius:12px;overflow:hidden;">
{{__blocks__}}
</table></td></tr></table></body></html>`;
  }

  if (!Array.isArray(parsed.blocks) || parsed.blocks.length === 0) {
    throw new Error("Generated template has no blocks");
  }

  // Normalize: ensure id starts with tpl_ai_
  if (!parsed.id?.startsWith("tpl_ai_")) {
    parsed.id = `tpl_ai_${Date.now()}`;
  }

  return parsed;
}
