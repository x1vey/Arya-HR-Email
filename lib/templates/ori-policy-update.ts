import type { Template } from "@/lib/blocks/types";

/**
 * Reverse-engineered from Ori's "Policy Update" email template.
 *
 * Design DNA: Same Ori classic wrapper (navy logo, 600px card, #F4F6F8
 * background). Distinct elements include a blue left-border callout box
 * for the effective date and a structured bullet list for key changes.
 * Tone is informational and authoritative — sent from People Operations
 * rather than a named individual.
 *
 * Ideal for: policy changes, benefits updates, compliance notices,
 * process revisions, handbook amendments.
 */
export const oriPolicyUpdateTemplate: Template = {
  id: "tpl_ori_policy_update_v1",
  name: "Policy Update — Ori",
  category: "hr",
  variables: [
    { key: "employee.first_name", label: "Employee first name", sample: "Alex", required: false },
    { key: "employee.last_name", label: "Employee last name", sample: "Rivera", required: false },
    { key: "policy.name", label: "Policy name", sample: "Remote Work Policy", required: true },
    { key: "policy.effective_date", label: "Effective date", sample: "July 1, 2026", required: true },
    { key: "company.name", label: "Company name", sample: "Ori", required: true }
  ],
  wrapper_html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Policy Update</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F6F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;font-size:1px;line-height:1px;">Important update to {{company.name}}'s {{policy.name}}, effective {{policy.effective_date}}.</span>
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
      id: "blk_content_intro",
      type: "policy_intro",
      label: "Policy intro",
      props: {
        category_label: "Policy Update · People Operations",
        headline: "Updates to our {{policy.name}}",
        greeting: "Hello team,",
        intro_text: "Following feedback gathered through our spring engagement survey, we have refined {{company.name}}'s {{policy.name}} to better support flexibility while strengthening team collaboration."
      },
      propTypes: {
        category_label: "text",
        headline: "longtext",
        greeting: "text",
        intro_text: "longtext"
      },
      html_template: `<tr><td style="padding:40px 40px 0 40px;">
  <p style="margin:0 0 8px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#2E6BE6;font-weight:600;">{{category_label}}</p>
  <h1 style="margin:0 0 24px;font-size:26px;line-height:1.3;color:#0A2540;font-weight:600;">{{headline}}</h1>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3C4858;">{{greeting}}</p>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3C4858;">{{intro_text}}</p>
</td></tr>`
    },
    {
      id: "blk_callout",
      type: "callout_left_border",
      label: "Callout (left border)",
      props: {
        callout_label: "Effective Date",
        callout_value: "{{policy.effective_date}}",
        border_color: "#2E6BE6"
      },
      propTypes: {
        callout_label: "text",
        callout_value: "text",
        border_color: "color"
      },
      html_template: `<tr><td style="padding:0 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F4F6F8;border-left:3px solid {{border_color}};margin:0 0 24px;">
    <tr><td style="padding:20px 24px;">
      <p style="margin:0 0 6px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#0A2540;font-weight:700;">{{callout_label}}</p>
      <p style="margin:0;font-size:16px;color:#0A2540;font-weight:600;">{{callout_value}}</p>
    </td></tr>
  </table>
</td></tr>`
    },
    {
      id: "blk_changes",
      type: "heading_with_bullets",
      label: "Key changes (bullet list)",
      props: {
        heading: "Key changes",
        bullet_1: "Three anchor days in-office per week (Tuesday, Wednesday, Thursday).",
        bullet_2: "Two flexible days for remote work or focused deep work.",
        bullet_3: "Quarterly fully-remote weeks aligned to the company calendar.",
        bullet_4: "Updated home-office stipend of $750 annually."
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
      id: "blk_followup",
      type: "body_paragraph",
      label: "Follow-up paragraph",
      props: {
        text: "Managers will discuss team-level implementation during 1:1s over the next two weeks. The full policy document and FAQ are available in the People Hub."
      },
      propTypes: {
        text: "longtext"
      },
      html_template: `<tr><td style="padding:0 40px;">
  <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3C4858;">{{text}}</p>
</td></tr>`
    },
    {
      id: "blk_cta",
      type: "cta_dark",
      label: "CTA button (dark)",
      props: {
        label: "View full policy",
        url: "#"
      },
      propTypes: {
        label: "text",
        url: "link_url"
      },
      html_template: `<tr><td style="padding:0 40px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#0A2540;border-radius:3px;">
    <a href="{{url}}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">{{label}}</a>
  </td></tr></table>
</td></tr>`
    },
    {
      id: "blk_signature",
      type: "signature_department",
      label: "Signature (department)",
      props: {
        closing: "Best,",
        department: "People Operations",
        company_name: "{{company.name}}"
      },
      propTypes: {
        closing: "text",
        department: "text",
        company_name: "text"
      },
      html_template: `<tr><td style="padding:32px 40px 40px 40px;">
  <p style="margin:0;font-size:15px;line-height:1.6;color:#3C4858;">{{closing}}<br><strong style="color:#0A2540;">{{department}}</strong><br>{{company_name}}</p>
</td></tr>`
    },
    {
      id: "blk_footer",
      type: "ori_footer_with_email",
      label: "Footer (with contact email)",
      locked: true,
      props: {
        company_address: "Ori Inc. · 200 Madison Avenue, New York, NY 10016",
        help_text: "Questions? Reply to this email or reach us at",
        email: "people@ori.com"
      },
      propTypes: {
        company_address: "text",
        help_text: "text",
        email: "text"
      },
      html_template: `<tr><td style="padding:24px 40px;background-color:#F4F6F8;border-top:1px solid #E5E9EE;">
  <p style="margin:0 0 8px;font-size:12px;color:#6B7785;line-height:1.5;">{{company_address}}</p>
  <p style="margin:0;font-size:12px;color:#6B7785;line-height:1.5;">{{help_text}} <a href="mailto:{{email}}" style="color:#2E6BE6;text-decoration:none;">{{email}}</a>.</p>
</td></tr>`
    }
  ]
};
