import type { Template } from "@/lib/blocks/types";

/**
 * "Botanical Calm" — an earthy, organic wellness / natural products email.
 *
 * Warm stone + forest green palette, rounded everything, botanical
 * illustration placeholder, ingredient spotlight strip, and a soft
 * earth-toned CTA. Think Aesop meets a farmers' market — clean,
 * grounded, and deeply intentional.
 */
export const botanicalCalmTemplate: Template = {
  id: "tpl_botanical_calm_v1",
  name: "Botanical Calm",
  category: "ecommerce",
  variables: [
    { key: "customer.first_name", label: "Customer first name", sample: "Ava", required: false },
    { key: "company.name", label: "Brand name", sample: "Terra Botanica", required: true },
    { key: "links.shop", label: "Shop URL", sample: "https://terrabotanica.co/shop", required: false }
  ],
  wrapper_html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{company.name}} — New Arrivals</title>
</head>
<body style="margin:0;padding:0;background-color:#f0ebe4;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0ebe4;">
  <tr><td align="center" style="padding:36px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:#faf8f4;border-radius:20px;overflow:hidden;border:1px solid #e2dbd0;">
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
        text_color: "#3d5a3e",
        border_color: "#e2dbd0"
      },
      propTypes: {
        brand_name: "text",
        text_color: "color",
        border_color: "color"
      },
      html_template: `<tr><td align="center" style="padding:28px 40px;border-bottom:1px solid {{border_color}};">
  <span style="font-family:'Georgia',serif;font-size:22px;letter-spacing:3px;color:{{text_color}};text-transform:uppercase;">{{brand_name}}</span>
</td></tr>`
    },
    {
      id: "blk_hero",
      type: "hero_banner",
      label: "Hero section",
      props: {
        eyebrow: "Rooted in nature",
        title: "Your skin deserves\nbetter ingredients",
        body: "Small-batch botanical formulas made from wild-harvested plants. No synthetics, no fillers — just what your skin actually needs.",
        button_label: "Explore the range",
        button_url: "{{links.shop}}",
        bg_color: "#eae4d9",
        eyebrow_color: "#8a7a64",
        title_color: "#2c3e2d",
        body_color: "#6b6358",
        button_bg: "#3d5a3e",
        button_text: "#faf8f4"
      },
      propTypes: {
        eyebrow: "text",
        title: "longtext",
        body: "longtext",
        button_label: "text",
        button_url: "link_url",
        bg_color: "color",
        eyebrow_color: "color",
        title_color: "color",
        body_color: "color",
        button_bg: "color",
        button_text: "color"
      },
      html_template: `<tr><td style="background-color:{{bg_color}};padding:52px 48px 48px 48px;" align="center">
  <p style="margin:0 0 16px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:4px;color:{{eyebrow_color}};text-transform:uppercase;">{{eyebrow}}</p>
  <h1 style="margin:0 0 20px 0;font-family:'Georgia',serif;font-size:38px;line-height:1.15;color:{{title_color}};font-weight:400;white-space:pre-line;">{{title}}</h1>
  <p style="margin:0 auto 32px auto;max-width:400px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.7;color:{{body_color}};">{{body}}</p>
  <a href="{{button_url}}" style="display:inline-block;background-color:{{button_bg}};color:{{button_text}};font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:15px 38px;border-radius:999px;">{{button_label}}</a>
</td></tr>`
    },
    {
      id: "blk_product_image",
      type: "image_full",
      label: "Product image",
      props: {
        image_url: "https://placehold.co/600x380/e8e0d4/3d5a3e?text=Botanical+Collection",
        alt_text: "Botanical collection"
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
      id: "blk_ingredients",
      type: "icon_row",
      label: "Ingredient spotlight",
      props: {
        i1_icon: "🌿",
        i1_name: "Wild Rosemary",
        i1_note: "Antioxidant shield",
        i2_icon: "🍯",
        i2_name: "Raw Manuka",
        i2_note: "Deep repair",
        i3_icon: "🫒",
        i3_name: "Cold-pressed Olive",
        i3_note: "Barrier lock",
        pill_bg: "#eae4d9",
        name_color: "#2c3e2d",
        note_color: "#8a7a64"
      },
      propTypes: {
        i1_icon: "text",
        i1_name: "text",
        i1_note: "text",
        i2_icon: "text",
        i2_name: "text",
        i2_note: "text",
        i3_icon: "text",
        i3_name: "text",
        i3_note: "text",
        pill_bg: "color",
        name_color: "color",
        note_color: "color"
      },
      html_template: `<tr><td style="padding:36px 36px 12px 36px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td width="33%" align="center" style="padding:0 6px;">
      <div style="background-color:{{pill_bg}};border-radius:16px;padding:22px 10px;">
        <div style="font-size:28px;">{{i1_icon}}</div>
        <p style="margin:10px 0 2px 0;font-family:'Georgia',serif;font-size:14px;color:{{name_color}};font-weight:400;">{{i1_name}}</p>
        <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:{{note_color}};letter-spacing:0.5px;">{{i1_note}}</p>
      </div>
    </td>
    <td width="33%" align="center" style="padding:0 6px;">
      <div style="background-color:{{pill_bg}};border-radius:16px;padding:22px 10px;">
        <div style="font-size:28px;">{{i2_icon}}</div>
        <p style="margin:10px 0 2px 0;font-family:'Georgia',serif;font-size:14px;color:{{name_color}};font-weight:400;">{{i2_name}}</p>
        <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:{{note_color}};letter-spacing:0.5px;">{{i2_note}}</p>
      </div>
    </td>
    <td width="33%" align="center" style="padding:0 6px;">
      <div style="background-color:{{pill_bg}};border-radius:16px;padding:22px 10px;">
        <div style="font-size:28px;">{{i3_icon}}</div>
        <p style="margin:10px 0 2px 0;font-family:'Georgia',serif;font-size:14px;color:{{name_color}};font-weight:400;">{{i3_name}}</p>
        <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:{{note_color}};letter-spacing:0.5px;">{{i3_note}}</p>
      </div>
    </td>
  </tr></table>
</td></tr>`
    },
    {
      id: "blk_products",
      type: "product_grid",
      label: "Two products",
      props: {
        p1_image: "https://placehold.co/250x300/e8e0d4/3d5a3e?text=Face+Oil",
        p1_name: "Regenerative Face Oil",
        p1_price: "$62",
        p2_image: "https://placehold.co/250x300/e8e0d4/3d5a3e?text=Body+Balm",
        p2_name: "Whipped Body Balm",
        p2_price: "$44",
        name_color: "#2c3e2d",
        price_color: "#8a7a64"
      },
      propTypes: {
        p1_image: "image_url",
        p1_name: "text",
        p1_price: "text",
        p2_image: "image_url",
        p2_name: "text",
        p2_price: "text",
        name_color: "color",
        price_color: "color"
      },
      html_template: `<tr><td style="padding:28px 36px 16px 36px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td width="50%" valign="top" style="padding:0 8px;">
      <img src="{{p1_image}}" alt="{{p1_name}}" width="100%" style="display:block;width:100%;height:auto;border-radius:14px;border:0;" />
      <p style="margin:14px 0 4px 0;font-family:'Georgia',serif;font-size:16px;color:{{name_color}};">{{p1_name}}</p>
      <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:{{price_color}};">{{p1_price}}</p>
    </td>
    <td width="50%" valign="top" style="padding:0 8px;">
      <img src="{{p2_image}}" alt="{{p2_name}}" width="100%" style="display:block;width:100%;height:auto;border-radius:14px;border:0;" />
      <p style="margin:14px 0 4px 0;font-family:'Georgia',serif;font-size:16px;color:{{name_color}};">{{p2_name}}</p>
      <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:{{price_color}};">{{p2_price}}</p>
    </td>
  </tr></table>
</td></tr>`
    },
    {
      id: "blk_cta",
      type: "cta_button",
      label: "Bottom CTA",
      props: {
        label: "Shop all botanicals",
        url: "{{links.shop}}",
        button_bg: "#3d5a3e",
        button_text: "#faf8f4"
      },
      propTypes: {
        label: "text",
        url: "link_url",
        button_bg: "color",
        button_text: "color"
      },
      html_template: `<tr><td align="center" style="padding:28px 40px 44px 40px;">
  <a href="{{url}}" style="display:inline-block;background-color:{{button_bg}};color:{{button_text}};font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:15px 42px;border-radius:999px;">{{label}}</a>
</td></tr>`
    },
    {
      id: "blk_footer",
      type: "footer",
      label: "Footer",
      locked: true,
      props: {
        tagline: "{{company.name}} · Handmade in small batches",
        link_1: "Shop",
        link_2: "Our story",
        link_3: "Unsubscribe",
        bg_color: "#eae4d9",
        text_color: "#8a7a64",
        link_color: "#3d5a3e"
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
      html_template: `<tr><td style="padding:28px 40px;background-color:{{bg_color}};" align="center">
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
