import type { Template } from "@/lib/blocks/types";

/**
 * Reverse-engineered from Ori's "Company Announcement" email template.
 *
 * Design DNA: Clean corporate, dark navy (#0A2540) accent, 600px table
 * with subtle 1px border + 4px radius. The logo is text-based ("ORI")
 * separated by a 3px navy bottom border. Content sits in a single padded
 * cell with a category label, headline, greeting, body paragraphs, a dark
 * CTA button, and a simple signature. Footer is light gray with address.
 *
 * Ideal for: executive announcements, leadership changes, company-wide
 * news, org restructures.
 */
export const oriAnnouncementTemplate: Template = {
  id: "tpl_ori_announcement_v1",
  name: "Company Announcement — Ori",
  category: "corporate",
  variables: [
    { key: "employee.first_name", label: "Employee first name", sample: "Alex", required: false },
    { key: "employee.last_name", label: "Employee last name", sample: "Rivera", required: false },
    { key: "announcement.person_name", label: "Announced person name", sample: "Margaret Chen", required: true },
    { key: "announcement.role", label: "Announced role", sample: "Chief Financial Officer", required: true },
    { key: "announcement.start_date", label: "Start date", sample: "June 1, 2026", required: true },
    { key: "company.name", label: "Company name", sample: "Ori", required: true }
  ],
  wrapper_html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Company Announcement</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F6F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;font-size:1px;line-height:1px;">A message from the {{company.name}} executive team regarding our new {{announcement.role}}.</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F4F6F8;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #E5E9EE;border-radius:4px;">
      {{__blocks__}}
    </table>
  </td></tr>
</table>
</body>
</html>`,
  blocks: [
    {
      id: "blk_logo",
      type: "ori_logo_header",
      label: "Ori logo header",
      locked: true,
      props: {
        logo_text: "ORI",
        text_color: "#0A2540",
        border_color: "#0A2540"
      },
      propTypes: {
        logo_text: "text",
        text_color: "color",
        border_color: "color"
      },
      html_template: `<tr><td style="padding:28px 40px;border-bottom:3px solid {{border_color}};">
  <span style="font-size:22px;font-weight:700;letter-spacing:1px;color:{{text_color}};">{{logo_text}}</span>
</td></tr>`
    },
    {
      id: "blk_content",
      type: "announcement_body",
      label: "Announcement body",
      props: {
        category_label: "Company Announcement",
        headline: "Welcoming {{announcement.person_name}} as our new {{announcement.role}}",
        greeting: "Dear team,",
        body_paragraph_1: "I am pleased to announce that {{announcement.person_name}} will be joining {{company.name}} as our new {{announcement.role}}, effective {{announcement.start_date}}. {{announcement.person_name}} brings more than two decades of financial leadership experience from Fortune 500 organizations and high-growth technology companies.",
        body_paragraph_2: "In her role, {{announcement.person_name}} will lead our global finance organization, oversee strategic financial planning, and partner closely with the executive team as we enter our next phase of growth.",
        body_paragraph_3: "Please join me in giving {{announcement.person_name}} a warm welcome to {{company.name}}."
      },
      propTypes: {
        category_label: "text",
        headline: "longtext",
        greeting: "text",
        body_paragraph_1: "longtext",
        body_paragraph_2: "longtext",
        body_paragraph_3: "longtext"
      },
      html_template: `<tr><td style="padding:40px 40px 0 40px;">
  <p style="margin:0 0 8px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#2E6BE6;font-weight:600;">{{category_label}}</p>
  <h1 style="margin:0 0 24px;font-size:26px;line-height:1.3;color:#0A2540;font-weight:600;">{{headline}}</h1>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3C4858;">{{greeting}}</p>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3C4858;">{{body_paragraph_1}}</p>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3C4858;">{{body_paragraph_2}}</p>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3C4858;">{{body_paragraph_3}}</p>
</td></tr>`
    },
    {
      id: "blk_cta",
      type: "cta_dark",
      label: "CTA button (dark)",
      props: {
        label: "Read the full announcement",
        url: "#",
        button_color: "#0A2540",
        text_color: "#ffffff"
      },
      propTypes: {
        label: "text",
        url: "link_url",
        button_color: "color",
        text_color: "color"
      },
      html_template: `<tr><td style="padding:0 40px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:{{button_color}};border-radius:3px;">
    <a href="{{url}}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:{{text_color}};text-decoration:none;letter-spacing:0.3px;">{{label}}</a>
  </td></tr></table>
</td></tr>`
    },
    {
      id: "blk_signature",
      type: "signature_with_title",
      label: "Signature (with title)",
      props: {
        closing: "Warm regards,",
        sender_name: "David Hartmann",
        sender_title: "Chief Executive Officer",
        company_name: "{{company.name}}"
      },
      propTypes: {
        closing: "text",
        sender_name: "text",
        sender_title: "text",
        company_name: "text"
      },
      html_template: `<tr><td style="padding:32px 40px 40px 40px;">
  <p style="margin:0;font-size:15px;line-height:1.6;color:#3C4858;">{{closing}}<br><strong style="color:#0A2540;">{{sender_name}}</strong><br>{{sender_title}}, {{company_name}}</p>
</td></tr>`
    },
    {
      id: "blk_footer",
      type: "ori_footer_internal",
      label: "Footer (internal notice)",
      locked: true,
      props: {
        company_address: "Ori Inc. · 200 Madison Avenue, New York, NY 10016",
        notice_text: "This is an internal communication intended for Ori employees only."
      },
      propTypes: {
        company_address: "text",
        notice_text: "text"
      },
      html_template: `<tr><td style="padding:24px 40px;background-color:#F4F6F8;border-top:1px solid #E5E9EE;">
  <p style="margin:0 0 8px;font-size:12px;color:#6B7785;line-height:1.5;">{{company_address}}</p>
  <p style="margin:0;font-size:12px;color:#6B7785;line-height:1.5;">{{notice_text}}</p>
</td></tr>`
    }
  ]
};
