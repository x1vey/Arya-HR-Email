import { newsletterTemplate } from "./newsletter";
import { cartAbandonmentTemplate } from "./cart-abandonment";
import { salesNurtureTemplate } from "./sales-nurture";
import { birthdayTemplate } from "./birthday";
import { onboardingDay1Template } from "./onboarding-day1";
import { oriAnnouncementTemplate } from "./ori-announcement";
import { oriPolicyUpdateTemplate } from "./ori-policy-update";
import { oriAllHandsTemplate } from "./ori-all-hands";
import { oriQuarterlyResultsTemplate } from "./ori-quarterly-results";
import { oriHolidayNoticeTemplate } from "./ori-holiday-notice";
import { oriBenefitsEnrollmentTemplate } from "./ori-benefits-enrollment";
import { oriSecurityAlertTemplate } from "./ori-security-alert";
import { oriEmployeeRecognitionTemplate } from "./ori-employee-recognition";
import { oriOfficeRelocationTemplate } from "./ori-office-relocation";
import { oriTownHallRecapTemplate } from "./ori-town-hall-recap";
import { blankTemplate } from "./blank";
import type { Template } from "@/lib/blocks/types";

/** A clean starting point exposed separately from the template grid. */
export { blankTemplate };
export const BLANK_TEMPLATE_ID = blankTemplate.id;

/**
 * Registry of all reverse-engineered templates.
 *
 * Ordered roughly by structural complexity, so the template switcher in
 * the editor leads with simpler/cleaner samples first and lets the user
 * step up to the more elaborate designs.
 */
export const TEMPLATE_LIBRARY: Template[] = [
  newsletterTemplate,
  birthdayTemplate,
  onboardingDay1Template,
  cartAbandonmentTemplate,
  salesNurtureTemplate,
  oriAnnouncementTemplate,
  oriPolicyUpdateTemplate,
  oriAllHandsTemplate,
  oriQuarterlyResultsTemplate,
  oriHolidayNoticeTemplate,
  oriBenefitsEnrollmentTemplate,
  oriSecurityAlertTemplate,
  oriEmployeeRecognitionTemplate,
  oriOfficeRelocationTemplate,
  oriTownHallRecapTemplate
];

export function getTemplateById(id: string): Template | undefined {
  if (id === blankTemplate.id) return blankTemplate;
  return TEMPLATE_LIBRARY.find((t) => t.id === id);
}
