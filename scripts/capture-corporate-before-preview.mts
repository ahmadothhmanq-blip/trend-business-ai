/**
 * Capture "before" full-page preview by temporarily restoring pass-1 rejected components.
 * Run: npx tsx scripts/capture-corporate-before-preview.mts
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const reviewDir = path.join(root, "scripts/benchmark-results/visual-reviews/corporate-business");
const backupDir = path.join(reviewDir, "_before-backup");
const compDir = path.join(root, "templates/website/corporate-business/components");

const files = [
  "corporate-business-hero.tsx",
  "corporate-business-stats.tsx",
  "corporate-business-about.tsx",
  "corporate-business-testimonials.tsx",
  "corporate-business-contact.tsx",
  "corporate-business-nav.tsx",
  "corporate-business-footer.tsx",
  "corporate-business-features.tsx",
];

mkdirSync(backupDir, { recursive: true });
for (const f of files) {
  const src = path.join(compDir, f);
  if (existsSync(src)) copyFileSync(src, path.join(backupDir, f));
}

// Pass-1 rejected hero — dominant stock photo, generic layout
writeFileSync(
  path.join(compDir, "corporate-business-hero.tsx"),
  readFileSync(path.join(reviewDir, "before-hero.tsx"), "utf8"),
);

// Pass-1 shared flagship wrappers
writeFileSync(
  path.join(compDir, "corporate-business-stats.tsx"),
  `"use client";

import { FlagshipStatsSection } from "@/lib/website/template-v2/flagship/stats-section";
import { CORPORATE_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

export function CorporateBusinessStats(props: { eyebrow?: string; title?: string; subtitle?: string; stats?: Array<{ value: string; label: string; detail?: string }> } = {}) {
  return (
    <FlagshipStatsSection
      ui={CORPORATE_FLAGSHIP_UI}
      componentId="corporate-business-stats"
      id="stats"
      eyebrow="Track record"
      title="Outcomes our clients measure"
      subtitle="Representative results from recent advisory and transformation engagements."
      stats={[
        { value: "40yr", label: "Combined partner tenure", detail: "Senior leadership" },
        { value: "28", label: "Countries served", detail: "Global delivery" },
        { value: "97%", label: "Client retention", detail: "Three-year average" },
        { value: "14wk", label: "Discovery to roadmap", detail: "Typical engagement" },
      ]}
      {...props}
    />
  );
}
`,
);

writeFileSync(
  path.join(compDir, "corporate-business-about.tsx"),
  `"use client";

import { FlagshipAboutSection } from "@/lib/website/template-v2/flagship/about-section";
import { CORPORATE_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

export function CorporateBusinessAbout(props: Record<string, unknown> = {}) {
  return (
    <FlagshipAboutSection
      ui={CORPORATE_FLAGSHIP_UI}
      componentId="corporate-business-about"
      id="about"
      eyebrow="Corporate excellence"
      title="Trusted leadership for complex organizations"
      body="For over two decades we have partnered with global enterprises to deliver strategy, transformation, and measurable outcomes — with integrity at the center of every engagement."
      highlights={["Fortune 500 advisory experience", "Offices across North America, Europe, and MENA", "ISO-certified governance frameworks"]}
      primaryCta="Speak with an advisor"
      primaryCtaHref="#contact"
      {...props}
    />
  );
}
`,
);

writeFileSync(
  path.join(compDir, "corporate-business-testimonials.tsx"),
  `"use client";

import { FlagshipTestimonialsSection } from "@/lib/website/template-v2/flagship/testimonials-section";
import { CORPORATE_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

export function CorporateBusinessTestimonials(props: Record<string, unknown> = {}) {
  return (
    <FlagshipTestimonialsSection
      ui={CORPORATE_FLAGSHIP_UI}
      componentId="corporate-business-testimonials"
      id="testimonials"
      eyebrow="Client stories"
      title="Trusted by executive sponsors"
      subtitle="Leaders who partner with Meridian for strategy, transformation, and governance."
      items={[
        { quote: "Meridian brought board-level clarity to a complex transformation.", name: "Catherine Holt", role: "Chief Operating Officer", company: "Axiom Industrial Group" },
        { quote: "Their partners embedded with our leadership team and delivered measurable EBITDA impact.", name: "Raj Mehta", role: "Managing Director", company: "Harbor Capital Partners" },
        { quote: "The most rigorous advisory relationship we have had.", name: "Elena Brandt", role: "General Counsel", company: "Northgate Financial" },
      ]}
      {...props}
    />
  );
}
`,
);

writeFileSync(
  path.join(compDir, "corporate-business-contact.tsx"),
  `"use client";

import { FlagshipContactSection } from "@/lib/website/template-v2/flagship/contact-section";
import { CORPORATE_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

export function CorporateBusinessContact(props: Record<string, unknown> = {}) {
  return (
    <FlagshipContactSection
      ui={CORPORATE_FLAGSHIP_UI}
      componentId="corporate-business-contact"
      id="contact"
      eyebrow="Contact"
      title="Speak with a senior partner"
      subtitle="Share your priorities and we will assemble the right advisory team for a confidential consultation."
      email="partners@meridianadvisory.com"
      phone="+1 (212) 555-0180"
      address="200 Park Avenue, New York, NY"
      submitLabel="Request consultation"
      {...props}
    />
  );
}
`,
);

console.log("Regenerating before preview...");
execSync("npx tsx scripts/flagship-template-qa.mts corporate-business --skip-lighthouse", {
  stdio: "inherit",
  cwd: root,
});

console.log("Before preview ready at scripts/benchmark-results/flagship-previews/corporate-business/preview.html");
console.log("Restore with: npx tsx scripts/restore-corporate-after-preview.mts");
