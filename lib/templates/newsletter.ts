import type { Template } from "@/lib/blocks/types";

/**
 * Reverse-engineered from the FullSphere classic newsletter HTML.
 *
 * This template is the most "email-safe" of the three samples — it uses
 * tables, inline styles, and explicit width attributes. It survives
 * Outlook, Gmail, dark-mode rendering, all the usual rendering hellscapes.
 *
 * Block segmentation follows the natural `<table>` boundaries in the
 * source HTML. Each top-level table = one block.
 *
 * HR repurposing ideas:
 *   - Monthly company update / "People newsletter"
 *   - Quarterly all-hands recap
 *   - New-joiner announcement digest
 *   - Benefits enrollment season comms
 */
export const newsletterTemplate: Template = {
  id: "tpl_newsletter_v1",
  name: "Classic Newsletter",
  category: "newsletter",
  variables: [
    { key: "recipient.first_name", label: "Recipient first name", sample: "Priya", required: false },
    { key: "company.name", label: "Company name", sample: "Acme Inc", required: true },
    { key: "company.address", label: "Company address", sample: "12 MG Road, Bengaluru 560001", required: true },
    { key: "company.website", label: "Company website", sample: "https://acme.com", required: true },
    { key: "links.unsubscribe", label: "Unsubscribe URL", sample: "https://acme.com/unsubscribe?u=priya", required: true },
    { key: "links.view_in_browser", label: "View-in-browser URL", sample: "https://acme.com/email/abc123", required: false }
  ],
  wrapper_html: `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<title>Newsletter from {{company.name}}</title>
<style type="text/css">
  a, a[href], a:hover, a:link, a:visited { text-decoration: none !important; color: #0000EE; }
  .link { text-decoration: underline !important; }
  p, p:visited { font-size:15px; line-height:24px; font-family:'Helvetica', Arial, sans-serif; font-weight:300; text-decoration:none; color: #000000; }
  h1 { font-size:22px; line-height:24px; font-family:'Helvetica', Arial, sans-serif; font-weight:normal; text-decoration:none; color: #000000; }
  .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td { line-height: 100%; }
  .ExternalClass { width: 100%; }
</style>
</head>
<body style="text-align: center; margin: 0; padding-top: 10px; padding-bottom: 10px; padding-left: 0; padding-right: 0; -webkit-text-size-adjust: 100%; background-color: #f2f4f6; color: #000000;" align="center">
<div style="text-align: center;">
{{__blocks__}}
</div>
</body>
</html>`,
  blocks: [
    {
      id: "blk_display_notice",
      type: "display_notice",
      label: "\"Not displaying?\" notice",
      props: {
        message: "Is this email not displaying correctly?",
        link_text: "Click here",
        link_suffix: " to view in browser",
        link_url: "{{links.view_in_browser}}"
      },
      propTypes: {
        message: "text",
        link_text: "text",
        link_suffix: "text",
        link_url: "link_url"
      },
      html_template: `<table align="center" style="text-align: center; vertical-align: middle; width: 600px; max-width: 600px;" width="600">
<tbody><tr>
<td style="width: 596px; vertical-align: middle;" width="596">
<p style="font-size: 11px; line-height: 20px; font-family: 'Helvetica', Arial, sans-serif; font-weight: 400; text-decoration: none; color: #000000;">{{message}} <a class="link" style="text-decoration: underline;" target="_blank" href="{{link_url}}"><u>{{link_text}}</u></a>{{link_suffix}}</p>
</td>
</tr></tbody>
</table>`
    },
    {
      id: "blk_logo_header",
      type: "logo_header_light",
      label: "Logo header (light)",
      locked: true,
      props: {
        logo_url: "https://fullsphere.co.uk/misc/free-template/images/logo-white-background.jpg",
        logo_alt: "{{company.name}} logo",
        background_color: "#ffffff"
      },
      propTypes: {
        logo_url: "image_url",
        logo_alt: "text",
        background_color: "color"
      },
      html_template: `<table align="center" style="text-align: center; vertical-align: top; width: 600px; max-width: 600px; background-color: {{background_color}};" width="600">
<tbody><tr>
<td style="width: 596px; vertical-align: top; padding-left: 0; padding-right: 0; padding-top: 15px; padding-bottom: 15px;" width="596">
<img style="width: 180px; max-width: 180px; height: 85px; max-height: 85px; text-align: center;" alt="{{logo_alt}}" src="{{logo_url}}" align="center" width="180" height="85">
</td>
</tr></tbody>
</table>`
    },
    {
      id: "blk_hero_image",
      type: "hero_image_full",
      label: "Hero image (full width)",
      props: {
        image_url: "https://fullsphere.co.uk/misc/free-template/images/hero.jpg",
        alt_text: "Hero image"
      },
      propTypes: {
        image_url: "image_url",
        alt_text: "text"
      },
      html_template: `<img style="width: 600px; max-width: 600px; height: 350px; max-height: 350px; text-align: center; display: block; margin: 0 auto;" alt="{{alt_text}}" src="{{image_url}}" align="center" width="600" height="350">`
    },
    {
      id: "blk_single_column_cta",
      type: "single_column_with_cta",
      label: "Single column + CTA",
      props: {
        heading: "Single column, dolor sit amet",
        body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam mattis ante sed imperdiet euismod. Vivamus fermentum bibendum turpis, et tempor dui. Sed vitae lectus egestas, finibus purus ac, rutrum mauris.",
        secondary_text: "You can download this template here.",
        cta_label: "Learn more",
        cta_url: "{{company.website}}",
        button_color: "#000000",
        button_text_color: "#ffffff"
      },
      propTypes: {
        heading: "text",
        body: "longtext",
        secondary_text: "longtext",
        cta_label: "text",
        cta_url: "link_url",
        button_color: "color",
        button_text_color: "color"
      },
      html_template: `<table align="center" style="text-align: center; vertical-align: top; width: 600px; max-width: 600px; background-color: #ffffff;" width="600">
<tbody><tr>
<td style="width: 596px; vertical-align: top; padding-left: 30px; padding-right: 30px; padding-top: 30px; padding-bottom: 40px;" width="596">
<h1 style="font-size: 20px; line-height: 24px; font-family: 'Helvetica', Arial, sans-serif; font-weight: 600; text-decoration: none; color: #000000;">{{heading}}</h1>
<p style="font-size: 15px; line-height: 24px; font-family: 'Helvetica', Arial, sans-serif; font-weight: 400; text-decoration: none; color: #919293;">{{body}}</p>
<p style="font-size: 15px; line-height: 24px; font-family: 'Helvetica', Arial, sans-serif; font-weight: 400; text-decoration: none; color: #919293;">{{secondary_text}}</p>
<a href="{{cta_url}}" target="_blank" style="background-color: {{button_color}}; font-size: 15px; line-height: 22px; font-family: 'Helvetica', Arial, sans-serif; font-weight: normal; text-decoration: none; padding: 12px 15px; color: {{button_text_color}}; border-radius: 5px; display: inline-block;"><span style="color: {{button_text_color}};">{{cta_label}}</span></a>
</td>
</tr></tbody>
</table>`
    },
    {
      id: "blk_inline_image_2",
      type: "inline_image_full",
      label: "Inline image #1",
      props: {
        image_url: "https://fullsphere.co.uk/misc/free-template/images/image-2.jpg",
        alt_text: "Inline image"
      },
      propTypes: {
        image_url: "image_url",
        alt_text: "text"
      },
      html_template: `<img style="width: 600px; max-width: 600px; height: 240px; max-height: 240px; text-align: center; display: block; margin: 0 auto;" alt="{{alt_text}}" src="{{image_url}}" align="center" width="600" height="240">`
    },
    {
      id: "blk_double_column_heading",
      type: "section_heading",
      label: "Section heading",
      props: {
        heading: "Double column, dolor sit amet"
      },
      propTypes: {
        heading: "text"
      },
      html_template: `<table align="center" style="text-align: center; vertical-align: top; width: 600px; max-width: 600px; background-color: #ffffff;" width="600">
<tbody><tr>
<td style="width: 596px; vertical-align: top; padding-left: 30px; padding-right: 30px; padding-top: 30px; padding-bottom: 0;" width="596">
<h1 style="font-size: 20px; line-height: 24px; font-family: 'Helvetica', Arial, sans-serif; font-weight: 600; text-decoration: none; color: #000000; margin-bottom: 0;">{{heading}}</h1>
</td>
</tr></tbody>
</table>`
    },
    {
      id: "blk_double_column",
      type: "double_column_text",
      label: "Two-column text",
      props: {
        column_1: "Vivamus felis velit, iaculis eu eros sed, consequat viverra libero. Aliquam ipsum eros, imperdiet eget fermentum eget, cursus a sapien.",
        column_2: "Pellentesque mollis bibendum sollicitudin. Aenean tempor eros at risus mollis gravida. Aenean in urna eget elit pretium ultrices eu vitae elit."
      },
      propTypes: {
        column_1: "longtext",
        column_2: "longtext"
      },
      html_template: `<table align="center" style="text-align: center; vertical-align: top; width: 600px; max-width: 600px; background-color: #ffffff;" width="600">
<tbody><tr>
<td style="width: 252px; vertical-align: top; padding-left: 30px; padding-right: 15px; padding-top: 0; padding-bottom: 30px; text-align: center;" width="252">
<p style="font-size: 15px; line-height: 24px; font-family: 'Helvetica', Arial, sans-serif; font-weight: 400; text-decoration: none; color: #919293;">{{column_1}}</p>
</td>
<td style="width: 252px; vertical-align: top; padding-left: 15px; padding-right: 30px; padding-top: 0; padding-bottom: 30px; text-align: center;" width="252">
<p style="font-size: 15px; line-height: 24px; font-family: 'Helvetica', Arial, sans-serif; font-weight: 400; text-decoration: none; color: #919293;">{{column_2}}</p>
</td>
</tr></tbody>
</table>`
    },
    {
      id: "blk_inline_image_3",
      type: "inline_image_full",
      label: "Inline image #2",
      props: {
        image_url: "https://fullsphere.co.uk/misc/free-template/images/image-3.jpg",
        alt_text: "Inline image"
      },
      propTypes: {
        image_url: "image_url",
        alt_text: "text"
      },
      html_template: `<img style="width: 600px; max-width: 600px; height: 240px; max-height: 240px; text-align: center; display: block; margin: 0 auto;" alt="{{alt_text}}" src="{{image_url}}" align="center" width="600" height="240">`
    },
    {
      id: "blk_footer_dark",
      type: "footer_dark_with_logo",
      label: "Footer (dark)",
      locked: true,
      props: {
        logo_url: "https://fullsphere.co.uk/misc/free-template/images/logo-black-background.jpg",
        address: "{{company.address}}",
        website_label: "{{company.website}}",
        website_url: "{{company.website}}",
        background_color: "#000000",
        text_color: "#ffffff"
      },
      propTypes: {
        logo_url: "image_url",
        address: "text",
        website_label: "text",
        website_url: "link_url",
        background_color: "color",
        text_color: "color"
      },
      html_template: `<table align="center" style="text-align: center; vertical-align: top; width: 600px; max-width: 600px; background-color: {{background_color}};" width="600">
<tbody><tr>
<td style="width: 596px; vertical-align: top; padding-left: 30px; padding-right: 30px; padding-top: 30px; padding-bottom: 30px;" width="596">
<img style="width: 180px; max-width: 180px; height: 85px; max-height: 85px; text-align: center;" alt="Logo" src="{{logo_url}}" align="center" width="180" height="85">
<p style="font-size: 13px; line-height: 24px; font-family: 'Helvetica', Arial, sans-serif; font-weight: 400; text-decoration: none; color: {{text_color}};">{{address}}</p>
<p style="margin-bottom: 0; font-size: 13px; line-height: 24px; font-family: 'Helvetica', Arial, sans-serif; font-weight: 400; text-decoration: none; color: {{text_color}};">
<a target="_blank" style="text-decoration: underline; color: {{text_color}};" href="{{website_url}}">{{website_label}}</a>
</p>
</td>
</tr></tbody>
</table>`
    },
    {
      id: "blk_unsubscribe",
      type: "unsubscribe_block",
      label: "Unsubscribe footer",
      locked: true,
      props: {
        line_1: "Not wanting to receive these emails?",
        line_2_prefix: "You can ",
        unsubscribe_label: "unsubscribe here",
        unsubscribe_url: "{{links.unsubscribe}}",
        credit_text: "Sent by {{company.name}}"
      },
      propTypes: {
        line_1: "text",
        line_2_prefix: "text",
        unsubscribe_label: "text",
        unsubscribe_url: "link_url",
        credit_text: "text"
      },
      html_template: `<table align="center" style="text-align: center; vertical-align: top; width: 600px; max-width: 600px;" width="600">
<tbody><tr>
<td style="width: 596px; vertical-align: top; padding-left: 30px; padding-right: 30px; padding-top: 30px; padding-bottom: 30px;" width="596">
<p style="font-size: 12px; line-height: 12px; font-family: 'Helvetica', Arial, sans-serif; font-weight: normal; text-decoration: none; color: #000000;">{{line_1}}</p>
<p style="font-size: 12px; line-height: 12px; font-family: 'Helvetica', Arial, sans-serif; font-weight: normal; text-decoration: none; color: #000000;">{{line_2_prefix}}<a style="text-decoration: underline; color: #000000;" href="{{unsubscribe_url}}"><u>{{unsubscribe_label}}</u></a></p>
<p style="font-size: 12px; line-height: 12px; font-family: 'Helvetica', Arial, sans-serif; font-weight: normal; text-decoration: none; color: #919293; margin-top: 30px;">{{credit_text}}</p>
</td>
</tr></tbody>
</table>`
    }
  ]
};
