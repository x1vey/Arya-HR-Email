import type { CustomValue, CompanyDetails } from "./types";
import { DEFAULT_COMPANY, createSystemValues } from "./types";

const CV_KEY = "arya_custom_values";
const COMPANY_KEY = "arya_company_details";

/* ── Company Details ── */

export function loadCompany(): CompanyDetails {
  try {
    return { ...DEFAULT_COMPANY, ...JSON.parse(localStorage.getItem(COMPANY_KEY) ?? "{}") };
  } catch {
    return { ...DEFAULT_COMPANY };
  }
}

export function saveCompany(c: CompanyDetails): void {
  localStorage.setItem(COMPANY_KEY, JSON.stringify(c));
}

/* ── Custom Values ── */

export function loadCustomValues(): CustomValue[] {
  try {
    const raw = localStorage.getItem(CV_KEY);
    if (raw) {
      const saved: CustomValue[] = JSON.parse(raw);
      // Ensure system values exist (user may be on an older save)
      return mergeSystemValues(saved);
    }
  } catch {
    // fall through
  }
  // First load — create defaults
  return createSystemValues(loadCompany());
}

export function saveCustomValues(values: CustomValue[]): void {
  localStorage.setItem(CV_KEY, JSON.stringify(values));
}

/**
 * Merge system values into a saved list — adds any system values that
 * are missing (e.g. after a code update adds new ones) while keeping the
 * user's edited values for existing system keys.
 */
function mergeSystemValues(saved: CustomValue[]): CustomValue[] {
  const system = createSystemValues(loadCompany());
  const savedKeys = new Set(saved.map((v) => v.key));
  const merged = [...saved];
  for (const sv of system) {
    if (!savedKeys.has(sv.key)) merged.push(sv);
  }
  return merged;
}

/** Sync company details into the matching system custom values. */
export function syncCompanyToValues(
  company: CompanyDetails,
  values: CustomValue[]
): CustomValue[] {
  const map: Record<string, string> = {
    company_name: company.name,
    company_logo: company.logo_url,
    company_address: company.address,
    company_website: company.website,
    company_phone: company.phone,
  };
  return values.map((v) =>
    v.key in map ? { ...v, value: map[v.key] || v.value } : v
  );
}
