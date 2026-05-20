import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Template } from "@/lib/blocks/types";

const SYSTEM_PROMPT = `You are an expert email template builder for Arya, an HR email platform. You generate email templates as structured JSON that renders in a Canva-style block editor.

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

## HTML rules

- ALL HTML must be email-safe: <table>-based layout, inline styles only, no CSS classes
- The wrapper_html must be a full HTML document with DOCTYPE, centered 600px table, and {{__blocks__}} token
- Each block's html_template is a <tr>...</tr> fragment (rows inside the wrapper table)
- Use inline styles everywhere — no <style> blocks, no CSS classes
- Use web-safe fonts: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif
- Background: #F4F2FB (Arya brand lavender), card: #FFFFFF, text: #15112B or #3C4858
- All images use placeholder URLs from https://placehold.co (e.g. https://placehold.co/600x200/7C3AED/white?text=Banner)

## Block design rules

- Every piece of text that the user should be able to edit must be a prop with a {{prop_name}} placeholder in html_template
- Colors the user should change → propType "color"
- URLs (links, buttons) → propType "link_url"
- Images → propType "image_url"
- Short text (headings, labels, button text) → propType "text"
- Long text (paragraphs, descriptions) → propType "longtext"
- Use {{variable.path}} (e.g. {{employee.first_name}}) for per-recipient merge tags — these are NOT props, they're template-level variables listed in the variables array
- A typical email has 4-8 blocks: header/logo, hero/banner, body content, CTA button, signature/closing, footer
- First block (header/logo) and last block (footer) should have locked: true
- Block ids must be unique strings starting with "blk_"

## Variable conventions for HR emails

Common variables (include the relevant ones):
- employee.first_name, employee.last_name, employee.email, employee.department, employee.job_title
- company.name, company.logo_url
- sender.name, sender.title
- Include any context-specific ones (e.g. event.date, policy.name, etc.)

## Example block

{
  "id": "blk_cta",
  "type": "cta_button",
  "label": "CTA button",
  "props": {
    "label": "Learn More",
    "url": "#",
    "button_color": "#7C3AED",
    "text_color": "#ffffff"
  },
  "propTypes": {
    "label": "text",
    "url": "link_url",
    "button_color": "color",
    "text_color": "color"
  },
  "html_template": "<tr><td style=\\"padding:16px 40px;\\"><table role=\\"presentation\\" cellpadding=\\"0\\" cellspacing=\\"0\\" border=\\"0\\"><tr><td style=\\"background-color:{{button_color}};border-radius:6px;\\"><a href=\\"{{url}}\\" style=\\"display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:{{text_color}};text-decoration:none;\\">{{label}}</a></td></tr></table></td></tr>"
}

Generate professional, visually appealing email templates. Make the design feel polished — use proper spacing, subtle colors, and good typography hierarchy.`;

export async function generateEmailTemplate(
  prompt: string,
  apiKey: string
): Promise<Template> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  const result = await model.generateContent([
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    {
      role: "model",
      parts: [
        {
          text: "Understood. I will generate email templates as valid JSON matching the Template interface, with email-safe HTML, proper block structure, and editable props. Send me a description of the email you want.",
        },
      ],
    },
    {
      role: "user",
      parts: [
        {
          text: `Generate an email template for: ${prompt}\n\nReturn ONLY the JSON object — no markdown, no code fences, no explanation.`,
        },
      ],
    },
  ] as never);

  const text = result.response.text();

  // Strip markdown fences if present (safety net)
  const cleaned = text
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();

  let parsed: Template;
  try {
    parsed = JSON.parse(cleaned) as Template;
  } catch {
    throw new Error(
      `AI returned invalid JSON. Raw response:\n${text.slice(0, 500)}`
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
