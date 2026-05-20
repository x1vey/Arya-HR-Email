import type { Template } from "@/lib/blocks/types";

/**
 * Reverse-engineered from Ori's "Office Relocation" email template.
 *
 * Design DNA: Ori Modern wrapper (640px, 8px radius, box-shadow, #EEF1F5 bg).
 * Features a 3-stop gradient hero with an inset detail card (move date + address),
 * a 2x2 feature grid, a timeline of key dates, and dual CTAs (gradient button +
 * text link). Header shows ORI + department. Footer includes contact email.
 *
 * Ideal for: office moves, workspace changes, facility upgrades, regional
 * relocations, hybrid workspace announcements.
 */
export const oriOfficeRelocationTemplate: Template = {
  id: "tpl_ori_relocation_v1",
  name: "Office Relocation",
  category: "operations",
  variables: [
    { key: "company.name", label: "Company name", sample: "Ori", required: true },
    { key: "office.city", label: "Office city", sample: "London", required: true },
    { key: "office.new_address", label: "New office address", sample: "42 Curtain Road, Shoreditch, EC2A 3PT", required: true },
    { key: "office.move_date", label: "Move-in date", sample: "Monday, July 7, 2026", required: true }
  ],
  wrapper_html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Office Relocation</title>
</head>
<body style="margin:0;padding:0;background-color:#EEF1F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;font-size:1px;line-height:1px;">Our {{office.city}} team is moving to a new home on {{office.move_date}}. Here's everything you need to know.</span>
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
        department_label: "Workplace · EMEA"
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
      type: "hero_gradient_with_details",
      label: "Gradient hero with eyebrow, headline, description, and details card",
      props: {
        eyebrow: "Office Relocation · London",
        headline: "A new home for our<br>London team.",
        description: "After four great years in King’s Cross, we’re moving to a larger, brighter space in Shoreditch — closer to our customers and to the city’s tech community.",
        detail_1_label: "Move-in date",
        detail_1_value: "Monday, July 7, 2026",
        detail_2_label: "New address",
        detail_2_value: "42 Curtain Road, Shoreditch, EC2A 3PT",
        gradient_from: "#0A2540",
        gradient_via: "#1B3D6B",
        gradient_to: "#2E6BE6"
      },
      propTypes: {
        eyebrow: "text",
        headline: "longtext",
        description: "longtext",
        detail_1_label: "text",
        detail_1_value: "text",
        detail_2_label: "text",
        detail_2_value: "text",
        gradient_from: "color",
        gradient_via: "color",
        gradient_to: "color"
      },
      html_template: `<tr><td style="padding:0;background:linear-gradient(135deg,{{gradient_from}} 0%,{{gradient_via}} 50%,{{gradient_to}} 100%);">
  <table width="100%"><tr><td style="padding:56px 44px 52px;">
    <p style="margin:0 0 14px;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#9FBEF0;font-weight:700;">{{eyebrow}}</p>
    <h1 style="margin:0 0 18px;font-size:34px;line-height:1.15;color:#ffffff;font-weight:700;letter-spacing:-0.5px;">{{headline}}</h1>
    <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#C9DCF7;max-width:480px;">{{description}}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:rgba(255,255,255,0.10);border-radius:6px;border:1px solid rgba(255,255,255,0.18);">
      <tr>
        <td style="padding:18px 22px;border-right:1px solid rgba(255,255,255,0.18);">
          <p style="margin:0 0 4px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#9FBEF0;font-weight:700;">{{detail_1_label}}</p>
          <p style="margin:0;font-size:16px;color:#ffffff;font-weight:700;">{{detail_1_value}}</p>
        </td>
        <td style="padding:18px 22px;">
          <p style="margin:0 0 4px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#9FBEF0;font-weight:700;">{{detail_2_label}}</p>
          <p style="margin:0;font-size:16px;color:#ffffff;font-weight:700;">{{detail_2_value}}</p>
        </td>
      </tr>
    </table>
  </td></tr></table>
</td></tr>`
    },
    {
      id: "blk_features",
      type: "feature_grid_2x2",
      label: "\"What to expect\" heading + 4 feature cards",
      props: {
        heading: "What to expect",
        f1_title: "More space",
        f1_desc: "Capacity for 220 people, dedicated quiet zones, and three new client-meeting suites.",
        f2_title: "Better connected",
        f2_desc: "3 minutes from Old Street Station, 8 minutes from Liverpool Street.",
        f3_title: "Designed for hybrid",
        f3_desc: "Bookable desks, full A/V in every room, and a rooftop terrace for the team.",
        f4_title: "Sustainable build",
        f4_desc: "BREEAM Excellent rating, all-electric, with cycle storage and showers.",
        accent_color: "#2E6BE6"
      },
      propTypes: {
        heading: "text",
        f1_title: "text",
        f1_desc: "text",
        f2_title: "text",
        f2_desc: "text",
        f3_title: "text",
        f3_desc: "text",
        f4_title: "text",
        f4_desc: "text",
        accent_color: "color"
      },
      html_template: `<tr><td style="padding:40px 44px 8px;">
  <h2 style="margin:0 0 20px;font-size:18px;color:#0A2540;font-weight:700;letter-spacing:-0.2px;">{{heading}}</h2>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td width="48%" valign="top" style="padding:18px 20px;background-color:#F4F6F8;border-radius:6px;">
        <p style="margin:0 0 8px;font-size:13px;color:{{accent_color}};font-weight:700;letter-spacing:0.3px;">{{f1_title}}</p>
        <p style="margin:0;font-size:14px;color:#3C4858;line-height:1.55;">{{f1_desc}}</p>
      </td>
      <td width="4%"></td>
      <td width="48%" valign="top" style="padding:18px 20px;background-color:#F4F6F8;border-radius:6px;">
        <p style="margin:0 0 8px;font-size:13px;color:{{accent_color}};font-weight:700;letter-spacing:0.3px;">{{f2_title}}</p>
        <p style="margin:0;font-size:14px;color:#3C4858;line-height:1.55;">{{f2_desc}}</p>
      </td>
    </tr>
    <tr><td colspan="3" height="14"></td></tr>
    <tr>
      <td width="48%" valign="top" style="padding:18px 20px;background-color:#F4F6F8;border-radius:6px;">
        <p style="margin:0 0 8px;font-size:13px;color:{{accent_color}};font-weight:700;letter-spacing:0.3px;">{{f3_title}}</p>
        <p style="margin:0;font-size:14px;color:#3C4858;line-height:1.55;">{{f3_desc}}</p>
      </td>
      <td width="4%"></td>
      <td width="48%" valign="top" style="padding:18px 20px;background-color:#F4F6F8;border-radius:6px;">
        <p style="margin:0 0 8px;font-size:13px;color:{{accent_color}};font-weight:700;letter-spacing:0.3px;">{{f4_title}}</p>
        <p style="margin:0;font-size:14px;color:#3C4858;line-height:1.55;">{{f4_desc}}</p>
      </td>
    </tr>
  </table>
</td></tr>`
    },
    {
      id: "blk_timeline",
      type: "timeline_key_dates",
      label: "\"Key dates\" heading + 3 date rows",
      props: {
        heading: "Key dates",
        date_1: "Jun 23 — Jul 4",
        desc_1: "Phased packing; King’s Cross remains open.",
        date_2: "Jul 5 — Jul 6",
        desc_2: "Both offices closed for relocation weekend.",
        date_3: "Jul 7",
        desc_3: "Doors open in Shoreditch with breakfast at 8:30 AM.",
        date_color: "#2E6BE6"
      },
      propTypes: {
        heading: "text",
        date_1: "text",
        desc_1: "text",
        date_2: "text",
        desc_2: "text",
        date_3: "text",
        desc_3: "text",
        date_color: "color"
      },
      html_template: `<tr><td style="padding:32px 44px 8px;">
  <h2 style="margin:0 0 14px;font-size:18px;color:#0A2540;font-weight:700;letter-spacing:-0.2px;">{{heading}}</h2>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="padding:12px 0;border-bottom:1px solid #EEF1F5;">
      <table width="100%"><tr>
        <td width="130" style="font-size:13px;color:{{date_color}};font-weight:700;letter-spacing:0.3px;">{{date_1}}</td>
        <td style="font-size:14px;color:#3C4858;">{{desc_1}}</td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:12px 0;border-bottom:1px solid #EEF1F5;">
      <table width="100%"><tr>
        <td width="130" style="font-size:13px;color:{{date_color}};font-weight:700;letter-spacing:0.3px;">{{date_2}}</td>
        <td style="font-size:14px;color:#3C4858;">{{desc_2}}</td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:12px 0;">
      <table width="100%"><tr>
        <td width="130" style="font-size:13px;color:{{date_color}};font-weight:700;letter-spacing:0.3px;">{{date_3}}</td>
        <td style="font-size:14px;color:#3C4858;">{{desc_3}}</td>
      </tr></table>
    </td></tr>
  </table>
</td></tr>`
    },
    {
      id: "blk_cta",
      type: "dual_cta_gradient",
      label: "Gradient button + text link",
      props: {
        primary_label: "View the new space →",
        primary_url: "#",
        secondary_label: "Read the FAQ",
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
    <td style="background:linear-gradient(135deg,#0A2540,#2E6BE6);border-radius:6px;padding-right:10px;">
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
        department_label: "Workplace EMEA",
        contact_email: "workplace-emea@ori.com"
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
