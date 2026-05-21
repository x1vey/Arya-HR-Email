import type { Template } from "@/lib/blocks/types";

/**
 * "Minimal Lux" — an Apple-style ultra-clean product launch email.
 *
 * Near-white palette, huge tight-tracking headlines, soft gradient product
 * backdrop, a spec strip with three key numbers, and a rounded pill CTA.
 * Clean, airy, and unmistakably premium — ideal for tech, audio, furniture,
 * or any brand that lets the product speak.
 */
export const minimalLuxTemplate: Template = {
  id: "tpl_minimal_lux_v1",
  name: "Minimal Lux",
  category: "ecommerce",
  variables: [
    { key: "customer.first_name", label: "Customer first name", sample: "Sam", required: false },
    { key: "company.name", label: "Brand name", sample: "Lumen", required: true },
    { key: "links.shop", label: "Pre-order URL", sample: "https://lumen.co/air", required: false }
  ],
  wrapper_html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{company.name}} — New Product</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f7;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:#ffffff;border-radius:18px;overflow:hidden;">
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
      label: "Logo",
      locked: true,
      props: {
        brand_name: "{{company.name}}",
        text_color: "#1d1d1f"
      },
      propTypes: {
        brand_name: "text",
        text_color: "color"
      },
      html_template: `<tr><td align="center" style="padding:34px 40px 10px 40px;">
  <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:600;letter-spacing:-0.3px;color:{{text_color}};">{{brand_name}}</span>
</td></tr>`
    },
    {
      id: "blk_hero",
      type: "hero_banner",
      label: "Hero headline",
      props: {
        title: "Lumen Air.",
        subtitle: "Light, redefined.",
        title_color: "#1d1d1f",
        subtitle_color: "#6e6e73"
      },
      propTypes: {
        title: "text",
        subtitle: "text",
        title_color: "color",
        subtitle_color: "color"
      },
      html_template: `<tr><td align="center" style="padding:30px 48px 8px 48px;">
  <h1 style="margin:0 0 14px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:48px;line-height:1.05;color:{{title_color}};font-weight:700;letter-spacing:-1.5px;">{{title}}</h1>
  <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:21px;line-height:1.3;color:{{subtitle_color}};font-weight:500;letter-spacing:-0.3px;">{{subtitle}}</p>
</td></tr>`
    },
    {
      id: "blk_product_image",
      type: "image_full",
      label: "Product on gradient",
      props: {
        image_url: "https://placehold.co/440x340/f0f0f3/1d1d1f?text=Product+Shot",
        alt_text: "Product"
      },
      propTypes: {
        image_url: "image_url",
        alt_text: "text"
      },
      html_template: `<tr><td style="padding:24px 0 8px 0;background-image:linear-gradient(180deg,#ffffff 0%,#f0f0f3 100%);background-color:#ffffff;" align="center">
  <img src="{{image_url}}" alt="{{alt_text}}" width="440" style="display:block;width:440px;max-width:88%;height:auto;border:0;" />
</td></tr>`
    },
    {
      id: "blk_cta",
      type: "cta_button",
      label: "CTA + tagline",
      props: {
        body: "The thinnest we've ever made. Aerospace-grade aluminium, an all-day battery, and a screen that disappears into the room.",
        button_label: "Pre-order — $1,299",
        button_url: "{{links.shop}}",
        note: "Free delivery · 30-day returns",
        body_color: "#1d1d1f",
        button_color: "#0071e3",
        button_text: "#ffffff",
        note_color: "#86868b"
      },
      propTypes: {
        body: "longtext",
        button_label: "text",
        button_url: "link_url",
        note: "text",
        body_color: "color",
        button_color: "color",
        button_text: "color",
        note_color: "color"
      },
      html_template: `<tr><td align="center" style="padding:36px 48px 10px 48px;">
  <p style="margin:0 auto 28px auto;max-width:400px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:17px;line-height:1.6;color:{{body_color}};">{{body}}</p>
  <a href="{{button_url}}" style="display:inline-block;background-color:{{button_color}};color:{{button_text}};font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;font-weight:500;text-decoration:none;padding:13px 32px;border-radius:999px;">{{button_label}}</a>
  <p style="margin:16px 0 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:{{note_color}};">{{note}}</p>
</td></tr>`
    },
    {
      id: "blk_specs",
      type: "stats_row",
      label: "Spec strip",
      props: {
        s1_value: "5.6",
        s1_unit: "mm",
        s1_label: "Thin",
        s2_value: "22",
        s2_unit: "hr",
        s2_label: "Battery",
        s3_value: "1.1",
        s3_unit: "kg",
        s3_label: "Light",
        value_color: "#1d1d1f",
        unit_color: "#86868b",
        label_color: "#86868b",
        divider_color: "#e8e8ed"
      },
      propTypes: {
        s1_value: "text",
        s1_unit: "text",
        s1_label: "text",
        s2_value: "text",
        s2_unit: "text",
        s2_label: "text",
        s3_value: "text",
        s3_unit: "text",
        s3_label: "text",
        value_color: "color",
        unit_color: "color",
        label_color: "color",
        divider_color: "color"
      },
      html_template: `<tr><td style="padding:40px 40px 20px 40px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td width="33%" align="center" style="border-right:1px solid {{divider_color}};padding:8px;">
      <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:26px;font-weight:700;color:{{value_color}};letter-spacing:-0.5px;">{{s1_value}}<span style="font-size:14px;font-weight:500;color:{{unit_color}};">{{s1_unit}}</span></p>
      <p style="margin:4px 0 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:{{label_color}};">{{s1_label}}</p>
    </td>
    <td width="34%" align="center" style="border-right:1px solid {{divider_color}};padding:8px;">
      <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:26px;font-weight:700;color:{{value_color}};letter-spacing:-0.5px;">{{s2_value}}<span style="font-size:14px;font-weight:500;color:{{unit_color}};">{{s2_unit}}</span></p>
      <p style="margin:4px 0 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:{{label_color}};">{{s2_label}}</p>
    </td>
    <td width="33%" align="center" style="padding:8px;">
      <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:26px;font-weight:700;color:{{value_color}};letter-spacing:-0.5px;">{{s3_value}}<span style="font-size:14px;font-weight:500;color:{{unit_color}};">{{s3_unit}}</span></p>
      <p style="margin:4px 0 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:{{label_color}};">{{s3_label}}</p>
    </td>
  </tr></table>
</td></tr>`
    },
    {
      id: "blk_footer",
      type: "footer",
      label: "Footer",
      locked: true,
      props: {
        address: "{{company.name}} Inc. · One Lumen Park, Cupertino",
        link_1: "Store",
        link_2: "Support",
        link_3: "Unsubscribe",
        bg_color: "#f5f5f7",
        text_color: "#86868b",
        link_color: "#0071e3"
      },
      propTypes: {
        address: "text",
        link_1: "text",
        link_2: "text",
        link_3: "text",
        bg_color: "color",
        text_color: "color",
        link_color: "color"
      },
      html_template: `<tr><td style="padding:32px 40px;background-color:{{bg_color}};" align="center">
  <p style="margin:0 0 10px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:{{text_color}};">{{address}}</p>
  <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:{{text_color}};">
    <a href="#" style="color:{{link_color}};text-decoration:none;">{{link_1}}</a> &nbsp;·&nbsp;
    <a href="#" style="color:{{link_color}};text-decoration:none;">{{link_2}}</a> &nbsp;·&nbsp;
    <a href="#" style="color:{{link_color}};text-decoration:none;">{{link_3}}</a>
  </p>
</td></tr>`
    }
  ]
};
