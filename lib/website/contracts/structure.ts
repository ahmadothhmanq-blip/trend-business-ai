/**
 * Structure template contract — type-only; catalog data lives in builder modules.
 */

export type WebsiteStructureTemplateId = string;

export type WebsiteStructureTemplate = {
  id: WebsiteStructureTemplateId;
  label: string;
  description: string;
  industry: string;
  layoutType: string;
  heroType: string;
  navigationType: string;
  footerType: string;
  sections: string[];
  /** Template Intelligence id retained for legacy generation compatibility. */
  templateIntelligenceId: string;
  marketplaceTemplateId: string;
  premiumTemplateId: string;
};
