import type { Template } from "@/lib/blocks/types";

/**
 * "Editorial Lookbook" — a magazine-style home/lifestyle email.
 *
 * Warm linen palette, serif headlines, masthead with issue metadata,
 * full-width editorial hero, body copy in Georgia, two-column product
 * grid with underline-style links, and a dark footer. Refined & quiet,
 * like a printed journal that landed in your inbox.
 */
export const editorialLookbookTemplate: Template = {
  id: "tpl_editorial_lookbook_v1",
  name: "Editorial Lookbook",
  category: "ecommerce",
  variables: [
    { key: "customer.first_name", label: "Customer first name", sample: "Jordan", required: false },
    { key: "company.name", label: "Brand name", sample: "Atelier", required: true },
    { key: "links.shop", label: "Collection URL", sample: "https://atelier.co/collection", required: false }
  ],
  wrapper_html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{company.name}} — Lookbook</title>
</head>
<body style="margin:0;padding:0;background-color:#ece8e1;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ece8e1;">
  <tr><td align="center" style="padding:0;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:#f7f5f0;">
      {{__blocks__}}
    </table>
  </td></tr>
</table>
</body>
</html>`,
  blocks: [
    {
      id: "blk_masthead",
      type: "header_logo",
      label: "Masthead",
      locked: true,
      props: {
        left_label: "Issue 04",
        brand_name: "{{company.name}}",
        right_label: "Spring",
        text_color: "#1a1a1a"
      },
      propTypes: {
        left_label: "text",
        brand_name: "text",
        right_label: "text",
        text_color: "color"
      },
      html_template: `<tr><td style="padding:30px 48px 22px 48px;border-bottom:2px solid {{text_color}};">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td align="left" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:2px;color:{{text_color}};text-transform:uppercase;">{{left_label}}</td>
    <td align="center" style="font-family:'Georgia',serif;font-size:24px;letter-spacing:8px;color:{{text_color}};text-transform:uppercase;">{{brand_name}}</td>
    <td align="right" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:2px;color:{{text_color}};text-transform:uppercase;">{{right_label}}</td>
  </tr></table>
</td></tr>`
    },
    {
      id: "blk_hero_image",
      type: "image_full",
      label: "Editorial hero image",
      props: {
        image_url: "https://placehold.co/600x500/d9d2c5/1a1a1a?text=Editorial+Hero",
        alt_text: "Cover"
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
      id: "blk_headline",
      type: "hero_banner",
      label: "Headline block",
      props: {
        eyebrow: "The Slow Living Edit",
        title: "Objects made\nto be lived with",
        body: "This season we slowed down. Every piece in the collection is built by hand, meant to age beautifully, and designed to last a lifetime — not a trend cycle.",
        eyebrow_color: "#8a8175",
        title_color: "#1a1a1a",
        body_color: "#4a4439"
      },
      propTypes: {
        eyebrow: "text",
        title: "longtext",
        body: "longtext",
        eyebrow_color: "color",
        title_color: "color",
        body_color: "color"
      },
      html_template: `<tr><td style="padding:48px 56px 16px 56px;" align="center">
  <p style="margin:0 0 18px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:4px;color:{{eyebrow_color}};text-transform:uppercase;">{{eyebrow}}</p>
  <h1 style="margin:0 0 22px 0;font-family:'Georgia',serif;font-size:42px;line-height:1.15;color:{{title_color}};font-weight:400;white-space:pre-line;"><em>{{title}}</em></h1>
  <p style="margin:0 auto;max-width:420px;font-family:'Georgia',serif;font-size:16px;line-height:1.8;color:{{body_color}};">{{body}}</p>
</td></tr>`
    },
    {
      id: "blk_divider",
      type: "divider",
      label: "Divider rule",
      props: {
        line_color: "#d6cfc2"
      },
      propTypes: {
        line_color: "color"
      },
      html_template: `<tr><td style="padding:32px 56px;">
  <div style="height:1px;background-color:{{line_color}};line-height:1px;font-size:1px;">&nbsp;</div>
</td></tr>`
    },
    {
      id: "blk_products",
      type: "product_grid",
      label: "Two-column products",
      props: {
        p1_image: "https://placehold.co/250x300/e3ddd0/1a1a1a?text=Ceramic+Vase",
        p1_name: "Hand-thrown Vase",
        p1_meta: "Stoneware · $120",
        p2_image: "https://placehold.co/250x300/e3ddd0/1a1a1a?text=Linen+Throw",
        p2_name: "Washed Linen Throw",
        p2_meta: "Flax · $95",
        name_color: "#1a1a1a",
        meta_color: "#8a8175"
      },
      propTypes: {
        p1_image: "image_url",
        p1_name: "text",
        p1_meta: "text",
        p2_image: "image_url",
        p2_name: "text",
        p2_meta: "text",
        name_color: "color",
        meta_color: "color"
      },
      html_template: `<tr><td style="padding:0 48px 16px 48px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td width="50%" valign="top" style="padding:0 12px;">
      <img src="{{p1_image}}" alt="{{p1_name}}" width="100%" style="display:block;width:100%;height:auto;border:0;" />
      <p style="margin:16px 0 4px 0;font-family:'Georgia',serif;font-size:18px;color:{{name_color}};">{{p1_name}}</p>
      <p style="margin:0 0 10px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;letter-spacing:1px;color:{{meta_color}};text-transform:uppercase;">{{p1_meta}}</p>
      <a href="#" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;letter-spacing:1px;color:{{name_color}};text-transform:uppercase;text-decoration:none;border-bottom:1px solid {{name_color}};padding-bottom:2px;">View</a>
    </td>
    <td width="50%" valign="top" style="padding:0 12px;">
      <img src="{{p2_image}}" alt="{{p2_name}}" width="100%" style="display:block;width:100%;height:auto;border:0;" />
      <p style="margin:16px 0 4px 0;font-family:'Georgia',serif;font-size:18px;color:{{name_color}};">{{p2_name}}</p>
      <p style="margin:0 0 10px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;letter-spacing:1px;color:{{meta_color}};text-transform:uppercase;">{{p2_meta}}</p>
      <a href="#" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;letter-spacing:1px;color:{{name_color}};text-transform:uppercase;text-decoration:none;border-bottom:1px solid {{name_color}};padding-bottom:2px;">View</a>
    </td>
  </tr></table>
</td></tr>`
    },
    {
      id: "blk_cta",
      type: "cta_button",
      label: "CTA button",
      props: {
        label: "Explore the collection",
        url: "{{links.shop}}",
        button_color: "#1a1a1a",
        text_color: "#f7f5f0"
      },
      propTypes: {
        label: "text",
        url: "link_url",
        button_color: "color",
        text_color: "color"
      },
      html_template: `<tr><td align="center" style="padding:44px 56px 52px 56px;">
  <a href="{{url}}" style="display:inline-block;background-color:{{button_color}};color:{{text_color}};font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:16px 46px;">{{label}}</a>
</td></tr>`
    },
    {
      id: "blk_footer",
      type: "footer",
      label: "Footer (dark)",
      locked: true,
      props: {
        brand_name: "{{company.name}}",
        link_1: "Journal",
        link_2: "Stores",
        link_3: "Unsubscribe",
        bg_color: "#1a1a1a",
        brand_color: "#f7f5f0",
        link_color: "#c9c1b3",
        meta_color: "#8a8175"
      },
      propTypes: {
        brand_name: "text",
        link_1: "text",
        link_2: "text",
        link_3: "text",
        bg_color: "color",
        brand_color: "color",
        link_color: "color",
        meta_color: "color"
      },
      html_template: `<tr><td style="padding:32px 56px;background-color:{{bg_color}};" align="center">
  <p style="margin:0 0 12px 0;font-family:'Georgia',serif;font-size:16px;letter-spacing:6px;color:{{brand_color}};text-transform:uppercase;">{{brand_name}}</p>
  <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:1px;color:{{meta_color}};">
    <a href="#" style="color:{{link_color}};text-decoration:none;">{{link_1}}</a> &nbsp;·&nbsp;
    <a href="#" style="color:{{link_color}};text-decoration:none;">{{link_2}}</a> &nbsp;·&nbsp;
    <a href="#" style="color:{{link_color}};text-decoration:none;">{{link_3}}</a>
  </p>
</td></tr>`
    }
  ]
};
