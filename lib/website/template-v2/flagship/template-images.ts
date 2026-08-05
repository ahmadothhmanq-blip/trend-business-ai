/**
 * @deprecated V2 templates use semantic slots from `@/lib/site-images`.
 * This module remains for backward compatibility with legacy tooling only.
 */
import { buildSlotsFromProfile } from "@/lib/ai-core/image-engine/profile-engine";
import { slotUrls } from "@/lib/ai-core/image-engine/slots";

function profileSlots(industry: string) {
  return buildSlotsFromProfile({ industry }, { projectSeed: industry }).slots;
}

function pick(pool: string[], index: number, fallback: string): string {
  return pool[index % pool.length] ?? fallback;
}

const restaurant = profileSlots("restaurant");
const corporate = profileSlots("corporate");
const saas = profileSlots("saas");
const hotel = profileSlots("hotel");
const finance = profileSlots("finance");
const education = profileSlots("education");
const creative = profileSlots("creative-agency");
const realEstate = profileSlots("real-estate");
const medical = profileSlots("medical");
const ecommerce = profileSlots("ecommerce");

export const RESTAURANT_PREMIUM_IMAGES = {
  hero: slotUrls(restaurant, "hero")[0]!,
  diningRoom: slotUrls(restaurant, "about")[0]!,
  chef: slotUrls(restaurant, "about")[0]!,
  dishes: slotUrls(restaurant, "products"),
  gallery: slotUrls(restaurant, "gallery"),
  atmosphereWide: slotUrls(restaurant, "backgrounds")[0]!,
  atmosphereDetail: slotUrls(restaurant, "backgrounds")[1] ?? slotUrls(restaurant, "backgrounds")[0]!,
  reservation: slotUrls(restaurant, "backgrounds")[0]!,
};

export const CORPORATE_BUSINESS_IMAGES = {
  hero: slotUrls(corporate, "hero")[0]!,
  boardroom: slotUrls(corporate, "features")[0]!,
  team: slotUrls(corporate, "team")[0]!,
  skyline: slotUrls(corporate, "backgrounds")[0]!,
  caseStudies: slotUrls(corporate, "features"),
};

export const SAAS_ENTERPRISE_IMAGES = {
  hero: slotUrls(saas, "hero")[0]!,
  dashboard: slotUrls(saas, "features")[0]!,
  analytics: slotUrls(saas, "features")[1] ?? slotUrls(saas, "features")[0]!,
  team: slotUrls(saas, "team")[0]!,
};

export const HOTEL_RESORT_PREMIUM_IMAGES = {
  hero: slotUrls(hotel, "hero")[0]!,
  pool: slotUrls(hotel, "features")[0]!,
  suite: slotUrls(hotel, "about")[0]!,
  gallery: slotUrls(hotel, "gallery"),
};

export const FINANCE_PREMIUM_IMAGES = {
  hero: slotUrls(finance, "hero")[0]!,
  boardroom: slotUrls(finance, "features")[0]!,
  skyline: slotUrls(finance, "backgrounds")[0]!,
  gallery: slotUrls(finance, "gallery"),
};

export const EDUCATION_PREMIUM_IMAGES = {
  hero: slotUrls(education, "hero")[0]!,
  campus: slotUrls(education, "about")[0]!,
  students: slotUrls(education, "team")[0]!,
  gallery: slotUrls(education, "gallery"),
};

export const CREATIVE_AGENCY_PREMIUM_IMAGES = {
  hero: slotUrls(creative, "hero")[0]!,
  studio: slotUrls(creative, "about")[0]!,
  work: slotUrls(creative, "gallery"),
};

export const REAL_ESTATE_PREMIUM_IMAGES = {
  hero: slotUrls(realEstate, "hero")[0]!,
  interior: slotUrls(realEstate, "about")[0]!,
  exterior: slotUrls(realEstate, "features")[0]!,
  gallery: slotUrls(realEstate, "gallery"),
};

export const MEDICAL_PREMIUM_IMAGES = {
  hero: slotUrls(medical, "hero")[0]!,
  clinic: slotUrls(medical, "about")[0]!,
  physician: slotUrls(medical, "team")[0]!,
  wellness: slotUrls(medical, "about")[1] ?? slotUrls(medical, "about")[0]!,
  gallery: slotUrls(medical, "gallery"),
};

export const ECOMMERCE_PREMIUM_IMAGES = {
  hero: slotUrls(ecommerce, "hero")[0]!,
  studio: slotUrls(ecommerce, "about")[0]!,
  lifestyle: slotUrls(ecommerce, "about")[1] ?? slotUrls(ecommerce, "about")[0]!,
  products: slotUrls(ecommerce, "products"),
};

/** @deprecated Use resolveSlotImage from @/lib/site-images */
export function pickImage(pool: string[], index: number, fallback: string): string {
  return pick(pool, index, fallback);
}
