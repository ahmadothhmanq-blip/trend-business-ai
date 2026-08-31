import { TESTIMONIALS_GENERATORS } from "../layout-generators/testimonials.mjs";
import { createPremiumGenerator } from "./premiumize.mjs";

export const generatePremiumTestimonials = createPremiumGenerator(TESTIMONIALS_GENERATORS, "grid-cards", "testimonials");
