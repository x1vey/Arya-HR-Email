/**
 * Custom Values — GHL-inspired reusable placeholders.
 *
 * A CustomValue resolves a named token like {{custom.company_name}} to a
 * user-defined value. Values can be text, URLs, or image URLs.
 *
 * "System" values are pre-created and can't be deleted (but the user can
 * edit their value). User-created values can be freely added/removed.
 *
 * Groups organise values into logical sections in the UI:
 *   - company  — auto-populated from Company Details form
 *   - sender   — who's sending
 *   - links    — unsub, privacy, etc.
 *   - custom   — user-created catch-all
 */

export type CustomValueType = "text" | "url" | "image";
export type CustomValueGroup = "company" | "sender" | "links" | "custom";

export interface CustomValue {
  id: string;
  /** Dot-free key used in templates: {{custom.<key>}} */
  key: string;
  label: string;
  value: string;
  type: CustomValueType;
  group: CustomValueGroup;
  /** System values can't be deleted, only edited */
  system?: boolean;
}

export interface CompanyDetails {
  name: string;
  logo_url: string;
  address: string;
  website: string;
  phone: string;
}

export const DEFAULT_COMPANY: CompanyDetails = {
  name: "",
  logo_url: "",
  address: "",
  website: "",
  phone: "",
};

/** Token prefix — templates use {{custom.key}} */
export const CV_PREFIX = "custom";

/**
 * Built-in system values created on first load.
 * Users can change the value but not delete these.
 */
export function createSystemValues(company: CompanyDetails): CustomValue[] {
  return [
    // Company
    { id: "cv_company_name", key: "company_name", label: "Company name", value: company.name || "Your Company", type: "text", group: "company", system: true },
    { id: "cv_company_logo", key: "company_logo", label: "Company logo", value: company.logo_url || "https://placehold.co/180x40/4F6B4A/FFFFFF?text=Logo", type: "image", group: "company", system: true },
    { id: "cv_company_address", key: "company_address", label: "Company address", value: company.address || "123 Main St, City, State", type: "text", group: "company", system: true },
    { id: "cv_company_website", key: "company_website", label: "Company website", value: company.website || "https://yourcompany.com", type: "url", group: "company", system: true },
    { id: "cv_company_phone", key: "company_phone", label: "Company phone", value: company.phone || "", type: "text", group: "company", system: true },
    // Sender
    { id: "cv_sender_name", key: "sender_name", label: "Sender name", value: "People Ops Team", type: "text", group: "sender", system: true },
    { id: "cv_sender_title", key: "sender_title", label: "Sender title", value: "HR Manager", type: "text", group: "sender", system: true },
    { id: "cv_sender_email", key: "sender_email", label: "Sender email", value: "hr@yourcompany.com", type: "text", group: "sender", system: true },
    // Links
    { id: "cv_unsub_link", key: "unsub_link", label: "Unsubscribe link", value: "#unsubscribe", type: "url", group: "links", system: true },
    { id: "cv_privacy_link", key: "privacy_link", label: "Privacy policy link", value: "#privacy", type: "url", group: "links", system: true },
  ];
}

/** Build a flat scope object from custom values for the rendering pipeline.
 *  Returns { custom: { company_name: "Acme", unsub_link: "...", ... } }
 */
export function buildCustomValueScope(values: CustomValue[]): Record<string, unknown> {
  const inner: Record<string, string> = {};
  for (const v of values) {
    inner[v.key] = v.value;
  }
  return { [CV_PREFIX]: inner };
}

/** Group label for UI sections */
export const GROUP_LABELS: Record<CustomValueGroup, string> = {
  company: "Company",
  sender: "Sender",
  links: "Links",
  custom: "Custom",
};
