import type { Template } from "@/lib/blocks/types";

/**
 * Reverse-engineered from a hand-crafted birthday email HTML.
 *
 * The original HTML was a single table with 5 visible "rows" — gradient
 * banner, two-paragraph body, image, CTA button, and signature on a tinted
 * footer. Each row maps to one Block below.
 *
 * Notice the design freedom this gives:
 *   - The hero_banner block has gradient + emoji styling specific to this
 *     template — it's NOT a generic Unlayer "hero block."
 *   - The signature block uses a tinted background that's part of this
 *     template's visual language.
 *
 * The HR end-user can edit text, swap the image, change the link, even
 * reorder blocks — but the design integrity is preserved.
 */
export const birthdayTemplate: Template = {
  id: "tpl_birthday_v1",
  name: "Birthday Wish",
  category: "celebration",
  variables: [
    { key: "employee.first_name", label: "Employee first name", sample: "Priya", required: true },
    { key: "company.name", label: "Company name", sample: "Acme Inc", required: true },
    { key: "sender.name", label: "Sender (HR) name", sample: "Riya from People Ops", required: true },
    { key: "links.celebration_page", label: "Celebration page URL", sample: "https://acme.com/celebrate/priya", required: false }
  ],
  wrapper_html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Happy Birthday from {{company.name}}!</title>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.06);">
      {{__blocks__}}
    </table>
  </td></tr>
</table>
</body>
</html>`,
  blocks: [
    {
      id: "blk_hero",
      type: "hero_banner_gradient",
      label: "Hero banner (gradient)",
      locked: false,
      props: {
        title: "🎉 Happy Birthday, {{employee.first_name}}! 🎂",
        gradient_from: "#F59E0B",
        gradient_to: "#EF4444",
        text_color: "#FFFFFF"
      },
      propTypes: {
        title: "longtext",
        gradient_from: "color",
        gradient_to: "color",
        text_color: "color"
      },
      html_template: `<tr><td style="background:linear-gradient(135deg,{{gradient_from}} 0%,{{gradient_to}} 100%);padding:48px 32px;text-align:center;">
  <h1 style="margin:0;font-size:32px;line-height:1.2;color:{{text_color}};font-weight:700;">{{title}}</h1>
</td></tr>`
    },
    {
      id: "blk_body",
      type: "two_paragraph_body",
      label: "Body — two paragraphs",
      props: {
        paragraph_1: "Wishing you a fantastic birthday from everyone at {{company.name}}!",
        paragraph_2: "Today is your day. Take a moment to celebrate yourself — you've earned it. Here's to another year of growth, laughter, and incredible work together.",
        primary_color: "#111827",
        secondary_color: "#4B5563"
      },
      propTypes: {
        paragraph_1: "longtext",
        paragraph_2: "longtext",
        primary_color: "color",
        secondary_color: "color"
      },
      html_template: `<tr><td style="padding:40px 32px 24px 32px;">
  <p style="margin:0 0 16px 0;font-size:18px;line-height:1.6;color:{{primary_color}};">{{paragraph_1}}</p>
  <p style="margin:0;font-size:16px;line-height:1.6;color:{{secondary_color}};">{{paragraph_2}}</p>
</td></tr>`
    },
    {
      id: "blk_image",
      type: "image_centered",
      label: "Centered image",
      props: {
        image_url: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=600&q=80",
        alt_text: "Birthday celebration"
      },
      propTypes: {
        image_url: "image_url",
        alt_text: "text"
      },
      html_template: `<tr><td style="padding:0 32px 32px 32px;text-align:center;">
  <img src="{{image_url}}" alt="{{alt_text}}" width="536" style="border-radius:8px;max-width:100%;display:block;margin:0 auto;"/>
</td></tr>`
    },
    {
      id: "blk_cta",
      type: "cta_button",
      label: "Call-to-action button",
      props: {
        label: "See your team's wishes →",
        url: "{{links.celebration_page}}",
        button_color: "#0F172A",
        text_color: "#FFFFFF",
        alignment: "center"
      },
      propTypes: {
        label: "text",
        url: "link_url",
        button_color: "color",
        text_color: "color",
        alignment: "alignment"
      },
      html_template: `<tr><td style="padding:0 32px 40px 32px;text-align:{{alignment}};">
  <a href="{{url}}" style="display:inline-block;background:{{button_color}};color:{{text_color}};text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;">{{label}}</a>
</td></tr>`
    },
    {
      id: "blk_signature",
      type: "signature_tinted",
      label: "Signature (tinted)",
      locked: true,
      props: {
        message: "With love,",
        sender_line: "{{sender.name}} & the {{company.name}} family"
      },
      propTypes: {
        message: "text",
        sender_line: "text"
      },
      html_template: `<tr><td style="padding:24px 32px;background:#F8FAFC;border-top:1px solid #E5E7EB;">
  <p style="margin:0;font-size:14px;line-height:1.6;color:#6B7280;">
    {{message}}<br/><strong style="color:#111827;">{{sender_line}}</strong>
  </p>
</td></tr>`
    }
  ]
};
