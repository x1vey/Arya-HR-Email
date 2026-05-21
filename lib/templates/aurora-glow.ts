import type { Template } from "@/lib/blocks/types";

/**
 * "Aurora Glow" — a warm, gradient-rich DTC beauty / wellness email.
 *
 * Coral → plum palette, bold rounded sans-serif, gradient hero, product
 * feature with image + text side-by-side, benefit pills, and a gradient CTA.
 * Perfect for skincare, wellness, or any brand that's bright, friendly,
 * and unapologetically modern.
 */
export const auroraGlowTemplate: Template = {
  id: "tpl_aurora_glow_v1",
  name: "Aurora Glow",
  category: "ecommerce",
  variables: [
    { key: "customer.first_name", label: "Customer first name", sample: "Mia", required: false },
    { key: "company.name", label: "Brand name", sample: "Aurora Skincare", required: true },
    { key: "links.shop", label: "Shop URL", sample: "https://aurora.co/shop", required: false }
  ],
  wrapper_html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{company.name}} — New Drop</title>
</head>
<body style="margin:0;padding:0;background-color:#fff4ee;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff4ee;">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(214,112,79,0.18);">
      {{__blocks__}}
    </table>
  </td></tr>
</table>
</body>
</html>`,
  blocks: [
    {
      id: "blk_logo",
      type: "header_logo",
      label: "Logo bar",
      locked: true,
      props: {
        brand_name: "aurora",
        accent_color: "#D6704F",
        dot_color: "#E8A87C"
      },
      propTypes: {
        brand_name: "text",
        accent_color: "color",
        dot_color: "color"
      },
      html_template: `<tr><td align="center" style="padding:26px 40px;">
  <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:20px;font-weight:800;letter-spacing:1px;color:{{accent_color}};">{{brand_name}}<span style="color:{{dot_color}}>.</span></span>
</td></tr>`
    },
    {
      id: "blk_hero",
      type: "hero_banner",
      label: "Gradient hero",
      props: {
        headline: "Glow that\nspeaks for itself",
        body: "Meet the Radiance Serum — clinically loved, ridiculously dewy. Your first bottle is on us, almost.",
        button_label: "Claim 20% off",
        button_url: "{{links.shop}}",
        gradient_from: "#FFB997",
        gradient_mid: "#F67E7D",
        gradient_to: "#843B62",
        text_color: "#ffffff"
      },
      propTypes: {
        headline: "longtext",
        body: "longtext",
        button_label: "text",
        button_url: "link_url",
        gradient_from: "color",
        gradient_mid: "color",
        gradient_to: "color",
        text_color: "color"
      },
      html_template: `<tr><td style="background-image:linear-gradient(135deg,{{gradient_from}} 0%,{{gradient_mid}} 45%,{{gradient_to}} 110%);background-color:{{gradient_mid}};padding:54px 40px;" align="center">
  <h1 style="margin:0 0 16px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:40px;line-height:1.1;color:{{text_color}};font-weight:800;letter-spacing:-0.5px;white-space:pre-line;">{{headline}}</h1>
  <p style="margin:0 auto 30px auto;max-width:360px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:16px;line-height:1.65;color:rgba(255,255,255,0.92);">{{body}}</p>
  <a href="{{button_url}}" style="display:inline-block;background-color:#ffffff;color:#D6704F;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:15px 38px;border-radius:999px;box-shadow:0 8px 20px rgba(0,0,0,0.12);">{{button_label}}</a>
</td></tr>`
    },
    {
      id: "blk_product",
      type: "product_feature",
      label: "Product feature",
      props: {
        image_url: "https://placehold.co/240x300/FFE4D6/D6704F?text=Serum",
        badge: "Bestseller",
        product_name: "Radiance Serum",
        description: "Vitamin C + hyaluronic acid for visible glow in 7 days. Vegan, cruelty-free, dermatologist-tested.",
        price: "$38",
        original_price: "$48",
        badge_bg: "#FFE4D6",
        badge_color: "#D6704F",
        name_color: "#2b2222",
        desc_color: "#7a6f6a",
        price_color: "#D6704F",
        strike_color: "#b9aca6"
      },
      propTypes: {
        image_url: "image_url",
        badge: "text",
        product_name: "text",
        description: "longtext",
        price: "text",
        original_price: "text",
        badge_bg: "color",
        badge_color: "color",
        name_color: "color",
        desc_color: "color",
        price_color: "color",
        strike_color: "color"
      },
      html_template: `<tr><td style="padding:44px 40px 20px 40px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td width="46%" valign="middle" style="padding-right:20px;">
      <img src="{{image_url}}" alt="{{product_name}}" width="100%" style="display:block;width:100%;height:auto;border-radius:16px;border:0;" />
    </td>
    <td width="54%" valign="middle">
      <span style="display:inline-block;background-color:{{badge_bg}};color:{{badge_color}};font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:6px 12px;border-radius:999px;margin-bottom:14px;">{{badge}}</span>
      <h2 style="margin:0 0 10px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:24px;color:{{name_color}};font-weight:800;">{{product_name}}</h2>
      <p style="margin:0 0 16px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:1.6;color:{{desc_color}};">{{description}}</p>
      <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:18px;color:{{price_color}};font-weight:800;">{{price}} <span style="font-size:14px;color:{{strike_color}};text-decoration:line-through;font-weight:400;">{{original_price}}</span></p>
    </td>
  </tr></table>
</td></tr>`
    },
    {
      id: "blk_benefits",
      type: "icon_row",
      label: "Benefit pills",
      props: {
        b1_icon: "✨",
        b1_text: "Visible glow",
        b2_icon: "🌿",
        b2_text: "100% vegan",
        b3_icon: "💧",
        b3_text: "Deep hydration",
        pill_bg: "#FFF4EE",
        text_color: "#7a6f6a"
      },
      propTypes: {
        b1_icon: "text",
        b1_text: "text",
        b2_icon: "text",
        b2_text: "text",
        b3_icon: "text",
        b3_text: "text",
        pill_bg: "color",
        text_color: "color"
      },
      html_template: `<tr><td style="padding:24px 40px 8px 40px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td width="33%" align="center" style="padding:0 6px;">
      <div style="background-color:{{pill_bg}};border-radius:14px;padding:18px 8px;">
        <div style="font-size:24px;">{{b1_icon}}</div>
        <p style="margin:8px 0 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:{{text_color}};font-weight:600;">{{b1_text}}</p>
      </div>
    </td>
    <td width="33%" align="center" style="padding:0 6px;">
      <div style="background-color:{{pill_bg}};border-radius:14px;padding:18px 8px;">
        <div style="font-size:24px;">{{b2_icon}}</div>
        <p style="margin:8px 0 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:{{text_color}};font-weight:600;">{{b2_text}}</p>
      </div>
    </td>
    <td width="33%" align="center" style="padding:0 6px;">
      <div style="background-color:{{pill_bg}};border-radius:14px;padding:18px 8px;">
        <div style="font-size:24px;">{{b3_icon}}</div>
        <p style="margin:8px 0 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:{{text_color}};font-weight:600;">{{b3_text}}</p>
      </div>
    </td>
  </tr></table>
</td></tr>`
    },
    {
      id: "blk_cta",
      type: "cta_button",
      label: "Gradient CTA",
      props: {
        label: "Start my glow ritual",
        url: "{{links.shop}}",
        gradient_from: "#F67E7D",
        gradient_to: "#843B62"
      },
      propTypes: {
        label: "text",
        url: "link_url",
        gradient_from: "color",
        gradient_to: "color"
      },
      html_template: `<tr><td align="center" style="padding:36px 40px 44px 40px;">
  <a href="{{url}}" style="display:inline-block;background-image:linear-gradient(135deg,{{gradient_from}} 0%,{{gradient_to}} 100%);background-color:{{gradient_from}};color:#ffffff;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:16px 44px;border-radius:999px;">{{label}}</a>
</td></tr>`
    },
    {
      id: "blk_footer",
      type: "footer",
      label: "Footer",
      locked: true,
      props: {
        tagline: "{{company.name}} · Made with love in California",
        link_1: "Shop all",
        link_2: "Ingredients",
        link_3: "Unsubscribe",
        bg_color: "#FFF4EE",
        text_color: "#a89a93",
        link_color: "#D6704F"
      },
      propTypes: {
        tagline: "text",
        link_1: "text",
        link_2: "text",
        link_3: "text",
        bg_color: "color",
        text_color: "color",
        link_color: "color"
      },
      html_template: `<tr><td style="padding:30px 40px;background-color:{{bg_color}};" align="center">
  <p style="margin:0 0 10px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:{{text_color}};">{{tagline}}</p>
  <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:{{text_color}};">
    <a href="#" style="color:{{link_color}};text-decoration:none;">{{link_1}}</a> &nbsp;·&nbsp;
    <a href="#" style="color:{{link_color}};text-decoration:none;">{{link_2}}</a> &nbsp;·&nbsp;
    <a href="#" style="color:{{link_color}};text-decoration:none;">{{link_3}}</a>
  </p>
</td></tr>`
    }
  ]
};
