import type { Template } from "@/lib/blocks/types";

/**
 * Reverse-engineered from a hand-crafted Day-1 onboarding email.
 *
 * This template intentionally uses a *different* visual language than the
 * birthday template — clean, professional, blue accent — to demonstrate
 * that the block library scales with templates rather than constraining
 * them. Both templates can coexist with their own design DNA.
 *
 * The "checklist" block is unique to this template (and reusable in other
 * onboarding emails). It shows how a custom block type emerges naturally
 * from the source HTML.
 */
export const onboardingDay1Template: Template = {
  id: "tpl_onboarding_day1_v1",
  name: "Onboarding — Day 1",
  category: "onboarding",
  variables: [
    { key: "employee.first_name", label: "Employee first name", sample: "Arjun", required: true },
    { key: "company.name", label: "Company name", sample: "Acme Inc", required: true },
    { key: "manager.first_name", label: "Manager first name", sample: "Sara", required: true },
    { key: "links.it_setup", label: "IT setup link", sample: "https://acme.com/it/setup", required: false },
    { key: "links.buddy", label: "Buddy intro link", sample: "https://acme.com/buddy/arjun", required: false },
    { key: "links.handbook", label: "Handbook link", sample: "https://acme.com/handbook", required: false }
  ],
  wrapper_html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Welcome to {{company.name}}!</title>
</head>
<body style="margin:0;padding:0;background:#EFF6FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EFF6FF;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;border-radius:8px;overflow:hidden;border:1px solid #DBEAFE;">
      {{__blocks__}}
    </table>
  </td></tr>
</table>
</body>
</html>`,
  blocks: [
    {
      id: "blk_header",
      type: "header_solid",
      label: "Header (solid accent)",
      locked: true,
      props: {
        company_name: "{{company.name}}",
        background_color: "#1D4ED8",
        text_color: "#FFFFFF"
      },
      propTypes: {
        company_name: "text",
        background_color: "color",
        text_color: "color"
      },
      html_template: `<tr><td style="background:{{background_color}};padding:24px 32px;">
  <p style="margin:0;font-size:14px;font-weight:600;letter-spacing:1px;color:{{text_color}};text-transform:uppercase;">{{company_name}}</p>
</td></tr>`
    },
    {
      id: "blk_hero",
      type: "hero_welcome",
      label: "Welcome hero",
      props: {
        headline: "Welcome aboard, {{employee.first_name}}!",
        subhead: "We're thrilled you're joining the team. Here's everything you need to crush day one."
      },
      propTypes: {
        headline: "longtext",
        subhead: "longtext"
      },
      html_template: `<tr><td style="padding:40px 32px 16px 32px;">
  <h1 style="margin:0 0 12px 0;font-size:28px;line-height:1.3;color:#0F172A;font-weight:700;">{{headline}}</h1>
  <p style="margin:0;font-size:16px;line-height:1.6;color:#475569;">{{subhead}}</p>
</td></tr>`
    },
    {
      id: "blk_checklist",
      type: "checklist",
      label: "Day-1 checklist",
      props: {
        title: "Your Day 1 checklist",
        item_1: "Set up your laptop and 2FA",
        link_1: "{{links.it_setup}}",
        item_2: "Meet your onboarding buddy",
        link_2: "{{links.buddy}}",
        item_3: "Read the company handbook",
        link_3: "{{links.handbook}}",
        accent_color: "#1D4ED8"
      },
      propTypes: {
        title: "text",
        item_1: "text",
        link_1: "link_url",
        item_2: "text",
        link_2: "link_url",
        item_3: "text",
        link_3: "link_url",
        accent_color: "color"
      },
      html_template: `<tr><td style="padding:16px 32px 32px 32px;">
  <h3 style="margin:0 0 16px 0;font-size:14px;font-weight:600;letter-spacing:0.5px;color:#64748B;text-transform:uppercase;">{{title}}</h3>
  <table cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td style="padding:12px 0;border-bottom:1px solid #E2E8F0;">
      <a href="{{link_1}}" style="color:{{accent_color}};text-decoration:none;font-size:16px;font-weight:500;">→ {{item_1}}</a>
    </td></tr>
    <tr><td style="padding:12px 0;border-bottom:1px solid #E2E8F0;">
      <a href="{{link_2}}" style="color:{{accent_color}};text-decoration:none;font-size:16px;font-weight:500;">→ {{item_2}}</a>
    </td></tr>
    <tr><td style="padding:12px 0;">
      <a href="{{link_3}}" style="color:{{accent_color}};text-decoration:none;font-size:16px;font-weight:500;">→ {{item_3}}</a>
    </td></tr>
  </table>
</td></tr>`
    },
    {
      id: "blk_manager_note",
      type: "manager_note",
      label: "Note from your manager",
      props: {
        note: "{{manager.first_name}} (your manager) will reach out today to schedule your first 1:1. In the meantime, take it easy and explore at your own pace.",
        background_color: "#F1F5F9"
      },
      propTypes: {
        note: "longtext",
        background_color: "color"
      },
      html_template: `<tr><td style="padding:0 32px 32px 32px;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:{{background_color}};border-radius:6px;">
    <tr><td style="padding:20px 24px;">
      <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">{{note}}</p>
    </td></tr>
  </table>
</td></tr>`
    },
    {
      id: "blk_footer",
      type: "footer_minimal",
      label: "Footer",
      locked: true,
      props: {
        text: "Sent with care by the {{company.name}} People team"
      },
      propTypes: {
        text: "text"
      },
      html_template: `<tr><td style="padding:24px 32px;border-top:1px solid #E2E8F0;text-align:center;">
  <p style="margin:0;font-size:12px;color:#94A3B8;">{{text}}</p>
</td></tr>`
    }
  ]
};
