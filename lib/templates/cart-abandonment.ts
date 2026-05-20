import type { Template } from "@/lib/blocks/types";

/**
 * Reverse-engineered from the Maison cart-abandonment design.
 *
 * This is a div-based modern email with CSS custom properties, flexbox, and
 * rounded cards — visually beautiful but NOT email-safe in its raw form.
 * Outlook 2016+ will choke on flexbox and gradients; Gmail strips the
 * <style> block when the email exceeds 102KB.
 *
 * For the POC we render it as-is inside the preview iframe. For production
 * sending this template would either:
 *   (a) be converted to table-based HTML via a build step (Juice + MJML), or
 *   (b) only be used for in-app preview, with a table-based fallback
 *       version generated at send time.
 *
 * HR repurposing ideas:
 *   - "Your benefits enrollment is unfinished" (replace cart items with
 *     benefit cards the employee hasn't selected)
 *   - "Complete your onboarding checklist" (the cart-items list becomes
 *     unfinished tasks)
 *   - "Your learning path awaits" (items become courses)
 */
export const cartAbandonmentTemplate: Template = {
  id: "tpl_cart_abandonment_v1",
  name: "Card-Style Reminder",
  category: "engagement",
  variables: [
    { key: "recipient.first_name", label: "Recipient first name", sample: "Emma", required: true },
    { key: "brand.name", label: "Brand name", sample: "Maison", required: true },
    { key: "brand.address", label: "Brand address", sample: "12 Rue des Arts, Paris", required: false },
    { key: "links.cta", label: "Primary CTA URL", sample: "https://maison.com/cart", required: true },
    { key: "links.unsubscribe", label: "Unsubscribe URL", sample: "https://maison.com/unsubscribe", required: false }
  ],
  wrapper_html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{brand.name}}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --cream: #faf7f2;
  --charcoal: #1c1c1e;
  --warm-mid: #6b5e52;
  --accent: #c8622a;
  --soft-border: #e8e0d6;
  --white: #ffffff;
}
body {
  font-family: "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f0ebe3;
  color: var(--charcoal);
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}
.email-card {
  background: var(--white);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--soft-border);
  width: 100%;
  max-width: 600px;
}
.email-topbar { padding: 14px 28px; background: var(--cream); border-bottom: 1px solid var(--soft-border); display: flex; align-items: center; gap: 8px; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.d1 { background: #ff5f57; }
.d2 { background: #febc2e; }
.d3 { background: #28c840; }
.subject-line { margin-left: 8px; font-size: 12.5px; color: var(--warm-mid); font-weight: 500; }
.subject-line span { color: var(--charcoal); font-weight: 600; }
.email-header { padding: 28px 40px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--soft-border); }
.brand-logo { font-family: "Playfair Display", serif; font-size: 22px; letter-spacing: -0.01em; color: var(--charcoal); }
.brand-logo span { color: var(--accent); }
.email-nav { display: flex; gap: 20px; }
.email-nav a { font-size: 12px; color: var(--warm-mid); text-decoration: none; font-weight: 500; }
.email-body { padding: 40px 40px 32px; }
.hero-badge { display: inline-flex; align-items: center; gap: 6px; background: #fff4ee; border: 1px solid #fcdcc8; border-radius: 100px; padding: 5px 14px; font-size: 11.5px; font-weight: 600; color: var(--accent); letter-spacing: 0.04em; margin-bottom: 20px; }
.email-body h2 { font-family: "Playfair Display", serif; font-size: 28px; line-height: 1.22; color: var(--charcoal); margin-bottom: 12px; }
.email-body .sub { font-size: 15px; color: var(--warm-mid); line-height: 1.65; margin-bottom: 28px; }
.cart-items { background: var(--cream); border-radius: 14px; padding: 20px; margin-bottom: 24px; border: 1px solid var(--soft-border); }
.cart-item { display: flex; align-items: center; gap: 16px; padding: 10px 0; border-bottom: 1px solid var(--soft-border); }
.cart-item:last-child { border-bottom: none; padding-bottom: 0; }
.cart-item:first-child { padding-top: 0; }
.item-img { width: 52px; height: 52px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; background: var(--white); flex-shrink: 0; border: 1px solid var(--soft-border); }
.item-info { flex: 1; }
.item-name { font-size: 13.5px; font-weight: 600; color: var(--charcoal); }
.item-variant { font-size: 12px; color: var(--warm-mid); margin-top: 2px; }
.item-price { font-family: "Playfair Display", serif; font-size: 15px; color: var(--charcoal); font-weight: 700; }
.cart-total { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1.5px solid var(--soft-border); }
.cart-total .label { font-size: 13px; font-weight: 600; color: var(--warm-mid); }
.cart-total .amount { font-family: "Playfair Display", serif; font-size: 20px; color: var(--charcoal); font-weight: 700; }
.cta-btn { display: block; width: 100%; text-align: center; padding: 16px; border-radius: 12px; font-size: 15px; font-weight: 600; text-decoration: none; letter-spacing: 0.02em; background: var(--charcoal); color: var(--white); margin-bottom: 14px; }
.cta-sub { text-align: center; font-size: 12.5px; color: var(--warm-mid); }
.email-footer { background: var(--cream); border-top: 1px solid var(--soft-border); padding: 22px 40px; text-align: center; }
.footer-links { display: flex; justify-content: center; gap: 20px; margin-bottom: 10px; flex-wrap: wrap; }
.footer-links a { font-size: 12px; color: var(--warm-mid); text-decoration: none; }
.footer-copy { font-size: 11.5px; color: #b0a49a; line-height: 1.6; }
</style>
</head>
<body>
<div class="email-card">
{{__blocks__}}
</div>
</body>
</html>`,
  blocks: [
    {
      id: "blk_chrome_topbar",
      type: "chrome_topbar",
      label: "Mac-style chrome bar",
      locked: true,
      props: {
        subject_prefix: "Subject:",
        subject: "You left something behind, {{recipient.first_name}} ✦"
      },
      propTypes: {
        subject_prefix: "text",
        subject: "longtext"
      },
      html_template: `<div class="email-topbar">
<div class="dot d1"></div>
<div class="dot d2"></div>
<div class="dot d3"></div>
<div class="subject-line">{{subject_prefix}} <span>{{subject}}</span></div>
</div>`
    },
    {
      id: "blk_brand_header",
      type: "brand_header_with_nav",
      label: "Brand header + nav",
      locked: true,
      props: {
        logo_prefix: "Ma",
        logo_accent: "is",
        logo_suffix: "on",
        nav_1: "Shop",
        nav_2: "Collections",
        nav_3: "Journal"
      },
      propTypes: {
        logo_prefix: "text",
        logo_accent: "text",
        logo_suffix: "text",
        nav_1: "text",
        nav_2: "text",
        nav_3: "text"
      },
      html_template: `<div class="email-header">
<div class="brand-logo">{{logo_prefix}}<span>{{logo_accent}}</span>{{logo_suffix}}</div>
<div class="email-nav">
<a href="#">{{nav_1}}</a><a href="#">{{nav_2}}</a><a href="#">{{nav_3}}</a>
</div>
</div>`
    },
    {
      id: "blk_hero_section",
      type: "hero_with_badge",
      label: "Hero (badge + headline + sub)",
      props: {
        badge_text: "✦ Your cart misses you",
        headline: "You left some beautiful things behind.",
        subline: "Life happens — we get it. Your cart is saved and waiting. Here's what you had your eye on:"
      },
      propTypes: {
        badge_text: "text",
        headline: "longtext",
        subline: "longtext"
      },
      html_template: `<div class="email-body" style="padding-bottom: 0;">
<div class="hero-badge">{{badge_text}}</div>
<h2>{{headline}}</h2>
<p class="sub">{{subline}}</p>
</div>`
    },
    {
      id: "blk_cart_items",
      type: "item_list_with_total",
      label: "Item list + total",
      props: {
        item_1_emoji: "🕯️",
        item_1_name: "Amber & Oud Candle",
        item_1_variant: "200g · Qty 1",
        item_1_price: "$68",
        item_2_emoji: "🧴",
        item_2_name: "Neroli Body Oil",
        item_2_variant: "100ml · Qty 2",
        item_2_price: "$110",
        item_3_emoji: "🎁",
        item_3_name: "Linen Gift Wrap",
        item_3_variant: "Natural White",
        item_3_price: "$12",
        total_label: "Cart Total",
        total_amount: "$190.00"
      },
      propTypes: {
        item_1_emoji: "text",
        item_1_name: "text",
        item_1_variant: "text",
        item_1_price: "text",
        item_2_emoji: "text",
        item_2_name: "text",
        item_2_variant: "text",
        item_2_price: "text",
        item_3_emoji: "text",
        item_3_name: "text",
        item_3_variant: "text",
        item_3_price: "text",
        total_label: "text",
        total_amount: "text"
      },
      html_template: `<div style="padding: 0 40px;">
<div class="cart-items">
<div class="cart-item">
<div class="item-img">{{item_1_emoji}}</div>
<div class="item-info">
<div class="item-name">{{item_1_name}}</div>
<div class="item-variant">{{item_1_variant}}</div>
</div>
<div class="item-price">{{item_1_price}}</div>
</div>
<div class="cart-item">
<div class="item-img">{{item_2_emoji}}</div>
<div class="item-info">
<div class="item-name">{{item_2_name}}</div>
<div class="item-variant">{{item_2_variant}}</div>
</div>
<div class="item-price">{{item_2_price}}</div>
</div>
<div class="cart-item">
<div class="item-img">{{item_3_emoji}}</div>
<div class="item-info">
<div class="item-name">{{item_3_name}}</div>
<div class="item-variant">{{item_3_variant}}</div>
</div>
<div class="item-price">{{item_3_price}}</div>
</div>
<div class="cart-total">
<span class="label">{{total_label}}</span>
<span class="amount">{{total_amount}}</span>
</div>
</div>
</div>`
    },
    {
      id: "blk_cta",
      type: "cta_full_width",
      label: "CTA (full width)",
      props: {
        button_label: "Return to My Cart →",
        button_url: "{{links.cta}}",
        button_color: "#1c1c1e",
        button_text_color: "#ffffff",
        sub_text: "Takes 10 seconds. Your details are saved."
      },
      propTypes: {
        button_label: "text",
        button_url: "link_url",
        button_color: "color",
        button_text_color: "color",
        sub_text: "text"
      },
      html_template: `<div style="padding: 0 40px 32px;">
<a href="{{button_url}}" class="cta-btn" style="background: {{button_color}}; color: {{button_text_color}};">{{button_label}}</a>
<p class="cta-sub">{{sub_text}}</p>
</div>`
    },
    {
      id: "blk_footer",
      type: "footer_links_cream",
      label: "Footer (cream)",
      locked: true,
      props: {
        link_1: "View Cart",
        link_2: "Browse All",
        link_3: "Contact Us",
        link_4: "Unsubscribe",
        copyright_line_1: "© 2026 {{brand.name}}. {{brand.address}}",
        copyright_line_2: "You're receiving this because you shopped with us."
      },
      propTypes: {
        link_1: "text",
        link_2: "text",
        link_3: "text",
        link_4: "text",
        copyright_line_1: "text",
        copyright_line_2: "text"
      },
      html_template: `<div class="email-footer">
<div class="footer-links">
<a href="#">{{link_1}}</a><a href="#">{{link_2}}</a><a href="#">{{link_3}}</a><a href="{{links.unsubscribe}}">{{link_4}}</a>
</div>
<p class="footer-copy">{{copyright_line_1}}<br>{{copyright_line_2}}</p>
</div>`
    }
  ]
};
