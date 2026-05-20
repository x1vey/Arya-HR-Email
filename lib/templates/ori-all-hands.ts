import type { Template } from "@/lib/blocks/types";

/**
 * Reverse-engineered from Ori's "All-Hands Meeting Invite" email template.
 *
 * Design DNA: Same Ori classic wrapper. Unique elements include a dark
 * (#0A2540) event details card with a 2-column layout showing date, time,
 * location, and host. Features dual CTAs (blue primary + outlined
 * secondary) for calendar add and Zoom join. Closes with a muted note
 * about recording availability.
 *
 * Ideal for: all-hands invites, town halls, quarterly reviews, company
 * events, team gatherings.
 */
export const oriAllHandsTemplate: Template = {
  id: "tpl_ori_all_hands_v1",
  name: "All-Hands Invite — Ori",
  category: "event",
  variables: [
    { key: "employee.first_name", label: "Employee first name", sample: "Alex", required: false },
    { key: "event.title", label: "Event title", sample: "Q2 2026 All-Hands Meeting", required: true },
    { key: "event.date", label: "Event date", sample: "Thursday, June 18, 2026", required: true },
    { key: "event.time", label: "Event time", sample: "10:00 – 11:30 AM ET", required: true },
    { key: "event.location", label: "Event location", sample: "HQ Auditorium & Zoom", required: true },
    { key: "event.host", label: "Event host", sample: "David Hartmann, CEO", required: true },
    { key: "company.name", label: "Company name", sample: "Ori", required: true }
  ],
  wrapper_html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>All-Hands Invite</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F6F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;font-size:1px;line-height:1px;">You're invited to {{company.name}}'s {{event.title}} on {{event.date}}.</span>
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
      id: "blk_intro",
      type: "event_intro",
      label: "Event intro",
      props: {
        category_label: "You're Invited",
        headline: "{{event.title}}",
        description: "Join the executive team for our quarterly all-hands. We'll review Q2 performance, share strategic priorities for the second half, and host a live Q&A."
      },
      propTypes: {
        category_label: "text",
        headline: "longtext",
        description: "longtext"
      },
      html_template: `<tr><td style="padding:40px 40px 0 40px;">
  <p style="margin:0 0 8px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#2E6BE6;font-weight:600;">{{category_label}}</p>
  <h1 style="margin:0 0 24px;font-size:28px;line-height:1.25;color:#0A2540;font-weight:600;">{{headline}}</h1>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3C4858;">{{description}}</p>
</td></tr>`
    },
    {
      id: "blk_event_card",
      type: "event_details_dark",
      label: "Event details card (dark)",
      props: {
        date_label: "Date",
        date_value: "{{event.date}}",
        time_label: "Time",
        time_value: "{{event.time}}",
        location_label: "Location",
        location_value: "{{event.location}}",
        host_label: "Host",
        host_value: "{{event.host}}"
      },
      propTypes: {
        date_label: "text",
        date_value: "text",
        time_label: "text",
        time_value: "text",
        location_label: "text",
        location_value: "text",
        host_label: "text",
        host_value: "text"
      },
      html_template: `<tr><td style="padding:0 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0A2540;border-radius:4px;margin:0 0 28px;">
    <tr>
      <td style="padding:24px;width:50%;border-right:1px solid #1B3858;">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#7FA8E8;font-weight:600;">{{date_label}}</p>
        <p style="margin:0 0 14px;font-size:16px;color:#ffffff;font-weight:600;">{{date_value}}</p>
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#7FA8E8;font-weight:600;">{{time_label}}</p>
        <p style="margin:0;font-size:16px;color:#ffffff;font-weight:600;">{{time_value}}</p>
      </td>
      <td style="padding:24px;width:50%;">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#7FA8E8;font-weight:600;">{{location_label}}</p>
        <p style="margin:0 0 14px;font-size:16px;color:#ffffff;font-weight:600;">{{location_value}}</p>
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#7FA8E8;font-weight:600;">{{host_label}}</p>
        <p style="margin:0;font-size:16px;color:#ffffff;font-weight:600;">{{host_value}}</p>
      </td>
    </tr>
  </table>
</td></tr>`
    },
    {
      id: "blk_agenda",
      type: "heading_with_bullets",
      label: "Agenda (bullet list)",
      props: {
        heading: "Agenda",
        bullet_1: "Quarterly business review",
        bullet_2: "Product roadmap preview",
        bullet_3: "Recognition of Q2 standout teams",
        bullet_4: "Open Q&A with leadership"
      },
      propTypes: {
        heading: "text",
        bullet_1: "text",
        bullet_2: "text",
        bullet_3: "text",
        bullet_4: "text"
      },
      html_template: `<tr><td style="padding:0 40px;">
  <h2 style="margin:0 0 12px;font-size:17px;color:#0A2540;font-weight:600;">{{heading}}</h2>
  <ul style="margin:0 0 28px;padding-left:20px;color:#3C4858;font-size:15px;line-height:1.7;">
    <li>{{bullet_1}}</li>
    <li>{{bullet_2}}</li>
    <li>{{bullet_3}}</li>
    <li>{{bullet_4}}</li>
  </ul>
</td></tr>`
    },
    {
      id: "blk_cta",
      type: "dual_cta_buttons",
      label: "Dual CTA buttons",
      props: {
        primary_label: "Add to calendar",
        primary_url: "#",
        primary_bg: "#2E6BE6",
        secondary_label: "Join via Zoom",
        secondary_url: "#"
      },
      propTypes: {
        primary_label: "text",
        primary_url: "link_url",
        primary_bg: "color",
        secondary_label: "text",
        secondary_url: "link_url"
      },
      html_template: `<tr><td style="padding:0 40px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="background-color:{{primary_bg}};border-radius:3px;padding-right:8px;">
      <a href="{{primary_url}}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">{{primary_label}}</a>
    </td>
    <td width="12"></td>
    <td style="border:1px solid #0A2540;border-radius:3px;">
      <a href="{{secondary_url}}" style="display:inline-block;padding:11px 27px;font-size:14px;font-weight:600;color:#0A2540;text-decoration:none;letter-spacing:0.3px;">{{secondary_label}}</a>
    </td>
  </tr></table>
</td></tr>`
    },
    {
      id: "blk_note",
      type: "muted_note",
      label: "Muted note",
      props: {
        text: "A recording will be shared in the People Hub for those unable to attend live."
      },
      propTypes: {
        text: "longtext"
      },
      html_template: `<tr><td style="padding:32px 40px 40px 40px;">
  <p style="margin:0;font-size:14px;line-height:1.6;color:#6B7785;">{{text}}</p>
</td></tr>`
    },
    {
      id: "blk_footer",
      type: "ori_footer_internal",
      label: "Footer (internal notice)",
      locked: true,
      props: {
        company_address: "Ori Inc. · 200 Madison Avenue, New York, NY 10016",
        notice_text: "Internal communication for Ori employees."
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
