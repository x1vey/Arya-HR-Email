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

  // Validate minimum structure
  if (!parsed.wrapper_html?.includes("{{__blocks__}}")) {
    throw new Error("Generated template is missing the {{__blocks__}} token in wrapper_html");
  }
  if (!Array.isArray(parsed.blocks) || parsed.blocks.length === 0) {
    throw new Error("Generated template has no blocks");
  }

  // Ensure all blocks have required fields
  for (const block of parsed.blocks) {
    if (!block.id || !block.html_template || !block.props || !block.propTypes) {
      throw new Error(`Block "${block.id ?? "unknown"}" is missing required fields`);
    }
  }

  // Normalize: ensure id starts with tpl_ai_
  if (!parsed.id?.startsWith("tpl_ai_")) {
    parsed.id = `tpl_ai_${Date.now()}`;
  }

  return parsed;
}
