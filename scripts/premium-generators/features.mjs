import { FEATURES_GENERATORS } from "../layout-generators/features.mjs";
import { createPremiumGenerator } from "./premiumize.mjs";

export const generatePremiumFeatures = createPremiumGenerator(FEATURES_GENERATORS, "bento-asymmetric", "features");
