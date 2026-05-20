import type { Template } from "@/lib/blocks/types";

/**
 * Reverse-engineered from Ori's "Security Alert" email template.
 *
 * Design DNA: Ori Modern wrapper — #EEF1F5 body bg, 640px max-width card
 * with 8px radius + box-shadow. Distinctive 6px orange-to-amber gradient
 * warning bar at the very top. Uses amber badge for urgency, an amber
 * callout box for immediate instructions, numbered dark-circle steps,
 * and a dual CTA (dark solid button + text link).
 *
 * Ideal for: phishing alerts, security incidents, credential resets,
 * mandatory security training, breach notifications.
 */
export const oriSecurityAlertTemplate: Template = {
  id: "tpl_ori_security_v1",
  name: "Security Alert",
  category: "operations",
  variables: [
    { key: "company.name", label: "Company name", sample: "Ori", required: true },
    { key: "company.domain", label: "Company email domain", sample: "ori.com", required: true }
  ],
  wrapper_html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Security Alert</title>
</head>
<body style="margin:0;padding:0;background-color:#EEF1F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;font-size:1px;line-height:1px;">A targeted phishing campaign is impersonating {{company.name}} leadership. Three quick steps to stay protected.</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EEF1F5;padding:40px 16px;">
  <tr><td align="center">
    <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;background-color:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(10,37,64,0.08);overflow:hidden;">
      {{__blocks__}}
    </table>
  </td></tr>
</table>
</body>
</html>`,
  blocks: [
    {
      id: "blk_warning_bar",
      type: "warning_bar_gradient",
      label: "Warning bar (gradient)",
      props: {
        gradient_from: "#C2410C",
        gradient_to: "#F59E0B"
      },
      propTypes: {
        gradient_from: "color",
        gradient_to: "color"
      },
      html_template: `<tr><td style="height:6px;background:linear-gradient(90deg,{{gradient_from}},{{gradient_to}});font-size:0;line-height:0;">&nbsp;</td></tr>`
    },
    {
      id: "blk_header",
      type: "ori_header_department",
      label: "Ori header with department",
      locked: true,
      props: {
        brand_name: "ORI",
        department_label: "Security Operations"
      },
      propTypes: {
        brand_name: "text",
        department_label: "text"
      },
      html_template: `<tr><td style="padding:24px 44px;background-color:#ffffff;border-bottom:1px solid #E5E9EE;">
  <table width="100%"><tr>
    <td style="font-size:20px;font-weight:700;letter-spacing:2px;color:#0A2540;">{{brand_name}}</td>
    <td align="right" style="font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#6B7785;font-weight:600;">{{department_label}}</td>
  </tr></table>
</td></tr>`
    },
    {
      id: "blk_alert_content",
      type: "alert_badge_headline",
      label: "Alert badge + headline + body",
      props: {
        badge_text: "⚠ Action Required",
        badge_bg: "#FEF3C7",
        badge_color: "#92400E",
        headline: "Active phishing campaign impersonating {{company.name}} leadership",
        body_text: "Our Security team has identified a targeted phishing campaign sending fake messages from “ceo-office@ori-corp.com” requesting urgent gift card purchases or password resets. <strong style=\"color:#0A2540;\">This domain is not ours.</strong>"
      },
      propTypes: {
        badge_text: "text",
        badge_bg: "color",
        badge_color: "color",
        headline: "longtext",
        body_text: "longtext"
      },
      html_template: `<tr><td style="padding:44px 44px 8px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;"><tr>
    <td style="background-color:{{badge_bg}};color:{{badge_color}};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:6px 12px;border-radius:4px;">{{badge_text}}</td>
  </tr></table>
  <h1 style="margin:0 0 16px;font-size:30px;line-height:1.2;color:#0A2540;font-weight:700;letter-spacing:-0.4px;">{{headline}}</h1>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:#3C4858;">{{body_text}}</p>
</td></tr>`
    },
    {
      id: "blk_callout",
      type: "warning_callout_amber",
      label: "Warning callout (amber)",
      props: {
        callout_label: "If you received a suspicious message",
        callout_text: "Do not click links or reply. Forward it to <strong>phish@{{company.domain}}</strong> and delete it immediately.",
        bg_color: "#FFF7ED",
        border_color: "#FED7AA",
        label_color: "#9A3412",
        text_color: "#7C2D12"
      },
      propTypes: {
        callout_label: "text",
        callout_text: "longtext",
        bg_color: "color",
        border_color: "color",
        label_color: "color",
        text_color: "color"
      },
      html_template: `<tr><td style="padding:8px 44px 8px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:{{bg_color}};border:1px solid {{border_color}};border-radius:6px;margin:0 0 28px;">
    <tr><td style="padding:20px 24px;">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:1.2px;text-transform:uppercase;color:{{label_color}};font-weight:700;">{{callout_label}}</p>
      <p style="margin:0;font-size:14px;line-height:1.55;color:{{text_color}};">{{callout_text}}</p>
    </td></tr>
  </table>
</td></tr>`
    },
    {
      id: "blk_steps",
      type: "numbered_steps_three",
      label: "Numbered steps (three)",
      props: {
        heading: "Three quick checks before you click",
        step_1_title: "Inspect the sender’s full email address",
        step_1_desc: "Legitimate {{company.name}} messages always come from <strong>@{{company.domain}}</strong>, never from look-alike domains.",
        step_2_title: "Hover before you click",
        step_2_desc: "Preview every link. If the destination doesn’t match what’s shown, don’t click.",
        step_3_title: "When in doubt, verify out-of-band",
        step_3_desc: "Confirm urgent requests via Slack or a known phone number — not by replying to the email.",
        number_bg: "#0A2540",
        number_color: "#ffffff"
      },
      propTypes: {
        heading: "text",
        step_1_title: "text",
        step_1_desc: "longtext",
        step_2_title: "text",
        step_2_desc: "longtext",
        step_3_title: "text",
        step_3_desc: "longtext",
        number_bg: "color",
        number_color: "color"
      },
      html_template: `<tr><td style="padding:0 44px 8px;">
  <h2 style="margin:0 0 20px;font-size:18px;color:#0A2540;font-weight:700;letter-spacing:-0.2px;">{{heading}}</h2>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="padding:0 0 18px;">
      <table width="100%"><tr>
        <td width="44" valign="top"><div style="width:32px;height:32px;border-radius:50%;background-color:{{number_bg}};color:{{number_color}};font-size:14px;font-weight:700;text-align:center;line-height:32px;">1</div></td>
        <td><p style="margin:0 0 4px;font-size:15px;color:#0A2540;font-weight:600;">{{step_1_title}}</p>
        <p style="margin:0;font-size:14px;color:#5A6675;line-height:1.55;">{{step_1_desc}}</p></td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:0 0 18px;">
      <table width="100%"><tr>
        <td width="44" valign="top"><div style="width:32px;height:32px;border-radius:50%;background-color:{{number_bg}};color:{{number_color}};font-size:14px;font-weight:700;text-align:center;line-height:32px;">2</div></td>
        <td><p style="margin:0 0 4px;font-size:15px;color:#0A2540;font-weight:600;">{{step_2_title}}</p>
        <p style="margin:0;font-size:14px;color:#5A6675;line-height:1.55;">{{step_2_desc}}</p></td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:0 0 18px;">
      <table width="100%"><tr>
        <td width="44" valign="top"><div style="width:32px;height:32px;border-radius:50%;background-color:{{number_bg}};color:{{number_color}};font-size:14px;font-weight:700;text-align:center;line-height:32px;">3</div></td>
        <td><p style="margin:0 0 4px;font-size:15px;color:#0A2540;font-weight:600;">{{step_3_title}}</p>
        <p style="margin:0;font-size:14px;color:#5A6675;line-height:1.55;">{{step_3_desc}}</p></td>
      </tr></table>
    </td></tr>
  </table>
</td></tr>`
    },
    {
      id: "blk_cta",
      type: "dual_cta_dark",
      label: "Dual CTA (dark button + text link)",
      props: {
        primary_label: "Report a suspicious email",
        primary_url: "#",
        secondary_label: "Take 5-min refresher →",
        secondary_url: "#"
      },
      propTypes: {
        primary_label: "text",
        primary_url: "link_url",
        secondary_label: "text",
        secondary_url: "link_url"
      },
      html_template: `<tr><td style="padding:24px 44px 44px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="background-color:#0A2540;border-radius:6px;padding-right:10px;">
      <a href="{{primary_url}}" style="display:inline-block;padding:14px 30px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">{{primary_label}}</a>
    </td>
    <td width="14"></td>
    <td><a href="{{secondary_url}}" style="display:inline-block;padding:14px 6px;font-size:14px;font-weight:600;color:#2E6BE6;text-decoration:none;letter-spacing:0.3px;">{{secondary_label}}</a></td>
  </tr></table>
</td></tr>`
    },
    {
      id: "blk_footer",
      type: "ori_footer_with_email",
      label: "Footer with contact email",
      locked: true,
      props: {
        company_address: "Ori Inc. · 200 Madison Avenue, New York, NY 10016",
        sender_label: "Sent by Security Operations",
        contact_email: "security@ori.com"
      },
      propTypes: {
        company_address: "text",
        sender_label: "text",
        contact_email: "text"
      },
      html_template: `<tr><td style="padding:24px 44px;background-color:#F4F6F8;border-top:1px solid #E5E9EE;">
  <p style="margin:0 0 6px;font-size:12px;color:#6B7785;line-height:1.5;">{{company_address}}</p>
  <p style="margin:0;font-size:12px;color:#6B7785;line-height:1.5;">{{sender_label}} · <a href="mailto:{{contact_email}}" style="color:#2E6BE6;text-decoration:none;">{{contact_email}}</a></p>
</td></tr>`
    }
  ]
};
