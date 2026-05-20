import type { Template } from "@/lib/blocks/types";

/**
 * Reverse-engineered from Ori's "Benefits Open Enrollment" email template.
 *
 * Design DNA: Ori Modern wrapper — #EEF1F5 body bg, 640px max-width card
 * with 8px radius + box-shadow, header with ORI wordmark + "People · Benefits"
 * department label. Features a dark-to-blue gradient hero, split dates card
 * with urgency highlight, icon-prefixed feature list, and dual CTA (gradient
 * primary + text secondary).
 *
 * Ideal for: annual open enrollment, benefits window reminders, plan
 * comparison nudges, mid-year enrollment events.
 */
export const oriBenefitsEnrollmentTemplate: Template = {
  id: "tpl_ori_benefits_v1",
  name: "Benefits Open Enrollment",
  category: "hr",
  variables: [
    { key: "employee.first_name", label: "Employee first name", sample: "Alex", required: false },
    { key: "enrollment.year", label: "Enrollment year", sample: "2026", required: true },
    { key: "enrollment.close_date", label: "Enrollment close date", sample: "June 14, 2026", required: true }
  ],
  wrapper_html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Benefits Open Enrollment</title>
</head>
<body style="margin:0;padding:0;background-color:#EEF1F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;font-size:1px;line-height:1px;">Open enrollment for your {{enrollment.year}} Ori benefits closes {{enrollment.close_date}}. Take 10 minutes to confirm your selections.</span>
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
      id: "blk_header",
      type: "ori_header_department",
      label: "Ori header with department",
      locked: true,
      props: {
        brand_name: "ORI",
        department_label: "People · Benefits"
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
      id: "blk_hero",
      type: "hero_gradient_banner",
      label: "Gradient hero banner",
      props: {
        eyebrow: "Open Enrollment · {{enrollment.year}}",
        headline: "Your benefits.<br>Reviewed in 10 minutes.",
        description: "Open enrollment is your annual chance to confirm or adjust health, dental, retirement, and wellbeing coverage for the year ahead.",
        gradient_from: "#0A2540",
        gradient_via: "#1B3D6B",
        gradient_to: "#2E6BE6"
      },
      propTypes: {
        eyebrow: "text",
        headline: "longtext",
        description: "longtext",
        gradient_from: "color",
        gradient_via: "color",
        gradient_to: "color"
      },
      html_template: `<tr><td style="padding:0;background:linear-gradient(135deg,{{gradient_from}} 0%,{{gradient_via}} 60%,{{gradient_to}} 100%);">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:56px 44px 48px;">
    <p style="margin:0 0 14px;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#9FBEF0;font-weight:700;">{{eyebrow}}</p>
    <h1 style="margin:0 0 18px;font-size:34px;line-height:1.15;color:#ffffff;font-weight:700;letter-spacing:-0.5px;">{{headline}}</h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#C9DCF7;max-width:480px;">{{description}}</p>
  </td></tr></table>
</td></tr>`
    },
    {
      id: "blk_dates",
      type: "dates_split_card",
      label: "Dates split card",
      props: {
        open_label: "Window Opens",
        open_date: "May 28, 2026",
        close_label: "Closes",
        close_date: "June 14, 2026 · 11:59 PM",
        urgency_bg: "#FFF7E6"
      },
      propTypes: {
        open_label: "text",
        open_date: "text",
        close_label: "text",
        close_date: "text",
        urgency_bg: "color"
      },
      html_template: `<tr><td style="padding:40px 44px 8px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E5E9EE;border-radius:6px;">
    <tr>
      <td width="50%" style="padding:22px 24px;border-right:1px solid #E5E9EE;">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#6B7785;font-weight:700;">{{open_label}}</p>
        <p style="margin:0;font-size:17px;color:#0A2540;font-weight:700;">{{open_date}}</p>
      </td>
      <td width="50%" style="padding:22px 24px;background-color:{{urgency_bg}};">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#9A6B00;font-weight:700;">{{close_label}}</p>
        <p style="margin:0;font-size:17px;color:#0A2540;font-weight:700;">{{close_date}}</p>
      </td>
    </tr>
  </table>
</td></tr>`
    },
    {
      id: "blk_features",
      type: "feature_list_with_icons",
      label: "Feature list with icons",
      props: {
        heading: "What’s new this year",
        feature_1_title: "Expanded mental health coverage",
        feature_1_desc: "Up to 24 therapy sessions per year, fully covered, in-network.",
        feature_2_title: "Higher 401(k) match",
        feature_2_desc: "Ori now matches 100% on the first 6% of contributions.",
        feature_3_title: "Family-building support",
        feature_3_desc: "$25,000 lifetime benefit covering fertility, surrogacy, and adoption.",
        icon_bg: "#E8F0FE",
        icon_color: "#2E6BE6"
      },
      propTypes: {
        heading: "text",
        feature_1_title: "text",
        feature_1_desc: "longtext",
        feature_2_title: "text",
        feature_2_desc: "longtext",
        feature_3_title: "text",
        feature_3_desc: "longtext",
        icon_bg: "color",
        icon_color: "color"
      },
      html_template: `<tr><td style="padding:32px 44px 8px;">
  <h2 style="margin:0 0 18px;font-size:18px;color:#0A2540;font-weight:700;letter-spacing:-0.2px;">{{heading}}</h2>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="padding:14px 0;border-bottom:1px solid #EEF1F5;">
      <table width="100%"><tr>
        <td width="44" valign="top"><div style="width:32px;height:32px;border-radius:6px;background-color:{{icon_bg}};color:{{icon_color}};font-size:14px;font-weight:700;text-align:center;line-height:32px;">+</div></td>
        <td><p style="margin:0 0 4px;font-size:15px;color:#0A2540;font-weight:600;">{{feature_1_title}}</p>
        <p style="margin:0;font-size:14px;color:#5A6675;line-height:1.5;">{{feature_1_desc}}</p></td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:14px 0;border-bottom:1px solid #EEF1F5;">
      <table width="100%"><tr>
        <td width="44" valign="top"><div style="width:32px;height:32px;border-radius:6px;background-color:{{icon_bg}};color:{{icon_color}};font-size:14px;font-weight:700;text-align:center;line-height:32px;">+</div></td>
        <td><p style="margin:0 0 4px;font-size:15px;color:#0A2540;font-weight:600;">{{feature_2_title}}</p>
        <p style="margin:0;font-size:14px;color:#5A6675;line-height:1.5;">{{feature_2_desc}}</p></td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:14px 0;">
      <table width="100%"><tr>
        <td width="44" valign="top"><div style="width:32px;height:32px;border-radius:6px;background-color:{{icon_bg}};color:{{icon_color}};font-size:14px;font-weight:700;text-align:center;line-height:32px;">+</div></td>
        <td><p style="margin:0 0 4px;font-size:15px;color:#0A2540;font-weight:600;">{{feature_3_title}}</p>
        <p style="margin:0;font-size:14px;color:#5A6675;line-height:1.5;">{{feature_3_desc}}</p></td>
      </tr></table>
    </td></tr>
  </table>
</td></tr>`
    },
    {
      id: "blk_cta",
      type: "dual_cta_gradient",
      label: "Dual CTA (gradient + text link)",
      props: {
        primary_label: "Start enrollment →",
        primary_url: "#",
        secondary_label: "Compare plans",
        secondary_url: "#",
        help_text: "Need help deciding? Drop into one of our daily Benefits Office Hours, hosted live every weekday at 12:00 PM ET through June 14."
      },
      propTypes: {
        primary_label: "text",
        primary_url: "link_url",
        secondary_label: "text",
        secondary_url: "link_url",
        help_text: "longtext"
      },
      html_template: `<tr><td style="padding:32px 44px 44px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="background:linear-gradient(135deg,#0A2540,#2E6BE6);border-radius:6px;padding-right:10px;">
      <a href="{{primary_url}}" style="display:inline-block;padding:14px 30px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">{{primary_label}}</a>
    </td>
    <td width="14"></td>
    <td><a href="{{secondary_url}}" style="display:inline-block;padding:14px 6px;font-size:14px;font-weight:600;color:#2E6BE6;text-decoration:none;letter-spacing:0.3px;">{{secondary_label}}</a></td>
  </tr></table>
  <p style="margin:24px 0 0;font-size:13px;color:#6B7785;line-height:1.6;">{{help_text}}</p>
</td></tr>`
    },
    {
      id: "blk_footer",
      type: "ori_footer_with_email",
      label: "Footer with contact email",
      locked: true,
      props: {
        company_address: "Ori Inc. · 200 Madison Avenue, New York, NY 10016",
        contact_email: "benefits@ori.com",
        notice_text: "Internal communication for Ori employees."
      },
      propTypes: {
        company_address: "text",
        contact_email: "text",
        notice_text: "text"
      },
      html_template: `<tr><td style="padding:24px 44px;background-color:#F4F6F8;border-top:1px solid #E5E9EE;">
  <p style="margin:0 0 6px;font-size:12px;color:#6B7785;line-height:1.5;">{{company_address}}</p>
  <p style="margin:0;font-size:12px;color:#6B7785;line-height:1.5;">Questions? <a href="mailto:{{contact_email}}" style="color:#2E6BE6;text-decoration:none;">{{contact_email}}</a> · {{notice_text}}</p>
</td></tr>`
    }
  ]
};
