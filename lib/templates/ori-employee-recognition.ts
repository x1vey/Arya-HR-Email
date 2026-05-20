import type { Template } from "@/lib/blocks/types";

/**
 * Reverse-engineered from Ori's "Employee Recognition" email template.
 *
 * Design DNA: Ori Modern wrapper (640px, 8px radius, box-shadow, #EEF1F5 bg).
 * Features a dark gradient hero with centered text, a featured award card with
 * blue left border, a recipient list with avatar initials, and a dark CTA
 * button. Header shows ORI + department. Footer is internal-only notice.
 *
 * Ideal for: quarterly recognition awards, employee spotlight, peer-nominated
 * awards, team excellence programs.
 */
export const oriEmployeeRecognitionTemplate: Template = {
  id: "tpl_ori_recognition_v1",
  name: "Employee Recognition",
  category: "hr",
  variables: [
    { key: "company.name", label: "Company name", sample: "Ori", required: true },
    { key: "quarter.label", label: "Quarter label", sample: "Q2 2026", required: true },
    { key: "recognition.bonus_amount", label: "Recognition bonus amount", sample: "$1,500", required: false }
  ],
  wrapper_html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Employee Recognition</title>
</head>
<body style="margin:0;padding:0;background-color:#EEF1F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;font-size:1px;line-height:1px;">Celebrating this quarter's {{company.name}} Excellence Award recipients across the company.</span>
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
      label: "Ori header (department)",
      locked: true,
      props: {
        brand_name: "ORI",
        department_label: "People & Culture"
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
      type: "hero_gradient_centered",
      label: "Dark gradient hero, centered text",
      props: {
        eyebrow: "Q2 2026 · Excellence Awards",
        headline: "People who moved Ori<br>forward this quarter",
        subtitle: "Nominated by peers. Recognized by all of us.",
        gradient_from: "#0A2540",
        gradient_to: "#13355C"
      },
      propTypes: {
        eyebrow: "text",
        headline: "longtext",
        subtitle: "text",
        gradient_from: "color",
        gradient_to: "color"
      },
      html_template: `<tr><td style="padding:0;background:linear-gradient(160deg,{{gradient_from}} 0%,{{gradient_to}} 100%);">
  <table width="100%"><tr><td style="padding:60px 44px 52px;text-align:center;">
    <p style="margin:0 0 14px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9FBEF0;font-weight:700;">{{eyebrow}}</p>
    <h1 style="margin:0 0 14px;font-size:36px;line-height:1.15;color:#ffffff;font-weight:700;letter-spacing:-0.6px;">{{headline}}</h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#C9DCF7;">{{subtitle}}</p>
  </td></tr></table>
</td></tr>`
    },
    {
      id: "blk_featured",
      type: "featured_award_card",
      label: "Featured recipient with blue left border",
      props: {
        award_label: "Award of the Quarter",
        recipient_name_role: "Sofia Reyes — Senior Platform Engineer",
        description: "Sofia led the migration of our authentication platform with zero downtime, mentored four engineers through the rollout, and personally fielded support escalations across two time zones during launch week.",
        nomination_quote: "“Sofia didn’t just ship — she made everyone around her better.” — nominated by the Platform team",
        accent_color: "#2E6BE6"
      },
      propTypes: {
        award_label: "text",
        recipient_name_role: "text",
        description: "longtext",
        nomination_quote: "longtext",
        accent_color: "color"
      },
      html_template: `<tr><td style="padding:40px 44px 8px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F4F6F8;border-radius:8px;border-left:4px solid {{accent_color}};">
    <tr><td style="padding:28px 28px 24px;">
      <p style="margin:0 0 10px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:{{accent_color}};font-weight:700;">{{award_label}}</p>
      <h2 style="margin:0 0 12px;font-size:22px;color:#0A2540;font-weight:700;letter-spacing:-0.3px;">{{recipient_name_role}}</h2>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#3C4858;">{{description}}</p>
      <p style="margin:0;font-size:13px;font-style:italic;color:#5A6675;line-height:1.5;">{{nomination_quote}}</p>
    </td></tr>
  </table>
</td></tr>`
    },
    {
      id: "blk_recipients",
      type: "recipient_list_with_avatars",
      label: "Section heading + 4 recipient rows with initials avatars",
      props: {
        heading: "Excellence Award recipients",
        r1_initials: "JT",
        r1_name_dept: "James Tanaka · Customer Success",
        r1_desc: "Saved a top-10 account through 6 weeks of dedicated white-glove onboarding.",
        r2_initials: "PA",
        r2_name_dept: "Priya Anand · Design",
        r2_desc: "Reimagined our onboarding flow, lifting activation by 18% in one release.",
        r3_initials: "MO",
        r3_name_dept: "Marcus Okonkwo · Finance",
        r3_desc: "Closed the books two days early three quarters running — a quiet but huge win.",
        r4_initials: "EL",
        r4_name_dept: "Elena Lindqvist · Marketing",
        r4_desc: "Launched our annual industry report — our highest-engagement campaign ever.",
        avatar_gradient_from: "#2E6BE6",
        avatar_gradient_to: "#5B8FF5"
      },
      propTypes: {
        heading: "text",
        r1_initials: "text",
        r1_name_dept: "text",
        r1_desc: "text",
        r2_initials: "text",
        r2_name_dept: "text",
        r2_desc: "text",
        r3_initials: "text",
        r3_name_dept: "text",
        r3_desc: "text",
        r4_initials: "text",
        r4_name_dept: "text",
        r4_desc: "text",
        avatar_gradient_from: "color",
        avatar_gradient_to: "color"
      },
      html_template: `<tr><td style="padding:32px 44px 8px;">
  <h2 style="margin:0 0 20px;font-size:18px;color:#0A2540;font-weight:700;letter-spacing:-0.2px;">{{heading}}</h2>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom:1px solid #EEF1F5;">
    <tr><td style="padding:16px 0;">
      <table width="100%"><tr>
        <td width="48" valign="middle"><div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,{{avatar_gradient_from}},{{avatar_gradient_to}});color:#ffffff;font-size:14px;font-weight:700;text-align:center;line-height:40px;">{{r1_initials}}</div></td>
        <td><p style="margin:0 0 2px;font-size:15px;color:#0A2540;font-weight:600;">{{r1_name_dept}}</p>
        <p style="margin:0;font-size:13px;color:#5A6675;line-height:1.5;">{{r1_desc}}</p></td>
      </tr></table>
    </td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom:1px solid #EEF1F5;">
    <tr><td style="padding:16px 0;">
      <table width="100%"><tr>
        <td width="48" valign="middle"><div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,{{avatar_gradient_from}},{{avatar_gradient_to}});color:#ffffff;font-size:14px;font-weight:700;text-align:center;line-height:40px;">{{r2_initials}}</div></td>
        <td><p style="margin:0 0 2px;font-size:15px;color:#0A2540;font-weight:600;">{{r2_name_dept}}</p>
        <p style="margin:0;font-size:13px;color:#5A6675;line-height:1.5;">{{r2_desc}}</p></td>
      </tr></table>
    </td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom:1px solid #EEF1F5;">
    <tr><td style="padding:16px 0;">
      <table width="100%"><tr>
        <td width="48" valign="middle"><div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,{{avatar_gradient_from}},{{avatar_gradient_to}});color:#ffffff;font-size:14px;font-weight:700;text-align:center;line-height:40px;">{{r3_initials}}</div></td>
        <td><p style="margin:0 0 2px;font-size:15px;color:#0A2540;font-weight:600;">{{r3_name_dept}}</p>
        <p style="margin:0;font-size:13px;color:#5A6675;line-height:1.5;">{{r3_desc}}</p></td>
      </tr></table>
    </td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="padding:16px 0 4px;">
      <table width="100%"><tr>
        <td width="48" valign="middle"><div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,{{avatar_gradient_from}},{{avatar_gradient_to}});color:#ffffff;font-size:14px;font-weight:700;text-align:center;line-height:40px;">{{r4_initials}}</div></td>
        <td><p style="margin:0 0 2px;font-size:15px;color:#0A2540;font-weight:600;">{{r4_name_dept}}</p>
        <p style="margin:0;font-size:13px;color:#5A6675;line-height:1.5;">{{r4_desc}}</p></td>
      </tr></table>
    </td></tr>
  </table>
</td></tr>`
    },
    {
      id: "blk_cta",
      type: "cta_with_note",
      label: "CTA button + note paragraph",
      props: {
        label: "Nominate someone for Q3",
        url: "#",
        button_color: "#0A2540",
        note_text: "Each recipient receives a {{recognition.bonus_amount}} recognition bonus and an extra day off. Congratulations to all — and thank you to every nominator."
      },
      propTypes: {
        label: "text",
        url: "link_url",
        button_color: "color",
        note_text: "longtext"
      },
      html_template: `<tr><td style="padding:32px 44px 44px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="background-color:{{button_color}};border-radius:6px;">
      <a href="{{url}}" style="display:inline-block;padding:14px 30px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">{{label}}</a>
    </td>
  </tr></table>
  <p style="margin:24px 0 0;font-size:13px;color:#6B7785;line-height:1.6;">{{note_text}}</p>
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
      html_template: `<tr><td style="padding:24px 44px;background-color:#F4F6F8;border-top:1px solid #E5E9EE;">
  <p style="margin:0 0 6px;font-size:12px;color:#6B7785;line-height:1.5;">{{company_address}}</p>
  <p style="margin:0;font-size:12px;color:#6B7785;line-height:1.5;">{{notice_text}}</p>
</td></tr>`
    }
  ]
};
