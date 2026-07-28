/**
 * Infer Website Builder onboarding defaults from the user prompt alone.
 * Used when project type, language, theme, and style are not manually selected.
 */

import { detectIndustryFromPrompt } from "@/lib/ai-core/website-builder/prompt-industry";
import { resolveWebsiteOutputLanguage } from "@/lib/ai-core/website-builder/prompt-industry";
import type { IndustryId } from "@/lib/ai-core/templates/types";
import {
  dashboardColorThemeToDesignSystem,
  dashboardDesignStyleToPreset,
} from "@/lib/website/style-resolution";
import type { WebsiteGenerationInput } from "@/plugins/website/types";

export type InferredOnboardingDefaults = {
  projectType: string;
  language: string;
  theme: string;
  designStyle: string;
  colorTheme: string;
  designPreset: string;
  designSystem: NonNullable<WebsiteGenerationInput["designSystem"]>;
  industryId?: IndustryId;
};

const INDUSTRY_TO_PROJECT_TYPE: Record<string, string> = {
  restaurant: "Restaurant",
  clinic: "Clinic",
  law: "Law Firm",
  blog: "Blog",
  "landing-page": "Landing Page",
  "real-estate": "Real Estate",
  education: "Education",
  saas: "AI SaaS",
  ecommerce: "E-commerce",
  tourism: "Business Website",
  agency: "Business Website",
  automotive: "Business Website",
  furniture: "Business Website",
  technology: "AI SaaS",
  business: "Business Website",
};

function capitalizeLabel(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function inferDesignStyleLabel(
  prompt: string,
  industryId?: string,
): string {
  const hay = prompt.toLowerCase();
  if (/glassmorphism|\bglass\b/.test(hay)) return "Glass";
  if (/\bminimal\b|\bclean\b|\bsimple\b|\bsparse\b/.test(hay)) return "Minimal";
  if (/\bcorporate\b|\benterprise\b|\bprofessional\b|\btrust\b/.test(hay)) {
    return "Corporate";
  }
  if (/\bstartup\b|\bfintech\b|\bproduct-led\b/.test(hay)) return "Startup";
  if (/\bluxury\b|\bpremium\b|\belegant\b|\bboutique\b|\bhigh-end\b/.test(hay)) {
    return "Luxury";
  }
  if (/\bdark\b|\bnoir\b|\bnight\b|\bmidnight\b/.test(hay)) return "Dark";
  if (/\blight\b|\bbright\b|\bairy\b/.test(hay)) return "Light";
  if (/\bmodern\b|\bcontemporary\b/.test(hay)) return "Modern";

  if (industryId === "saas" || industryId === "technology") return "Modern";
  if (industryId === "restaurant" || industryId === "real-estate") return "Luxury";
  if (industryId === "clinic" || industryId === "education") return "Corporate";
  if (industryId === "agency") return "Modern";
  return "Modern";
}

function inferColorThemeLabel(
  prompt: string,
  industryId?: string,
  designStyle?: string,
): string {
  const hay = prompt.toLowerCase();
  if (/\bgold\b|\bamber\b|\bbronze\b|\byellow\b/.test(hay)) return "Gold";
  if (/\bblue\b|\bnavy\b|\bazure\b|\bcyan\b/.test(hay)) return "Blue";
  if (/\bpurple\b|\bviolet\b|\bindigo\b|\bmagenta\b/.test(hay)) return "Purple";
  if (/\bgreen\b|\bemerald\b|\bsage\b|\bmint\b|\bteal\b/.test(hay)) return "Green";

  if (designStyle === "Luxury" || industryId === "real-estate") return "Gold";
  if (industryId === "saas" || industryId === "technology") return "Blue";
  if (industryId === "clinic" || industryId === "education") return "Green";
  if (industryId === "agency") return "Purple";
  return "Blue";
}

export function inferProjectTypeFromPrompt(prompt: string): string {
  const text = prompt.trim();
  if (!text) return "Business Website";

  const industry = detectIndustryFromPrompt(text);
  if (industry) {
    const mapped = INDUSTRY_TO_PROJECT_TYPE[industry.industryId];
    if (mapped) return mapped;
  }

  const signal = text.toLowerCase();
  if (/\blanding\s*page\b/.test(signal)) return "Landing Page";
  if (/\bportfolio\b/.test(signal)) return "Portfolio";
  if (/\bcrm\b/.test(signal)) return "CRM";
  if (/\berp\b/.test(signal)) return "ERP";
  if (/\bmobile\s*app\b/.test(signal)) return "Mobile App";
  if (/\be-?commerce\b|\bonline\s*store\b|\bshopify\b/.test(signal)) {
    return "E-commerce";
  }
  if (/\brestaurant\b|\bمطعم\b/.test(signal)) return "Restaurant";
  if (/\bclinic\b|\bhealthcare\b|\bعيادة\b/.test(signal)) return "Clinic";
  if (/\breal\s*estate\b|\bعقار/.test(signal)) return "Real Estate";
  if (/\bschool\b|\buniversity\b|\bacademy\b/.test(signal)) return "Education";
  if (/\bsaas\b|\bsubscription\s*software\b/.test(signal)) return "AI SaaS";

  const appSignals = [
    "web app",
    "web application",
    "dashboard",
    "admin panel",
    "authentication",
    "login",
    "portal",
    "platform",
    "workflow",
    "user roles",
    "api route",
    "crud",
  ];
  if (appSignals.some((keyword) => signal.includes(keyword))) {
    return "Web Application";
  }

  return "Business Website";
}

/**
 * Infer all onboarding defaults from the user's prompt.
 */
export function inferWebsiteOnboardingDefaults(
  prompt: string,
): InferredOnboardingDefaults {
  const trimmed = prompt.trim();
  const industryMatch = detectIndustryFromPrompt(trimmed);
  const industryId = industryMatch?.industryId;
  const language = resolveWebsiteOutputLanguage(trimmed, null);
  const projectType = inferProjectTypeFromPrompt(trimmed);
  const designStyle = inferDesignStyleLabel(trimmed, industryId);
  const colorTheme = inferColorThemeLabel(trimmed, industryId, designStyle);
  const theme = `${colorTheme} ${designStyle}`.trim();
  const designPreset = dashboardDesignStyleToPreset(designStyle);
  const designSystem = dashboardColorThemeToDesignSystem(colorTheme, designStyle);

  return {
    projectType,
    language,
    theme,
    designStyle,
    colorTheme,
    designPreset,
    designSystem,
    industryId,
  };
}

/** Merge explicit API overrides with prompt inference (explicit wins). */
export function resolveWebsiteOnboardingInput(
  input: {
    prompt: string;
    projectType?: string | null;
    language?: string | null;
    theme?: string | null;
    designPreset?: string | null;
    designSystem?: WebsiteGenerationInput["designSystem"];
    industryId?: string | null;
    templateStyle?: string | null;
  },
): InferredOnboardingDefaults & {
  projectType: string;
  language: string;
  theme: string;
} {
  const inferred = inferWebsiteOnboardingDefaults(input.prompt);
  const theme =
    input.theme?.trim() ||
    (input.templateStyle
      ? `${inferred.colorTheme} ${capitalizeLabel(input.templateStyle)}`
      : inferred.theme);

  return {
    ...inferred,
    projectType: input.projectType?.trim() || inferred.projectType,
    language: resolveWebsiteOutputLanguage(input.prompt, input.language),
    theme,
    designPreset: input.designPreset || inferred.designPreset,
    designSystem: {
      ...inferred.designSystem,
      ...(input.designSystem ?? {}),
    },
    industryId: (input.industryId as IndustryId | undefined) || inferred.industryId,
  };
}
