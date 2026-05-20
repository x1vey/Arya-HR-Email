import type { Template } from "@/lib/blocks/types";

/**
 * Reverse-engineered from Ori's "Town Hall Recap" email template.
 *
 * Design DNA: Ori Modern wrapper (640px, 8px radius, box-shadow, #EEF1F5 bg).
 * Light intro section (no gradient hero), 3-column dark stat cards, left-bordered
 * takeaway cards, Q&A list, and dual CTAs (dark button + text link). Header
 * shows ORI + department. Footer includes contact email.
 *
 * Ideal for: town hall recaps, all-hands summaries, meeting follow-ups,
 * quarterly review digests, leadership AMA recaps.
 */
export const oriTownHallRecapTemplate: Template = {
  id: "tpl_ori_townhall_v1",
  name: "Town Hall Recap",
  category: "corporate",
  variables: [
    { key: "company.name", label: "Company name", sample: "Ori", required: true },
    { key: "event.name", label: "Event name", sample: "Town Hall", required: true },
    { key: "event.date", label: "Event date", sample: "May 13", required: true },
    { key: "event.next_date", label: "Next event date", sample: "Thursday, August 14, 2026", required: false }
  ],
  wrapper_html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Town Hall Recap</title>
</head>
<body style="margin:0;padding:0;background-color:#EEF1F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;font-size:1px;line-height:1px;">A 5-minute recap of last week's {{event.name}}, the questions you asked, and what's next.</span>
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
        department_label: "Internal Comms"
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
      id: "blk_intro",
      type: "recap_intro",
      label: "Eyebrow + headline + intro paragraph",
      props: {
        eyebrow: "Town Hall · May 13 Recap",
        headline: "A 5-minute read on what we covered.",
        intro_text: "Thank you to the 1,247 of you who joined live and the many who sent questions ahead. Here’s the recap, the answers we promised, and what’s coming next.",
        accent_color: "#2E6BE6"
      },
      propTypes: {
        eyebrow: "text",
        headline: "longtext",
        intro_text: "longtext",
        accent_color: "color"
      },
      html_template: `<tr><td style="padding:48px 44px 8px;">
  <p style="margin:0 0 14px;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:{{accent_color}};font-weight:700;">{{eyebrow}}</p>
  <h1 style="margin:0 0 18px;font-size:32px;line-height:1.18;color:#0A2540;font-weight:700;letter-spacing:-0.5px;">{{headline}}</h1>
  <p style="margin:0 0 8px;font-size:15px;line-height:1.65;color:#3C4858;">{{intro_text}}</p>
</td></tr>`
    },
    {
      id: "blk_stats",
      type: "stats_three_dark_rounded",
      label: "3 dark rounded stat cards",
      props: {
        stat1_label: "Attendees",
        stat1_value: "1,247",
        stat2_label: "Questions",
        stat2_value: "94",
        stat3_label: "CSAT",
        stat3_value: "4.7 / 5",
        gradient_from: "#0A2540",
        gradient_to: "#13355C"
      },
      propTypes: {
        stat1_label: "text",
        stat1_value: "text",
        stat2_label: "text",
        stat2_value: "text",
        stat3_label: "text",
        stat3_value: "text",
        gradient_from: "color",
        gradient_to: "color"
      },
      html_template: `<tr><td style="padding:32px 44px 8px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td width="33%" style="padding:22px 16px;background:linear-gradient(180deg,{{gradient_from}},{{gradient_to}});border-radius:8px;text-align:center;">
        <p style="margin:0 0 6px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#9FBEF0;font-weight:700;">{{stat1_label}}</p>
        <p style="margin:0;font-size:24px;color:#ffffff;font-weight:700;letter-spacing:-0.3px;">{{stat1_value}}</p>
      </td>
      <td width="2%"></td>
      <td width="33%" style="padding:22px 16px;background:linear-gradient(180deg,{{gradient_from}},{{gradient_to}});border-radius:8px;text-align:center;">
        <p style="margin:0 0 6px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#9FBEF0;font-weight:700;">{{stat2_label}}</p>
        <p style="margin:0;font-size:24px;color:#ffffff;font-weight:700;letter-spacing:-0.3px;">{{stat2_value}}</p>
      </td>
      <td width="2%"></td>
      <td width="33%" style="padding:22px 16px;background:linear-gradient(180deg,{{gradient_from}},{{gradient_to}});border-radius:8px;text-align:center;">
        <p style="margin:0 0 6px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#9FBEF0;font-weight:700;">{{stat3_label}}</p>
        <p style="margin:0;font-size:24px;color:#ffffff;font-weight:700;letter-spacing:-0.3px;">{{stat3_value}}</p>
      </td>
    </tr>
  </table>
</td></tr>`
    },
    {
      id: "blk_takeaways",
      type: "takeaway_cards_three",
      label: "Section heading + 3 left-bordered cards",
      props: {
        heading: "Three things to remember",
        card_1_label: "01 · Strategy",
        card_1_text: "We’re doubling down on the enterprise segment in H2, with focused investment in onboarding, security, and partner integrations.",
        card_2_label: "02 · Product",
        card_2_text: "Three flagship features land in Q3: AI Copilot for analytics, native SSO/SCIM provisioning, and the new Insights API.",
        card_3_label: "03 · People",
        card_3_text: "Hiring continues at a measured pace, with a focus on senior engineers, enterprise account executives, and customer architects.",
        accent_color: "#2E6BE6"
      },
      propTypes: {
        heading: "text",
        card_1_label: "text",
        card_1_text: "longtext",
        card_2_label: "text",
        card_2_text: "longtext",
        card_3_label: "text",
        card_3_text: "longtext",
        accent_color: "color"
      },
      html_template: `<tr><td style="padding:36px 44px 8px;">
  <h2 style="margin:0 0 18px;font-size:18px;color:#0A2540;font-weight:700;letter-spacing:-0.2px;">{{heading}}</h2>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:3px solid {{accent_color}};background-color:#F4F6F8;border-radius:0 6px 6px 0;margin:0 0 14px;">
    <tr><td style="padding:18px 22px;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:{{accent_color}};font-weight:700;">{{card_1_label}}</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#3C4858;">{{card_1_text}}</p>
    </td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:3px solid {{accent_color}};background-color:#F4F6F8;border-radius:0 6px 6px 0;margin:0 0 14px;">
    <tr><td style="padding:18px 22px;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:{{accent_color}};font-weight:700;">{{card_2_label}}</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#3C4858;">{{card_2_text}}</p>
    </td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:3px solid {{accent_color}};background-color:#F4F6F8;border-radius:0 6px 6px 0;">
    <tr><td style="padding:18px 22px;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:{{accent_color}};font-weight:700;">{{card_3_label}}</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#3C4858;">{{card_3_text}}</p>
    </td></tr>
  </table>
</td></tr>`
    },
    {
      id: "blk_qa",
      type: "qa_list",
      label: "\"Top questions, answered\" heading + 3 Q&A pairs",
      props: {
        heading: "Top questions, answered",
        q1: "Will the bonus structure change for 2026?",
        a1: "No — bonus targets and timing remain the same. Performance ratings will continue to drive payout multipliers.",
        q2: "How will AI Copilot affect my role?",
        a2: "It’s a tool to amplify your work, not replace it. Enablement workshops begin in Q3 for every team.",
        q3: "When is the next town hall?",
        a3: "Thursday, August 14, 2026 at 10:00 AM ET. Calendar invites are already in your inbox."
      },
      propTypes: {
        heading: "text",
        q1: "text",
        a1: "longtext",
        q2: "text",
        a2: "longtext",
        q3: "text",
        a3: "longtext"
      },
      html_template: `<tr><td style="padding:32px 44px 8px;">
  <h2 style="margin:0 0 14px;font-size:18px;color:#0A2540;font-weight:700;letter-spacing:-0.2px;">{{heading}}</h2>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="padding:14px 0;border-bottom:1px solid #EEF1F5;">
      <p style="margin:0 0 6px;font-size:14px;color:#0A2540;font-weight:600;">{{q1}}</p>
      <p style="margin:0;font-size:13px;color:#5A6675;line-height:1.55;">{{a1}}</p>
    </td></tr>
    <tr><td style="padding:14px 0;border-bottom:1px solid #EEF1F5;">
      <p style="margin:0 0 6px;font-size:14px;color:#0A2540;font-weight:600;">{{q2}}</p>
      <p style="margin:0;font-size:13px;color:#5A6675;line-height:1.55;">{{a2}}</p>
    </td></tr>
    <tr><td style="padding:14px 0;">
      <p style="margin:0 0 6px;font-size:14px;color:#0A2540;font-weight:600;">{{q3}}</p>
      <p style="margin:0;font-size:13px;color:#5A6675;line-height:1.55;">{{a3}}</p>
    </td></tr>
  </table>
</td></tr>`
    },
    {
      id: "blk_cta",
      type: "dual_cta_dark",
      label: "Dark button + text link",
      props: {
        primary_label: "Watch the recording",
        primary_url: "#",
        secondary_label: "View slides →",
        secondary_url: "#"
      },
      propTypes: {
        primary_label: "text",
        primary_url: "link_url",
        secondary_label: "text",
        secondary_url: "link_url"
      },
      html_template: `<tr><td style="padding:32px 44px 44px;">
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
      label: "Footer (with contact email)",
      locked: true,
      props: {
        company_address: "Ori Inc. · 200 Madison Avenue, New York, NY 10016",
        department_label: "Internal Communications",
        contact_email: "comms@ori.com"
      },
      propTypes: {
        company_address: "text",
        department_label: "text",
        contact_email: "text"
      },
      html_template: `<tr><td style="padding:24px 44px;background-color:#F4F6F8;border-top:1px solid #E5E9EE;">
  <p style="margin:0 0 6px;font-size:12px;color:#6B7785;line-height:1.5;">{{company_address}}</p>
  <p style="margin:0;font-size:12px;color:#6B7785;line-height:1.5;">{{department_label}} · <a href="mailto:{{contact_email}}" style="color:#2E6BE6;text-decoration:none;">{{contact_email}}</a></p>
</td></tr>`
    }
  ]
};
