import type { Template } from "@/lib/blocks/types";

/**
 * Reverse-engineered from the Acme SaaS long-form nurture email.
 *
 * The original HTML showed an email-client "preview chrome" (subject +
 * sender + date) above the actual email card. This is unusual — usually
 * the chrome IS the email client, not part of the design. We treat it as
 * a stylistic choice: a faux "preview pane" rendered inside the email
 * itself.
 *
 * The original snippet did not include CSS, so the styles below are
 * authored to match the apparent design intent (clean SaaS, orange accent,
 * Inter-style sans).
 *
 * Design notes on segmentation:
 *   - The 4 body paragraphs are split into logical groups (intro-2,
 *     transition-1, pre-cta-2, outro-1). HRs can rearrange these groups
 *     but not individual paragraphs. Good trade-off for the POC.
 *   - The symptom list is one block with 4 individual props (item_1..4).
 *     A repeating block primitive comes in v2.
 *
 * HR repurposing ideas:
 *   - "Letter from the CEO" to new joiners
 *   - "Mid-year reflection" personal letter
 *   - "Manager → report" 1:1 prep email
 *   - Long-form announcement (policy change, strategy update)
 */
export const salesNurtureTemplate: Template = {
  id: "tpl_sales_nurture_v1",
  name: "Long-form Letter",
  category: "personal_letter",
  variables: [
    { key: "recipient.first_name", label: "Recipient first name", sample: "Bogdan", required: true },
    { key: "sender.first_name", label: "Sender first name", sample: "Jamie", required: true },
    { key: "sender.last_name", label: "Sender last name", sample: "Morgan", required: true },
    { key: "sender.initials", label: "Sender initials (avatar)", sample: "JM", required: true },
    { key: "sender.role", label: "Sender role", sample: "Head of Customer Success", required: true },
    { key: "sender.email", label: "Sender email", sample: "jamie@acmesaas.com", required: true },
    { key: "company.name", label: "Company name", sample: "Acme SaaS", required: true },
    { key: "company.address", label: "Company address", sample: "123 Market Street, Suite 400, San Francisco, CA 94105", required: true },
    { key: "links.cta", label: "Primary CTA URL", sample: "https://acmesaas.com/scorecard", required: true },
    { key: "links.unsubscribe", label: "Unsubscribe URL", sample: "https://acmesaas.com/unsubscribe", required: true }
  ],
  wrapper_html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{company.name}}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
* { box-sizing: border-box; }
body {
  margin: 0;
  background: #eef0f3;
  padding: 40px 20px;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1f2937;
}
.frame {
  max-width: 640px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.03);
}
/* Chrome */
.chrome-block { padding: 22px 28px 16px; background: #fafbfc; border-bottom: 1px solid #eef0f3; }
.chrome-subject { font-size: 17px; font-weight: 600; color: #111827; margin: 0 0 14px; }
.chrome-meta { display: flex; align-items: center; gap: 12px; }
.chrome-avatar { width: 36px; height: 36px; border-radius: 50%; background: #1e40af; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0; }
.chrome-from { flex: 1; min-width: 0; }
.chrome-from-name { font-size: 13px; font-weight: 600; color: #111827; }
.chrome-from-addr { font-size: 12px; color: #6b7280; }
.chrome-date { font-size: 12px; color: #6b7280; white-space: nowrap; }
/* Bar */
.bar-block { height: 4px; }
/* Logo */
.logo-block { padding: 32px 48px 0; }
.email-logo { display: flex; align-items: center; gap: 10px; }
.logo-mark { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.logo-name { font-size: 14px; font-weight: 600; color: #111827; }
/* Greeting / hook */
.greeting-block { padding: 24px 48px 0; }
.greeting { font-size: 15px; color: #374151; margin: 0; }
.hook-block { padding: 14px 48px 0; }
.email-hook { font-size: 24px; font-weight: 700; line-height: 1.35; color: #111827; margin: 0; }
/* Paragraphs */
.p-block { padding: 18px 48px 0; }
.email-p { font-size: 15px; line-height: 1.7; color: #374151; margin: 0 0 16px; }
.email-p:last-child { margin-bottom: 0; }
.email-p strong { color: #111827; font-weight: 600; }
.email-p em { font-style: italic; }
/* Insight */
.insight-wrap { padding: 24px 48px 0; }
.insight-block { border-left: 3px solid #e8572a; padding: 4px 0 4px 20px; }
.insight-block p { font-style: italic; font-size: 16px; color: #1f2937; line-height: 1.55; margin: 0 0 8px; }
.insight-block span { font-size: 12px; color: #6b7280; }
/* Symptom list */
.symptom-wrap { padding: 20px 48px 0; }
.symptom-list { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 22px; }
.symptom-list-title { font-size: 11px; font-weight: 600; letter-spacing: 0.6px; color: #6b7280; text-transform: uppercase; margin: 0 0 14px; }
.symptom-item { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; color: #374151; line-height: 1.6; margin-bottom: 10px; }
.symptom-item:last-child { margin-bottom: 0; }
.symptom-dot { width: 6px; height: 6px; border-radius: 50%; background: #e8572a; flex-shrink: 0; margin-top: 8px; }
/* CTA */
.cta-wrap { padding: 24px 48px 0; }
.cta-block { background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border: 1px solid #fed7aa; border-radius: 14px; padding: 28px; text-align: center; }
.cta-block-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.8px; color: #c2410c; text-transform: uppercase; margin-bottom: 8px; }
.cta-block-headline { font-size: 19px; font-weight: 700; color: #111827; margin-bottom: 6px; }
.cta-block-sub { font-size: 14px; color: #57534e; line-height: 1.6; margin-bottom: 18px; }
.cta-btn { display: inline-block; background: #1f2937; color: white; padding: 11px 26px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
.cta-note { display: block; font-size: 12px; color: #78716c; margin-top: 12px; }
/* Divider */
.divider-block { padding: 24px 48px; }
.text-divider { border: none; border-top: 1px solid #e5e7eb; margin: 0; }
/* Signature */
.sig-block { padding: 8px 48px 32px; }
.sig-name { font-weight: 600; color: #111827; font-size: 15px; }
.sig-role { font-size: 13px; color: #6b7280; margin: 2px 0 14px; }
.sig-divider { border: none; border-top: 1px solid #e5e7eb; margin: 14px 0; }
.sig-ps { font-size: 13.5px; color: #4b5563; line-height: 1.65; background: #f9fafb; padding: 14px 16px; border-radius: 8px; margin: 0; }
.sig-ps strong { color: #111827; font-weight: 600; }
/* Footer */
.email-footer { padding: 22px 48px; background: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; }
.footer-links { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
.footer-links a { font-size: 12px; color: #6b7280; text-decoration: none; }
.footer-copy { font-size: 11px; color: #9ca3af; line-height: 1.6; margin: 0; }
</style>
</head>
<body>
<div class="frame">
{{__blocks__}}
</div>
</body>
</html>`,
  blocks: [
    {
      id: "blk_chrome",
      type: "client_chrome_preview",
      label: "Email-client chrome",
      locked: true,
      props: {
        subject: "Why your team is busy but your pipeline feels stuck",
        avatar_initials: "{{sender.initials}}",
        from_name: "{{sender.first_name}} {{sender.last_name}} · {{company.name}}",
        from_addr: "{{sender.email}}",
        date: "Today, 9:04 AM"
      },
      propTypes: {
        subject: "longtext",
        avatar_initials: "text",
        from_name: "text",
        from_addr: "text",
        date: "text"
      },
      html_template: `<div class="chrome-block">
<p class="chrome-subject">{{subject}}</p>
<div class="chrome-meta">
<div class="chrome-avatar">{{avatar_initials}}</div>
<div class="chrome-from">
<div class="chrome-from-name">{{from_name}}</div>
<div class="chrome-from-addr">{{from_addr}}</div>
</div>
<div class="chrome-date">{{date}}</div>
</div>
</div>`
    },
    {
      id: "blk_accent_bar",
      type: "accent_bar",
      label: "Accent bar",
      props: {
        gradient_from: "#e8572a",
        gradient_to: "#fb923c"
      },
      propTypes: {
        gradient_from: "color",
        gradient_to: "color"
      },
      html_template: `<div class="bar-block" style="background: linear-gradient(90deg, {{gradient_from}}, {{gradient_to}});"></div>`
    },
    {
      id: "blk_logo",
      type: "logo_mark_with_name",
      label: "Logo + brand name",
      props: {
        mark_color: "#1f2937",
        brand_name: "{{company.name}}",
        accent_color: "#e8572a"
      },
      propTypes: {
        mark_color: "color",
        brand_name: "text",
        accent_color: "color"
      },
      html_template: `<div class="logo-block">
<div class="email-logo">
<div class="logo-mark" style="background: {{mark_color}};">
<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
<rect x="2" y="2" width="6" height="6" rx="1.5" fill="white"/>
<rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".5"/>
<rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity=".5"/>
<rect x="10" y="10" width="6" height="6" rx="1.5" fill="{{accent_color}}"/>
</svg>
</div>
<span class="logo-name">{{brand_name}}</span>
</div>
</div>`
    },
    {
      id: "blk_greeting",
      type: "greeting_line",
      label: "Greeting",
      props: {
        greeting_text: "Hey {{recipient.first_name}},"
      },
      propTypes: {
        greeting_text: "text"
      },
      html_template: `<div class="greeting-block">
<p class="greeting">{{greeting_text}}</p>
</div>`
    },
    {
      id: "blk_hook",
      type: "hook_headline",
      label: "Hook headline",
      props: {
        headline: "Your team is logging more hours than ever. So why does the pipeline still feel like it's running on fumes?"
      },
      propTypes: {
        headline: "longtext"
      },
      html_template: `<div class="hook-block">
<h1 class="email-hook">{{headline}}</h1>
</div>`
    },
    {
      id: "blk_intro_paragraphs",
      type: "paragraph_pair",
      label: "Intro paragraphs",
      props: {
        paragraph_1: "I've talked to dozens of ops and revenue leaders over the past year, and almost every single one describes the same scenario:",
        paragraph_2: "The team is genuinely working hard. Deals are being touched. Follow-ups are going out. Activity metrics look fine on paper. And yet, the number of truly sales-ready opportunities never seems to grow the way it should."
      },
      propTypes: {
        paragraph_1: "longtext",
        paragraph_2: "longtext"
      },
      html_template: `<div class="p-block">
<p class="email-p">{{paragraph_1}}</p>
<p class="email-p">{{paragraph_2}}</p>
</div>`
    },
    {
      id: "blk_insight_quote",
      type: "insight_quote",
      label: "Insight quote",
      props: {
        quote: "\"We're not lazy. We're just somehow always chasing the wrong things at the wrong time.\"",
        attribution: "VP of Revenue, 120-person B2B software company",
        accent_color: "#e8572a"
      },
      propTypes: {
        quote: "longtext",
        attribution: "text",
        accent_color: "color"
      },
      html_template: `<div class="insight-wrap">
<div class="insight-block" style="border-left-color: {{accent_color}};">
<p>{{quote}}</p>
<span>{{attribution}}</span>
</div>
</div>`
    },
    {
      id: "blk_transition_paragraph",
      type: "single_paragraph",
      label: "Transition paragraph",
      props: {
        text: "If that sounds familiar, it's probably not a motivation problem or a headcount problem. It's a <strong>timing and sequencing problem</strong>, and it shows up in ways that are easy to miss:"
      },
      propTypes: {
        text: "longtext"
      },
      html_template: `<div class="p-block">
<p class="email-p">{{text}}</p>
</div>`
    },
    {
      id: "blk_symptom_list",
      type: "bulleted_list_with_title",
      label: "Symptom list (4 items)",
      props: {
        title: "Signs you might be experiencing this",
        item_1: "Reps are following up, but leads go cold anyway because the touches happen too late or out of order",
        item_2: "Marketing hands off MQLs, but sales doesn't know which ones are actually ready to talk, so they treat them all the same",
        item_3: "You have content, case studies, and resources but no systematic way to deliver them at the moment they'd actually change a mind",
        item_4: "Leads who eventually buy often say \"I didn't hear from you for a while,\" even though your CRM shows 12 touchpoints"
      },
      propTypes: {
        title: "text",
        item_1: "longtext",
        item_2: "longtext",
        item_3: "longtext",
        item_4: "longtext"
      },
      html_template: `<div class="symptom-wrap">
<div class="symptom-list">
<p class="symptom-list-title">{{title}}</p>
<div class="symptom-item"><div class="symptom-dot"></div><span>{{item_1}}</span></div>
<div class="symptom-item"><div class="symptom-dot"></div><span>{{item_2}}</span></div>
<div class="symptom-item"><div class="symptom-dot"></div><span>{{item_3}}</span></div>
<div class="symptom-item"><div class="symptom-dot"></div><span>{{item_4}}</span></div>
</div>
</div>`
    },
    {
      id: "blk_pre_cta_paragraphs",
      type: "paragraph_pair",
      label: "Pre-CTA paragraphs",
      props: {
        paragraph_1: "The uncomfortable truth: most B2B teams confuse <em>activity</em> with <em>nurturing</em>. Sending emails is not nurturing. Logging calls is not nurturing. Nurturing is systematically building understanding and trust in the mind of a specific buyer, on their timeline, not yours.",
        paragraph_2: "We put together a short scorecard that helps revenue teams pinpoint exactly where their nurturing breaks down. It takes about 3 minutes and gives you a clear picture of which stage of the buyer journey you're leaking from."
      },
      propTypes: {
        paragraph_1: "longtext",
        paragraph_2: "longtext"
      },
      html_template: `<div class="p-block">
<p class="email-p">{{paragraph_1}}</p>
<p class="email-p">{{paragraph_2}}</p>
</div>`
    },
    {
      id: "blk_cta_card",
      type: "cta_card_accent",
      label: "CTA card (accent)",
      props: {
        eyebrow: "Free resource",
        headline: "Find out where your pipeline is leaking",
        sub_text: "Take the 3-minute Pipeline Health Scorecard and get a personalized breakdown of your biggest drop-off points.",
        button_label: "Take the free scorecard",
        button_url: "{{links.cta}}",
        button_color: "#1f2937",
        button_text_color: "#ffffff",
        note: "No signup required. Instant results."
      },
      propTypes: {
        eyebrow: "text",
        headline: "longtext",
        sub_text: "longtext",
        button_label: "text",
        button_url: "link_url",
        button_color: "color",
        button_text_color: "color",
        note: "text"
      },
      html_template: `<div class="cta-wrap">
<div class="cta-block">
<div class="cta-block-eyebrow">{{eyebrow}}</div>
<div class="cta-block-headline">{{headline}}</div>
<div class="cta-block-sub">{{sub_text}}</div>
<a href="{{button_url}}" class="cta-btn" style="background: {{button_color}}; color: {{button_text_color}};">{{button_label}}</a>
<span class="cta-note">{{note}}</span>
</div>
</div>`
    },
    {
      id: "blk_divider",
      type: "horizontal_divider",
      label: "Horizontal divider",
      props: {
        color: "#e5e7eb"
      },
      propTypes: {
        color: "color"
      },
      html_template: `<div class="divider-block">
<hr class="text-divider" style="border-top-color: {{color}};">
</div>`
    },
    {
      id: "blk_outro_paragraph",
      type: "single_paragraph",
      label: "Outro paragraph",
      props: {
        text: "In a few days I'll send you the framework that the best revenue teams use to fix this, without hiring more reps or buying more tools. Worth keeping an eye out for."
      },
      propTypes: {
        text: "longtext"
      },
      html_template: `<div class="p-block">
<p class="email-p">{{text}}</p>
</div>`
    },
    {
      id: "blk_signature",
      type: "signature_with_ps",
      label: "Signature + P.S.",
      props: {
        sender_name: "{{sender.first_name}} {{sender.last_name}}",
        sender_role: "{{sender.role}} · {{company.name}}",
        ps_text: "<strong>P.S.</strong> If any of the symptoms above sound exactly like your team right now, just reply and tell me which one hurts the most. I read every reply, and it shapes what I send you next."
      },
      propTypes: {
        sender_name: "text",
        sender_role: "text",
        ps_text: "longtext"
      },
      html_template: `<div class="sig-block">
<div class="sig-name">{{sender_name}}</div>
<div class="sig-role">{{sender_role}}</div>
<hr class="sig-divider">
<p class="sig-ps">{{ps_text}}</p>
</div>`
    },
    {
      id: "blk_footer",
      type: "footer_links_with_copy",
      label: "Footer",
      locked: true,
      props: {
        link_1_label: "Unsubscribe",
        link_1_url: "{{links.unsubscribe}}",
        link_2_label: "Update preferences",
        link_2_url: "#",
        link_3_label: "View in browser",
        link_3_url: "#",
        link_4_label: "Privacy policy",
        link_4_url: "#",
        copy_line_1: "{{company.name}}, Inc. · {{company.address}}",
        copy_line_2: "You're receiving this because you signed up at {{company.name}}. We won't spam you, ever."
      },
      propTypes: {
        link_1_label: "text",
        link_1_url: "link_url",
        link_2_label: "text",
        link_2_url: "link_url",
        link_3_label: "text",
        link_3_url: "link_url",
        link_4_label: "text",
        link_4_url: "link_url",
        copy_line_1: "longtext",
        copy_line_2: "longtext"
      },
      html_template: `<div class="email-footer">
<div class="footer-links">
<a href="{{link_1_url}}">{{link_1_label}}</a>
<a href="{{link_2_url}}">{{link_2_label}}</a>
<a href="{{link_3_url}}">{{link_3_label}}</a>
<a href="{{link_4_url}}">{{link_4_label}}</a>
</div>
<p class="footer-copy">{{copy_line_1}}<br>{{copy_line_2}}</p>
</div>`
    }
  ]
};
