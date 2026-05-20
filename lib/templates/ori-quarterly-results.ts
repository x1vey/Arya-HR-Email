import type { Template } from "@/lib/blocks/types";

/**
 * Reverse-engineered from Ori's "Quarterly Results" email template.
 *
 * Design DNA: Clean corporate, dark navy (#0A2540) accent, 600px table
 * with subtle 1px border + 4px radius. Features a 3-column stats row,
 * bullet highlights, and a dark CTA button leading to the full report.
 *
 * Ideal for: quarterly earnings, performance updates, team-wide
 * financial summaries, growth announcements.
 */
export const oriQuarterlyResultsTemplate: Template = {
  id: "tpl_ori_quarterly_v1",
  name: "Quarterly Results",
  category: "corporate",
  variables: [
    { key: "company.name", label: "Company name", sample: "Ori", required: true },
    { key: "quarter.label", label: "Quarter label", sample: "Q1 2026", required: true }
  ],
  wrapper_html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Quarterly Results</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F6F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;font-size:1px;line-height:1px;">A summary of {{company.name}}'s {{quarter.label}} financial and operational performance.</span>
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
      type: "quarterly_intro",
      label: "Quarterly intro",
      locked: false,
      props: {
        category_label: "Quarterly Results",
        headline: "{{quarter.label}}: A strong start to the year",
        intro_text: "Team, I'm proud to share that {{company.name}} delivered another quarter of disciplined growth. Here is a snapshot of how we performed against our plan.",
        accent_color: "#2E6BE6"
      },
      propTypes: {
        category_label: "text",
        headline: "text",
        intro_text: "longtext",
        accent_color: "color"
      },
      html_template: `<tr><td style="padding:40px 40px 0 40px;">
  <p style="margin:0 0 8px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:{{accent_color}};font-weight:600;">{{category_label}}</p>
  <h1 style="margin:0 0 16px;font-size:28px;line-height:1.25;color:#0A2540;font-weight:600;">{{headline}}</h1>
  <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#3C4858;">{{intro_text}}</p>
</td></tr>`
    },
    {
      id: "blk_stats",
      type: "stats_three_column",
      label: "Three-column stats",
      locked: false,
      props: {
        stat1_label: "Revenue",
        stat1_value: "$148M",
        stat1_change: "+18% YoY",
        stat2_label: "New Customers",
        stat2_value: "412",
        stat2_change: "+24% YoY",
        stat3_label: "NPS",
        stat3_value: "62",
        stat3_change: "+5 pts QoQ",
        positive_color: "#1F8B4C"
      },
      propTypes: {
        stat1_label: "text",
        stat1_value: "text",
        stat1_change: "text",
        stat2_label: "text",
        stat2_value: "text",
        stat2_change: "text",
        stat3_label: "text",
        stat3_value: "text",
        stat3_change: "text",
        positive_color: "color"
      },
      html_template: `<tr><td style="padding:0 40px 28px 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td width="33%" style="padding:20px;background-color:#F4F6F8;border:1px solid #E5E9EE;text-align:center;">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#6B7785;font-weight:600;">{{stat1_label}}</p>
        <p style="margin:0 0 4px;font-size:22px;color:#0A2540;font-weight:700;">{{stat1_value}}</p>
        <p style="margin:0;font-size:12px;color:{{positive_color}};font-weight:600;">{{stat1_change}}</p>
      </td>
      <td width="6"></td>
      <td width="33%" style="padding:20px;background-color:#F4F6F8;border:1px solid #E5E9EE;text-align:center;">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#6B7785;font-weight:600;">{{stat2_label}}</p>
        <p style="margin:0 0 4px;font-size:22px;color:#0A2540;font-weight:700;">{{stat2_value}}</p>
        <p style="margin:0;font-size:12px;color:{{positive_color}};font-weight:600;">{{stat2_change}}</p>
      </td>
      <td width="6"></td>
      <td width="33%" style="padding:20px;background-color:#F4F6F8;border:1px solid #E5E9EE;text-align:center;">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#6B7785;font-weight:600;">{{stat3_label}}</p>
        <p style="margin:0 0 4px;font-size:22px;color:#0A2540;font-weight:700;">{{stat3_value}}</p>
        <p style="margin:0;font-size:12px;color:{{positive_color}};font-weight:600;">{{stat3_change}}</p>
      </td>
    </tr>
  </table>
</td></tr>`
    },
    {
      id: "blk_highlights",
      type: "heading_with_bullets",
      label: "Highlights (bullets)",
      locked: false,
      props: {
        heading: "Highlights",
        bullet_1: "Launched our enterprise tier across EMEA, ahead of schedule.",
        bullet_2: "Renewed six of our top ten strategic accounts.",
        bullet_3: "Reduced infrastructure costs by 12% through platform consolidation.",
        bullet_4: "Welcomed 87 new colleagues across product, engineering, and sales."
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
  <ul style="margin:0 0 24px;padding-left:20px;color:#3C4858;font-size:15px;line-height:1.7;">
    <li>{{bullet_1}}</li>
    <li>{{bullet_2}}</li>
    <li>{{bullet_3}}</li>
    <li>{{bullet_4}}</li>
  </ul>
</td></tr>`
    },
    {
      id: "blk_outlook",
      type: "heading_with_paragraph",
      label: "Looking ahead",
      locked: false,
      props: {
        heading: "Looking ahead",
        text: "In Q2 our focus is on scaling enterprise delivery, advancing our AI roadmap, and continuing to invest in operational excellence. Thank you for the work that made this quarter possible."
      },
      propTypes: {
        heading: "text",
        text: "longtext"
      },
      html_template: `<tr><td style="padding:0 40px;">
  <h2 style="margin:0 0 12px;font-size:17px;color:#0A2540;font-weight:600;">{{heading}}</h2>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3C4858;">{{text}}</p>
</td></tr>`
    },
    {
      id: "blk_cta",
      type: "cta_dark",
      label: "CTA button (dark)",
      locked: false,
      props: {
        label: "Read the full report",
        url: "#",
        button_color: "#0A2540"
      },
      propTypes: {
        label: "text",
        url: "link_url",
        button_color: "color"
      },
      html_template: `<tr><td style="padding:0 40px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:{{button_color}};border-radius:3px;">
    <a href="{{url}}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">{{label}}</a>
  </td></tr></table>
</td></tr>`
    },
    {
      id: "blk_signature",
      type: "signature_executive",
      label: "Executive signature",
      locked: false,
      props: {
        closing: "With appreciation,",
        name: "David Hartmann",
        title: "Chief Executive Officer, Ori"
      },
      propTypes: {
        closing: "text",
        name: "text",
        title: "text"
      },
      html_template: `<tr><td style="padding:32px 40px 40px 40px;">
  <p style="margin:0;font-size:15px;line-height:1.6;color:#3C4858;">{{closing}}<br><strong style="color:#0A2540;">{{name}}</strong><br>{{title}}</p>
</td></tr>`
    },
    {
      id: "blk_footer",
      type: "ori_footer_confidential",
      label: "Footer (confidential)",
      locked: true,
      props: {
        company_address: "Ori Inc. · 200 Madison Avenue, New York, NY 10016",
        notice_text: "Confidential — for internal Ori use only."
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
