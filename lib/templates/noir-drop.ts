import type { Template } from "@/lib/blocks/types";

/**
 * "Noir Drop" — a dark, luxury fashion product-drop email.
 *
 * Obsidian + gold palette, serif display headlines, a full-bleed hero image,
 * a two-up product grid, and a countdown strip. Built as editable blocks so a
 * merchant can swap copy, prices, images, and the accent colour while keeping
 * the moody premium feel intact.
 */
export const noirDropTemplate: Template = {
  id: "tpl_noir_drop_v1",
  name: "Noir Drop",
  category: "ecommerce",
  variables: [
    { key: "customer.first_name", label: "Customer first name", sample: "Alex", required: false },
    { key: "company.name", label: "Brand name", sample: "Maison Noir", required: true },
    { key: "links.shop", label: "Shop URL", sample: "https://maisonnoir.com/drop", required: false }
  ],
  wrapper_html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{company.name}} — New Drop</title>
</head>
<body style="margin:0;padding:0;background-color:#0c0c0e;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0c0c0e;">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:#141416;border-radius:20px;overflow:hidden;border:1px solid #232327;">
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
        text_color: "#EDE7DA"
      },
      propTypes: {
        brand_name: "text",
        text_color: "color"
      },
      html_template: `<tr><td align="center" style="padding:28px 40px;border-bottom:1px solid #232327;">
  <span style="font-family:'Georgia',serif;font-size:22px;letter-spacing:6px;color:{{text_color}};text-transform:uppercase;">{{brand_name}}</span>
</td></tr>`
    },
    {
      id: "blk_hero",
      type: "hero_banner",
      label: "Hero (gradient)",
      props: {
        eyebrow: "New Arrivals · FW26",
        title: "The Midnight Collection",
        body: "Hand-finished pieces in deep obsidian and warm gold. Crafted in limited numbers. Once they're gone, they're gone.",
        button_label: "Shop the Drop",
        button_url: "{{links.shop}}",
        accent_color: "#C9A24B",
        title_color: "#F5F1E8",
        body_color: "#9b9ba1"
      },
      propTypes: {
        eyebrow: "text",
        title: "text",
        body: "longtext",
        button_label: "text",
        button_url: "link_url",
        accent_color: "color",
        title_color: "color",
        body_color: "color"
      },
      html_template: `<tr><td style="background-image:linear-gradient(160deg,#1c1c20 0%,#0c0c0e 60%,#1a1410 100%);background-color:#141416;padding:56px 40px 48px 40px;" align="center">
  <span style="display:inline-block;font-size:11px;letter-spacing:4px;color:{{accent_color}};text-transform:uppercase;margin-bottom:20px;">{{eyebrow}}</span>
  <h1 style="margin:0 0 18px 0;font-family:'Georgia',serif;font-size:44px;line-height:1.08;color:{{title_color}};font-weight:400;">{{title}}</h1>
  <p style="margin:0 auto 32px auto;max-width:380px;font-size:15px;line-height:1.7;color:{{body_color}};">{{body}}</p>
  <a href="{{button_url}}" style="display:inline-block;background-color:{{accent_color}};color:#0c0c0e;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:16px 40px;border-radius:999px;">{{button_label}}</a>
</td></tr>`
    },
    {
      id: "blk_hero_image",
      type: "image_full",
      label: "Full-width hero image",
      props: {
        image_url: "https://placehold.co/600x420/17171a/C9A24B?text=Hero+Look",
        alt_text: "Featured look"
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
        p1_image: "https://placehold.co/270x320/1c1c20/EDE7DA?text=Obsidian+Coat",
        p1_name: "Obsidian Wool Coat",
        p1_price: "$680",
        p2_image: "https://placehold.co/270x320/1c1c20/EDE7DA?text=Gold+Chain",
        p2_name: "Signature Gold Chain",
        p2_price: "$240",
        name_color: "#F5F1E8",
        price_color: "#C9A24B"
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
      html_template: `<tr><td style="padding:40px 32px 16px 32px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td width="50%" valign="top" style="padding:0 8px;">
      <img src="{{p1_image}}" alt="{{p1_name}}" width="100%" style="display:block;width:100%;height:auto;border-radius:12px;border:0;" />
      <p style="margin:14px 0 2px 0;font-size:14px;color:{{name_color}};font-weight:600;">{{p1_name}}</p>
      <p style="margin:0;font-size:13px;color:{{price_color}};">{{p1_price}}</p>
    </td>
    <td width="50%" valign="top" style="padding:0 8px;">
      <img src="{{p2_image}}" alt="{{p2_name}}" width="100%" style="display:block;width:100%;height:auto;border-radius:12px;border:0;" />
      <p style="margin:14px 0 2px 0;font-size:14px;color:{{name_color}};font-weight:600;">{{p2_name}}</p>
      <p style="margin:0;font-size:13px;color:{{price_color}};">{{p2_price}}</p>
    </td>
  </tr></table>
</td></tr>`
    },
    {
      id: "blk_countdown",
      type: "countdown_strip",
      label: "Countdown strip",
      props: {
        label: "Early access ends in",
        time: "47 : 59 : 12",
        accent_color: "#C9A24B"
      },
      propTypes: {
        label: "text",
        time: "text",
        accent_color: "color"
      },
      html_template: `<tr><td style="padding:24px 40px 40px 40px;" align="center">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#1c1c20;border-radius:14px;border:1px solid #2c2c31;">
    <tr><td align="center" style="padding:24px;">
      <p style="margin:0 0 6px 0;font-size:11px;letter-spacing:3px;color:#9b9ba1;text-transform:uppercase;">{{label}}</p>
      <p style="margin:0;font-family:'Georgia',serif;font-size:30px;color:{{accent_color}};letter-spacing:2px;">{{time}}</p>
    </td></tr>
  </table>
</td></tr>`
    },
    {
      id: "blk_footer",
      type: "footer",
      label: "Footer",
      locked: true,
      props: {
        address: "{{company.name}} · 1 Atelier Lane, Paris",
        link_1: "Shop",
        link_2: "Our story",
        link_3: "Unsubscribe"
      },
      propTypes: {
        address: "text",
        link_1: "text",
        link_2: "text",
        link_3: "text"
      },
      html_template: `<tr><td style="padding:32px 40px;border-top:1px solid #232327;background-color:#0f0f11;" align="center">
  <p style="margin:0 0 12px 0;font-size:12px;color:#6b6b72;">{{address}}</p>
  <p style="margin:0;font-size:12px;color:#6b6b72;">
    <a href="#" style="color:#9b9ba1;text-decoration:none;">{{link_1}}</a> &nbsp;·&nbsp;
    <a href="#" style="color:#9b9ba1;text-decoration:none;">{{link_2}}</a> &nbsp;·&nbsp;
    <a href="#" style="color:#9b9ba1;text-decoration:none;">{{link_3}}</a>
  </p>
</td></tr>`
    }
  ]
};
