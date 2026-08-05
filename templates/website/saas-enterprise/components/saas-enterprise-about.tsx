"use client";

import { FlagshipAboutSection } from "@/lib/website/template-v2/flagship/about-section";
import { SAAS_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

type Props = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
};

export function SaasEnterpriseAbout({
  eyebrow = "Our story",
  title = "Built by operators, for operators",
  subtitle,
  body = "Northline began inside a revenue operations team that was tired of stitching together spreadsheets, CRM exports, and BI tools. We built the command center we wished existed — and now power GTM teams at scale.",
  imageUrl,
  highlights = [
    "Founded by former Salesforce and Snowflake leaders",
    "Backed by tier-one enterprise investors",
    "Deployed across 40+ countries",
  ],
  primaryCta = "Meet the team",
}: Props) {
  return (
    <FlagshipAboutSection
      ui={SAAS_FLAGSHIP_UI}
      componentId="saas-enterprise-about"
      id="about"
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      body={body}
      imageUrl={imageUrl}
      highlights={highlights}
      primaryCta={primaryCta}
      primaryCtaHref="#contact"
    />
  );
}
