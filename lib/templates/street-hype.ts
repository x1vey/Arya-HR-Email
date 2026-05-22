import type { Template } from "@/lib/blocks/types";

/**
 * "Street Hype" — a bold, high-energy streetwear drop email.
 *
 * Jet black + electric green palette, condensed uppercase headlines,
 * badge-style drop date, stacked product cards with oversized prices,
 * and a neon CTA. Built for streetwear, sneakers, limited collabs —
 * anything that sells out in minutes.
 */
export const streetHypeTemplate: Template = {
  id: "tpl_street_hype_v1",
  name: "Street Hype",
  category: "ecommerce",
  variables: [
    { key: "customer.first_name", label: "Customer first name", sample: "Kai", required: false },
    { key: "company.name", label: "Brand name", sample: "RVLTN", required: true },
    { key: "links.shop", label: "Drop URL", sample: "https://rvltn.co/drop", required: false }
  ],
  wrapper_html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{company.name}} — Drop Alert</title>
</head>
<body style="margin:0;padding:0;background-color:#000000;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#000000;">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:#111111;border-radius:0;overflow:hidden;border:2px solid #222222;">
      {{__blocks__}}
    </table>
  </td></tr>
</table>
</body>
</html>`,
  blocks: [
    {
      id: "blk_header",
      type: "header_logo",
      label: "Logo bar",
      locked: true,
      props: {
        brand_name: "{{company.name}}",
        accent_color: "#00FF88",
        border_color: "#222222"
      },
      propTypes: {
        brand_name: "text",
        accent_color: "color",
        border_color: "color"
      },
      html_template: `<tr><td align="center" style="padding:24px 40px;border-bottom:2px solid {{border_color}};">
  <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:26px;font-weight:900;letter-spacing:6px;color:{{accent_color}};text-transform:uppercase;">{{brand_name}}</span>
</td></tr>`
    },
    {
      id: "blk_drop_badge",
      type: "hero_banner",
      label: "Drop badge + headline",
      props: {
        badge: "EXCLUSIVE DROP",
        title: "SS26 CAPSULE",
        subtitle: "Limited to 200 pieces worldwide. No restocks. No exceptions.",
        badge_bg: "#00FF88",
        badge_color: "#000000",
        title_color: "#FFFFFF",
        subtitle_color: "#777777"
      },
      propTypes: {
        badge: "text",
        title: "text",
        subtitle: "longtext",
        badge_bg: "color",
        badge_color: "color",
        title_color: "color",
        subtitle_color: "color"
      },
      html_template: `<tr><td align="center" style="padding:48px 40px 40px 40px;background-color:#111111;">
  <span style="display:inline-block;background-color:{{badge_bg}};color:{{badge_color}};font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:900;letter-spacing:3px;text-transform:uppercase;padding:8px 18px;margin-bottom:20px;">{{badge}}</span>
  <h1 style="margin:0 0 16px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:56px;line-height:1.0;color:{{title_color}};font-weight:900;letter-spacing:4px;text-transform:uppercase;">{{title}}</h1>
  <p style="margin:0 auto;max-width:380px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:1.7;color:{{subtitle_color}};letter-spacing:0.5px;">{{subtitle}}</p>
</td></tr>`
    },
    {
      id: "blk_hero_image",
      type: "image_full",
      label: "Lookbook image",
      props: {
        image_url: "https://placehold.co/600x400/1a1a1a/00FF88?text=DROP+LOOKBOOK",
        alt_text: "Drop lookbook"
      },
      propTypes: {
        image_url: "image_url",
        alt_text: "text"
      },
      html_template: `<tr><td style="padding:0;">
  <img src="{{image_url}}" alt="{{alt_text}}" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
</td></tr>`
    },
    {
      id: "blk_products",
      type: "product_grid",
      label: "Two products",
      props: {
        p1_image: "https://placehold.co/270x320/1a1a1a/ffffff?text=Hoodie",
        p1_name: "LOGO HOODIE",
        p1_price: "$185",
        p2_image: "https://placehold.co/270x320/1a1a1a/ffffff?text=Cargo",
        p2_name: "UTILITY CARGO",
        p2_price: "$210",
        name_color: "#FFFFFF",
        price_color: "#00FF88",
        border_color: "#222222"
      },
      propTypes: {
        p1_image: "image_url",
        p1_name: "text",
        p1_price: "text",
        p2_image: "image_url",
        p2_name: "text",
        p2_price: "text",
        name_color: "color",
        price_color: "color",
        border_color: "color"
      },
      html_template: `<tr><td style="padding:32px 28px 16px 28px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td width="50%" valign="top" style="padding:0 8px;">
      <div style="border:1px solid {{border_color}};overflow:hidden;">
        <img src="{{p1_image}}" alt="{{p1_name}}" width="100%" style="display:block;width:100%;height:auto;border:0;" />
        <div style="padding:14px 16px;background-color:#0a0a0a;">
          <p style="margin:0 0 4px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:800;letter-spacing:2px;color:{{name_color}};text-transform:uppercase;">{{p1_name}}</p>
          <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:900;color:{{price_color}};">{{p1_price}}</p>
        </div>
      </div>
    </td>
    <td width="50%" valign="top" style="padding:0 8px;">
      <div style="border:1px solid {{border_color}};overflow:hidden;">
        <img src="{{p2_image}}" alt="{{p2_name}}" width="100%" style="display:block;width:100%;height:auto;border:0;" />
        <div style="padding:14px 16px;background-color:#0a0a0a;">
          <p style="margin:0 0 4px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:800;letter-spacing:2px;color:{{name_color}};text-transform:uppercase;">{{p2_name}}</p>
          <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:900;color:{{price_color}};">{{p2_price}}</p>
        </div>
      </div>
    </td>
  </tr></table>
</td></tr>`
    },
    {
      id: "blk_cta",
      type: "cta_button",
      label: "Neon CTA",
      props: {
        label: "SHOP THE DROP",
        url: "{{links.shop}}",
        button_color: "#00FF88",
        text_color: "#000000",
        note: "Doors open Friday 12:00 EST · First come, first served",
        note_color: "#555555"
      },
      propTypes: {
        label: "text",
        url: "link_url",
        button_color: "color",
        text_color: "color",
        note: "text",
        note_color: "color"
      },
      html_template: `<tr><td align="center" style="padding:32px 40px 44px 40px;">
  <a href="{{url}}" style="display:inline-block;background-color:{{button_color}};color:{{text_color}};font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:900;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:18px 48px;">{{label}}</a>
  <p style="margin:18px 0 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:1px;color:{{note_color}};">{{note}}</p>
</td></tr>`
    },
    {
      id: "blk_footer",
      type: "footer",
      label: "Footer",
      locked: true,
      props: {
        address: "{{company.name}} · Los Angeles, CA",
        link_1: "Shop",
        link_2: "Lookbook",
        link_3: "Unsubscribe",
        border_color: "#222222",
        text_color: "#444444",
        link_color: "#666666"
      },
      propTypes: {
        address: "text",
        link_1: "text",
        link_2: "text",
        link_3: "text",
        border_color: "color",
        text_color: "color",
        link_color: "color"
      },
      html_template: `<tr><td style="padding:28px 40px;border-top:2px solid {{border_color}};background-color:#0a0a0a;" align="center">
  <p style="margin:0 0 10px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:2px;color:{{text_color}};text-transform:uppercase;">{{address}}</p>
  <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:{{text_color}};">
    <a href="#" style="color:{{link_color}};text-decoration:none;">{{link_1}}</a> &nbsp;·&nbsp;
    <a href="#" style="color:{{link_color}};text-decoration:none;">{{link_2}}</a> &nbsp;·&nbsp;
    <a href="#" style="color:{{link_color}};text-decoration:none;">{{link_3}}</a>
  </p>
</td></tr>`
    }
  ]
};
