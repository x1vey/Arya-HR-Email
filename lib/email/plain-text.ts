/**
 * Convert rendered email HTML into a clean plain-text version.
 *
 * Plain text alternatives improve deliverability (spam filters prefer
 * multipart/alternative emails) and are required by some ESPs.
 */

export function htmlToPlainText(html: string): string {
  let text = html;

  // Remove invisible elements
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "");
  text = text.replace(/<!--[\s\S]*?-->/g, "");

  // Remove hidden preheader spans
  text = text.replace(/<span[^>]*display:\s*none[^>]*>[\s\S]*?<\/span>/gi, "");

  // Convert links: <a href="url">text</a> → text (url)
  text = text.replace(
    /<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_m, url: string, linkText: string) => {
      const clean = linkText.replace(/<[^>]+>/g, "").trim();
      if (!url || url === "#") return clean;
      if (clean.toLowerCase() === url.toLowerCase()) return clean;
      return `${clean} (${url})`;
    }
  );

  // Convert images: <img alt="text"> → [text]
  text = text.replace(
    /<img[^>]*alt=["']([^"']+)["'][^>]*\/?>/gi,
    (_m, alt: string) => `[${alt}]`
  );
  text = text.replace(/<img[^>]*\/?>/gi, "");

  // Block elements → newlines
  text = text.replace(/<\/?(h[1-6]|p|div|tr|li|blockquote)[^>]*>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<hr[^>]*\/?>/gi, "\n---\n");

  // List items
  text = text.replace(/<li[^>]*>/gi, "\n  - ");

  // Remove all remaining tags
  text = text.replace(/<[^>]+>/g, "");

  // Decode HTML entities
  text = text.replace(/&nbsp;/gi, " ");
  text = text.replace(/&amp;/gi, "&");
  text = text.replace(/&lt;/gi, "<");
  text = text.replace(/&gt;/gi, ">");
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&#39;/gi, "'");
  text = text.replace(/&mdash;/gi, "—");
  text = text.replace(/&ndash;/gi, "–");
  text = text.replace(/&bull;/gi, "•");
  text = text.replace(/&#\d+;/gi, "");

  // Clean up whitespace
  text = text.replace(/[ \t]+/g, " "); // collapse horizontal space
  text = text.replace(/\n /g, "\n");   // trim leading space after newlines
  text = text.replace(/ \n/g, "\n");   // trim trailing space before newlines
  text = text.replace(/\n{3,}/g, "\n\n"); // max two consecutive newlines
  text = text.trim();

  return text;
}
