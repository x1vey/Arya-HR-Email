import type { Block } from "./types";

/**
 * The "Elements" library — the set of blocks a user can add to any template,
 * Canva-style. Each entry knows how to mint a fresh Block (with a unique id
 * and sensible default props) that slots into the 600px table wrapper as a
 * `<tr><td>` row, matching the structure produced by every template.
 */
export interface PaletteItem {
  /** Stable palette key */
  key: string;
  /** Label shown on the element card */
  label: string;
  /** Short helper line under the label */
  hint: string;
  /** Inline SVG icon (24x24, currentColor) */
  icon: string;
  /** Mint a brand-new block instance */
  make: () => Block;
}

let counter = 0;
function uid(prefix: string): string {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 7);
  return `blk_${prefix}_${Date.now().toString(36)}${counter}${rand}`;
}

const ICONS = {
  heading: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 4v16M18 4v16M6 12h12"/></svg>`,
  text: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>`,
  button: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="8" rx="4"/></svg>`,
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 16l-5-5-7 7"/></svg>`,
  divider: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12h16"/></svg>`,
  spacer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 4v16M8 7l4-4 4 4M8 17l4 4 4-4"/></svg>`,
  callout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h10M7 14h6"/></svg>`
};

export const ELEMENT_PALETTE: PaletteItem[] = [
  {
    key: "heading",
    label: "Heading",
    hint: "Big bold title",
    icon: ICONS.heading,
    make: () => ({
      id: uid("heading"),
      type: "heading",
      label: "Heading",
      props: {
        text: "Your headline here",
        color: "#15112B",
        align: "left"
      },
      propTypes: {
        text: "longtext",
        color: "color",
        align: "alignment"
      },
      html_template: `<tr><td style="padding:28px 32px 8px 32px;text-align:{{align}};">
  <h2 style="margin:0;font-size:24px;line-height:1.3;font-weight:700;color:{{color}};">{{text}}</h2>
</td></tr>`
    })
  },
  {
    key: "text",
    label: "Text",
    hint: "Paragraph copy",
    icon: ICONS.text,
    make: () => ({
      id: uid("text"),
      type: "text",
      label: "Text",
      props: {
        body: "Add your message here. You can reference variables like {{employee.first_name}} and they'll be filled in per recipient.",
        color: "#475569",
        align: "left"
      },
      propTypes: {
        body: "longtext",
        color: "color",
        align: "alignment"
      },
      html_template: `<tr><td style="padding:8px 32px 16px 32px;text-align:{{align}};">
  <p style="margin:0;font-size:16px;line-height:1.6;color:{{color}};">{{body}}</p>
</td></tr>`
    })
  },
  {
    key: "button",
    label: "Button",
    hint: "Call to action",
    icon: ICONS.button,
    make: () => ({
      id: uid("button"),
      type: "button",
      label: "Button",
      props: {
        text: "Get started",
        url: "https://example.com",
        background_color: "#7C3AED",
        text_color: "#FFFFFF",
        align: "left"
      },
      propTypes: {
        text: "text",
        url: "link_url",
        background_color: "color",
        text_color: "color",
        align: "alignment"
      },
      html_template: `<tr><td style="padding:16px 32px 24px 32px;text-align:{{align}};">
  <a href="{{url}}" style="display:inline-block;background:{{background_color}};color:{{text_color}};text-decoration:none;font-size:15px;font-weight:600;padding:12px 28px;border-radius:8px;">{{text}}</a>
</td></tr>`
    })
  },
  {
    key: "image",
    label: "Image",
    hint: "Full-width image",
    icon: ICONS.image,
    make: () => ({
      id: uid("image"),
      type: "image",
      label: "Image",
      props: {
        image_url: "https://placehold.co/600x240/EDE7FF/7C3AED?text=Your+image",
        alt: "Image",
        link_url: ""
      },
      propTypes: {
        image_url: "image_url",
        alt: "text",
        link_url: "link_url"
      },
      html_template: `<tr><td style="padding:0;">
  <a href="{{link_url}}" style="text-decoration:none;"><img src="{{image_url}}" alt="{{alt}}" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;" /></a>
</td></tr>`
    })
  },
  {
    key: "callout",
    label: "Callout",
    hint: "Highlighted note",
    icon: ICONS.callout,
    make: () => ({
      id: uid("callout"),
      type: "callout",
      label: "Callout",
      props: {
        text: "Heads up — this is an important note worth highlighting.",
        background_color: "#EDE7FF",
        accent_color: "#7C3AED"
      },
      propTypes: {
        text: "longtext",
        background_color: "color",
        accent_color: "color"
      },
      html_template: `<tr><td style="padding:8px 32px 24px 32px;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:{{background_color}};border-radius:8px;border-left:4px solid {{accent_color}};">
    <tr><td style="padding:16px 20px;">
      <p style="margin:0;font-size:15px;line-height:1.6;color:#334155;">{{text}}</p>
    </td></tr>
  </table>
</td></tr>`
    })
  },
  {
    key: "divider",
    label: "Divider",
    hint: "Horizontal line",
    icon: ICONS.divider,
    make: () => ({
      id: uid("divider"),
      type: "divider",
      label: "Divider",
      props: {
        color: "#E2E8F0"
      },
      propTypes: {
        color: "color"
      },
      html_template: `<tr><td style="padding:8px 32px;">
  <div style="height:1px;background:{{color}};line-height:1px;font-size:1px;">&nbsp;</div>
</td></tr>`
    })
  },
  {
    key: "spacer",
    label: "Spacer",
    hint: "Vertical gap",
    icon: ICONS.spacer,
    make: () => ({
      id: uid("spacer"),
      type: "spacer",
      label: "Spacer",
      props: {
        height: "24"
      },
      propTypes: {
        height: "text"
      },
      html_template: `<tr><td style="padding:0;line-height:0;font-size:0;">
  <div style="height:{{height}}px;line-height:{{height}}px;font-size:1px;">&nbsp;</div>
</td></tr>`
    })
  }
];

/** Mint a single element by its palette key. */
function el(key: string): Block {
  const item = ELEMENT_PALETTE.find((p) => p.key === key);
  if (!item) throw new Error(`Unknown element: ${key}`);
  return item.make();
}

/**
 * Pre-arranged multi-block layouts — Canva-style "Layouts". Clicking one
 * drops the whole arrangement in at once.
 */
export interface LayoutPreset {
  key: string;
  label: string;
  hint: string;
  icon: string;
  make: () => Block[];
}

const LAYOUT_ICONS = {
  titleBody: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h12M4 11h16M4 15h16M4 19h10"/></svg>`,
  imageText: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="9" rx="1.5"/><path d="M4 17h16M4 21h10" stroke-linecap="round"/></svg>`,
  heroCta: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 5h16M4 9h16M4 13h10"/><rect x="4" y="17" width="9" height="4" rx="2"/></svg>`,
  calloutCta: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="9" rx="1.5"/><rect x="4" y="17" width="9" height="4" rx="2"/></svg>`
};

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    key: "title_body",
    label: "Title + body",
    hint: "Heading and paragraph",
    icon: LAYOUT_ICONS.titleBody,
    make: () => [el("heading"), el("text")]
  },
  {
    key: "image_text",
    label: "Image + text",
    hint: "Picture with copy",
    icon: LAYOUT_ICONS.imageText,
    make: () => [el("image"), el("text")]
  },
  {
    key: "hero_cta",
    label: "Hero + button",
    hint: "Headline, text, CTA",
    icon: LAYOUT_ICONS.heroCta,
    make: () => [el("heading"), el("text"), el("button")]
  },
  {
    key: "callout_cta",
    label: "Callout + button",
    hint: "Note with an action",
    icon: LAYOUT_ICONS.calloutCta,
    make: () => [el("callout"), el("button")]
  }
];
