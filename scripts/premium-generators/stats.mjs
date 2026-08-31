import { STATS_GENERATORS } from "../layout-generators/stats.mjs";
import { createPremiumGenerator } from "./premiumize.mjs";

export const generatePremiumStats = createPremiumGenerator(STATS_GENERATORS, "four-column-grid", "stats");
