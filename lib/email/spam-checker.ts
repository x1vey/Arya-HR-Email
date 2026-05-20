/**
 * Client-side email deliverability checker.
 *
 * Scans all visible text in the email for patterns that spam filters flag:
 * trigger words, ALL CAPS, excessive punctuation, missing unsubscribe, etc.
 * Returns a score (0–100, higher = worse) and actionable warnings.
 */

export interface SpamResult {
  /** 0 = clean, 100 = very spammy */
  score: number;
  /** "good" | "warning" | "bad" */
  rating: "good" | "warning" | "bad";
  warnings: SpamWarning[];
}

export interface SpamWarning {
  type: "word" | "caps" | "punctuation" | "link" | "missing" | "structure";
  message: string;
  /** How much this contributes to the score */
  weight: number;
}

// ── Trigger words grouped by severity ──

const HIGH_RISK: string[] = [
  "act now", "apply now", "buy direct", "buy now", "click below",
  "click here", "click now", "direct email", "earn money",
  "free access", "free gift", "free trial", "get it now",
  "limited time", "no cost", "no obligation", "offer expires",
  "once in a lifetime", "order now", "risk free", "sign up free",
  "take action now", "urgent", "winner", "you have been selected",
  "congratulations", "100% free", "act immediately",
  "don't delete", "don't miss out", "exclusive deal",
  "for free", "get paid", "great offer", "guarantee",
  "increase your", "incredible deal", "million dollars",
  "no catch", "no fees", "no strings attached",
  "this isn't spam", "while supplies last",
];

const MEDIUM_RISK: string[] = [
  "as seen on", "be your own boss", "bonus", "cash",
  "cheap", "compare rates", "credit", "deal", "debt",
  "discount", "double your", "extra income", "fast cash",
  "financial freedom", "free consultation", "free info",
  "free membership", "full refund", "gift card",
  "income from home", "instant", "investment",
  "lowest price", "luxury", "money back",
  "no experience", "no purchase necessary",
  "opt in", "pennies", "profit", "promise",
  "pure profit", "save big", "save money",
  "special promotion", "unbelievable",
  "unlimited", "unsolicited", "weight loss",
  "work from home",
];

const LOW_RISK: string[] = [
  "affordable", "all new", "amazing", "bargain",
  "best price", "cancel anytime", "certified",
  "claim", "clearance", "compare", "confidential",
  "donate", "drastically", "earn", "exclusive",
  "expire", "fantastic", "free", "hurry",
  "immediately", "important information", "join",
  "last chance", "lifetime", "limited", "lowest",
  "miracle", "new", "now", "offer", "only",
  "opportunity", "order", "please read", "potential",
  "prize", "promotion", "reduced", "refund",
  "reminder", "remove", "request", "sale",
  "satisfaction", "save", "special", "success",
  "trial", "undisclosed", "verify",
];

/**
 * Extract all visible text from rendered email HTML.
 */
function extractText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Check deliverability of an email.
 *
 * @param html The rendered HTML of the email
 * @param options Optional checks: whether an unsubscribe link exists, subject line, etc.
 */
export function checkSpam(
  html: string,
  options?: {
    subject?: string;
    hasUnsubscribe?: boolean;
    hasPlainText?: boolean;
  }
): SpamResult {
  const text = extractText(html);
  const lower = text.toLowerCase();
  const subject = options?.subject?.toLowerCase() ?? "";
  const warnings: SpamWarning[] = [];

  // ── Trigger word scan ──
  const allText = lower + " " + subject;

  for (const word of HIGH_RISK) {
    if (allText.includes(word)) {
      warnings.push({
        type: "word",
        message: `High-risk phrase: "${word}"`,
        weight: 8,
      });
    }
  }

  for (const word of MEDIUM_RISK) {
    if (allText.includes(word)) {
      warnings.push({
        type: "word",
        message: `Risky phrase: "${word}"`,
        weight: 4,
      });
    }
  }

  // Only flag low-risk words if there are multiple
  let lowCount = 0;
  const lowMatches: string[] = [];
  for (const word of LOW_RISK) {
    if (allText.includes(word)) {
      lowCount++;
      if (lowMatches.length < 3) lowMatches.push(word);
    }
  }
  if (lowCount >= 3) {
    warnings.push({
      type: "word",
      message: `${lowCount} soft-trigger words found (${lowMatches.join(", ")}${lowCount > 3 ? ", ..." : ""})`,
      weight: lowCount,
    });
  }

  // ── ALL CAPS check ──
  const words = text.split(/\s+/).filter((w) => w.length >= 4);
  const capsWords = words.filter((w) => w === w.toUpperCase() && /[A-Z]/.test(w));
  const capsRatio = words.length > 0 ? capsWords.length / words.length : 0;
  if (capsRatio > 0.15 && capsWords.length >= 3) {
    warnings.push({
      type: "caps",
      message: `${Math.round(capsRatio * 100)}% of words are ALL CAPS (${capsWords.slice(0, 3).join(", ")}...)`,
      weight: Math.min(capsWords.length * 2, 15),
    });
  }

  // ── Excessive punctuation ──
  const exclamations = (text.match(/!/g) || []).length;
  if (exclamations > 3) {
    warnings.push({
      type: "punctuation",
      message: `${exclamations} exclamation marks — spam filters flag excessive punctuation`,
      weight: Math.min(exclamations * 2, 12),
    });
  }
  if (/[!?]{2,}/.test(text)) {
    warnings.push({
      type: "punctuation",
      message: `Repeated punctuation (!! or ??) is a spam signal`,
      weight: 6,
    });
  }

  // ── Subject line checks ──
  if (subject) {
    if (subject === subject.toUpperCase() && subject.length > 5) {
      warnings.push({
        type: "caps",
        message: "Subject line is ALL CAPS — major spam signal",
        weight: 15,
      });
    }
    if (/re:|fw:/i.test(subject) && !options?.subject?.startsWith("Re:")) {
      warnings.push({
        type: "word",
        message: 'Fake "Re:" or "Fw:" in subject line — deceptive',
        weight: 10,
      });
    }
  }

  // ── Missing essentials ──
  if (options?.hasUnsubscribe === false) {
    warnings.push({
      type: "missing",
      message: "No unsubscribe link — required by CAN-SPAM and most ESPs",
      weight: 12,
    });
  }

  if (options?.hasPlainText === false) {
    warnings.push({
      type: "missing",
      message: "No plain-text version — including one improves deliverability",
      weight: 5,
    });
  }

  // ── Structure checks ──
  const imageCount = (html.match(/<img[\s>]/gi) || []).length;
  const textLength = text.length;
  if (imageCount > 0 && textLength < 100) {
    warnings.push({
      type: "structure",
      message: "Very low text-to-image ratio — add more text content",
      weight: 8,
    });
  }

  if (textLength < 50) {
    warnings.push({
      type: "structure",
      message: "Email body is very short — extremely short emails look suspicious",
      weight: 6,
    });
  }

  const linkCount = (html.match(/<a[\s>]/gi) || []).length;
  if (linkCount > 10) {
    warnings.push({
      type: "link",
      message: `${linkCount} links — too many links can trigger spam filters`,
      weight: Math.min(linkCount - 8, 10),
    });
  }

  // ── Calculate score ──
  const rawScore = warnings.reduce((sum, w) => sum + w.weight, 0);
  const score = Math.min(100, rawScore);

  const rating: SpamResult["rating"] =
    score <= 15 ? "good" : score <= 40 ? "warning" : "bad";

  return { score, rating, warnings };
}
