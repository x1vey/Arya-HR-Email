import type { Template } from "@/lib/blocks/types";

/**
 * Reverse-engineered from Ori's "Holiday / Office Closure" email template.
 *
 * Design DNA: Clean corporate, dark navy (#0A2540) accent, 600px table
 * with subtle 1px border + 4px radius. Features a dark left-border
 * callout box for closure/resume dates and a bullet list of expectations.
 *
 * Ideal for: public holidays, office closures, weather-related closures,
 * company-wide schedule changes.
 */
export const oriHolidayNoticeTemplate: Template = {
  id: "tpl_ori_holiday_v1",
  name: "Holiday / Office Closure",
  category: "operations",
  variables: [
    { key: "company.name", label: "Company name", sample: "Ori", required: true },
    { key: "holiday.name", label: "Holiday name", sample: "Memorial Day", required: true },
    { key: "holiday.date", label: "Closure date", sample: "Monday, May 25, 2026", required: true },
    { key: "holiday.resume_date", label: "Resume date", sample: "Tuesday, May 26, 2026", required: true }
  ],
  wrapper_html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Holiday / Office Closure</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F6F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;font-size:1px;line-height:1px;">{{company.name}} offices will be closed for the {{holiday.name}} holiday on {{holiday.date}}.</span>
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
        brand_name: "ORI",
        brand_color: "#0A2540"
      },
      propTypes: {
        brand_name: "text",
        brand_color: "color"
      },
      html_template: `<tr><td style="padding:28px 40px;border-bottom:3px solid {{brand_color}};">
  <span style="font-size:22px;font-weight:700;letter-spacing:1px;color:{{brand_color}};">{{brand_name}}</span>
</td></tr>`
    },
    {
      id: "blk_intro",
      type: "notice_intro",
      label: "Notice intro",
      locked: false,
      props: {
        category_label: "Office Closure Notice",
        headline: "{{company.name}} offices closed for {{holiday.name}}",
        greeting: "Hello team,",
        body_text: "A reminder that all {{company.name}} offices in the United States will be closed in observance of {{holiday.name}}. We encourage everyone to take this time to rest, reflect, and spend time with loved ones.",
        accent_color: "#2E6BE6"
      },
      propTypes: {
        category_label: "text",
        headline: "text",
        greeting: "text",
        body_text: "longtext",
        accent_color: "color"
      },
      html_template: `<tr><td style="padding:40px 40px 0 40px;">
  <p style="margin:0 0 8px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:{{accent_color}};font-weight:600;">{{category_label}}</p>
  <h1 style="margin:0 0 24px;font-size:26px;line-height:1.3;color:#0A2540;font-weight:600;">{{headline}}</h1>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3C4858;">{{greeting}}</p>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3C4858;">{{body_text}}</p>
</td></tr>`
    },
    {
      id: "blk_dates",
      type: "callout_dates_dark_border",
      label: "Date callout (dark border)",
      locked: false,
      props: {
        border_color: "#0A2540",
        label_1: "Closure Date",
        value_1: "{{holiday.date}}",
        label_2: "Operations Resume",
        value_2: "{{holiday.resume_date}} · 9:00 AM local time"
      },
      propTypes: {
        border_color: "color",
        label_1: "text",
        value_1: "text",
        label_2: "text",
        value_2: "text"
      },
      html_template: `<tr><td style="padding:0 40px 24px 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F4F6F8;border-left:3px solid {{border_color}};">
    <tr><td style="padding:20px 24px;">
      <p style="margin:0 0 6px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:{{border_color}};font-weight:700;">{{label_1}}</p>
      <p style="margin:0 0 16px;font-size:16px;color:{{border_color}};font-weight:600;">{{value_1}}</p>
      <p style="margin:0 0 6px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:{{border_color}};font-weight:700;">{{label_2}}</p>
      <p style="margin:0;font-size:16px;color:{{border_color}};font-weight:600;">{{value_2}}</p>
    </td></tr>
  </table>
</td></tr>`
    },
    {
      id: "blk_details",
      type: "heading_with_bullets",
      label: "What to expect (bullets)",
      locked: false,
      props: {
        heading: "What to expect",
        bullet_1: "All US offices closed; international offices operating on regular schedules.",
        bullet_2: "Customer support coverage maintained by our global on-call team.",
        bullet_3: "Email responses may be delayed until {{holiday.resume_date}}."
      },
      propTypes: {
        heading: "text",
        bullet_1: "text",
        bullet_2: "text",
        bullet_3: "text"
      },
      html_template: `<tr><td style="padding:0 40px;">
  <h2 style="margin:0 0 12px;font-size:17px;color:#0A2540;font-weight:600;">{{heading}}</h2>
  <ul style="margin:0 0 24px;padding-left:20px;color:#3C4858;font-size:15px;line-height:1.7;">
    <li>{{bullet_1}}</li>
    <li>{{bullet_2}}</li>
    <li>{{bullet_3}}</li>
  </ul>
</td></tr>`
    },
    {
      id: "blk_urgent",
      type: "body_paragraph",
      label: "Urgent contact note",
      locked: false,
      props: {
        text: "For urgent matters, please contact the on-call duty manager via the Operations channel."
      },
      propTypes: {
        text: "longtext"
      },
      html_template: `<tr><td style="padding:0 40px;">
  <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3C4858;">{{text}}</p>
</td></tr>`
    },
    {
      id: "blk_signature",
      type: "signature_department",
      label: "Department signature",
      locked: false,
      props: {
        closing: "Wishing you a safe and restful long weekend,",
        department: "Workplace Operations",
        company_name: "{{company.name}}"
      },
      propTypes: {
        closing: "text",
        department: "text",
        company_name: "text"
      },
      html_template: `<tr><td style="padding:0 40px 40px 40px;">
  <p style="margin:0;font-size:15px;line-height:1.6;color:#3C4858;">{{closing}}<br><strong style="color:#0A2540;">{{department}}</strong><br>{{company_name}}</p>
</td></tr>`
    },
    {
      id: "blk_footer",
      type: "ori_footer_internal",
      label: "Footer (internal)",
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
