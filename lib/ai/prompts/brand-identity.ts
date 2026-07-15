import type { BrandIdentityPluginInput, BrandAnalysis, BrandPlanResult } from "@/plugins/brand-identity/types";
import { sanitizePromptInput } from "@/lib/ai/sanitize";

function getBrandTypeContext(type: string): string {
  const ctx: Record<string, string> = {
    startup: "New venture needing to establish market presence. Focus on differentiation, modern appeal, scalability of brand elements, and investor-readiness.",
    corporate: "Enterprise brand requiring authority, trust, and professionalism. Focus on consistency across departments, formal tone, institutional quality.",
    ecommerce: "Online retail brand needing strong visual appeal, trust signals, and conversion-focused identity. Focus on product photography direction, packaging, unboxing experience.",
    personal: "Individual professional brand. Focus on authenticity, personal story, thought leadership positioning, and social media presence.",
    nonprofit: "Mission-driven organization. Focus on emotional connection, trust, transparency, community engagement, and cause alignment.",
    saas: "Software product brand. Focus on modern tech aesthetic, feature communication, onboarding experience, and developer/user trust.",
    agency: "Creative or consulting agency. Focus on demonstrating expertise, showcasing process, portfolio presentation, and client-facing materials.",
    luxury: "Premium positioning. Focus on exclusivity, craftsmanship, minimal elegance, high-end materials, and aspirational identity.",
    education: "Educational institution or platform. Focus on trust, approachability, knowledge authority, and diverse audience appeal.",
    healthcare: "Medical or wellness brand. Focus on trust, cleanliness, empathy, regulatory compliance, and patient/user comfort.",
    restaurant: "Food and beverage brand. Focus on appetite appeal, ambiance, menu design, and experiential branding.",
    rebrand: "Refreshing existing identity. Focus on preserving brand equity while modernizing, migration strategy, and stakeholder communication.",
    custom: "Custom brand type — follow the user's specific description.",
  };
  return ctx[type] || ctx.custom;
}

export function brandAnalyzePrompt(input: BrandIdentityPluginInput): string {
  return `You are a senior brand strategist at a top-tier branding agency. Analyze this brand identity brief.

Brand Name: ${input.brandName}
Brand Type: ${input.brandType}
Industry: ${input.industry || "Not specified"}
Target Audience: ${input.targetAudience || "Not specified"}
Brand Personality: ${input.brandPersonality}
User Description: ${input.prompt}
Requested Deliverables: ${input.deliverables.join(", ") || "Standard set"}

Context: ${getBrandTypeContext(input.brandType)}

Produce a JSON object with:
- brandName: string
- industry: string
- positioning: brand positioning statement (1-2 sentences)
- targetAudience: detailed audience description
- competitors: array of 3-5 likely competitor brand names
- differentiators: array of 3-5 unique differentiators for this brand
- personality: personality traits description
- coreValues: array of 4-6 core brand values
- emotionalAppeal: the emotional response the brand should evoke

Return ONLY valid JSON.`;
}

export function brandPlanPrompt(input: BrandIdentityPluginInput, analysis: BrandAnalysis): string {
  return `You are an expert brand identity designer. Create a comprehensive brand plan.

Brand: ${analysis.brandName}
Industry: ${analysis.industry}
Positioning: ${analysis.positioning}
Target Audience: ${analysis.targetAudience}
Personality: ${analysis.personality}
Core Values: ${analysis.coreValues.join(", ")}
Differentiators: ${analysis.differentiators.join(", ")}
Emotional Appeal: ${analysis.emotionalAppeal}
Brand Type Context: ${getBrandTypeContext(input.brandType)}

Create a JSON object with:
- mission: brand mission statement (1-2 sentences)
- vision: brand vision statement (1-2 sentences)
- values: array of 4-6 core values (strings)
- voiceTone: object with:
  - tone: overall tone description
  - doExamples: array of 3 writing style DO examples
  - dontExamples: array of 3 writing style DON'T examples
  - tagline: brand tagline
  - elevatorPitch: 2-3 sentence elevator pitch
- colorPalette: array of 5-7 colors, each with:
  - name: color name
  - hex: hex color code
  - role: role in the brand (e.g. "Primary", "Secondary", "Accent", "Background", "Text", "Success", "Warning")
  - usage: when and how to use this color
- typography: object with:
  - primary: primary font family name
  - secondary: secondary font family name
  - weight: recommended weight (e.g. "Bold 700")
  - headingStyle: heading style description (size, weight, spacing)
  - bodyStyle: body text style description
  - notes: additional typography notes
- deliverables: array of deliverable IDs to generate
- brandArchetype: the brand archetype (e.g. "The Creator", "The Explorer", "The Hero")

Return ONLY valid JSON.`;
}

export function brandStrategyPrompt(analysis: BrandAnalysis, plan: BrandPlanResult): string {
  return `Write a professional brand strategy document for "${analysis.brandName}".

Brand: ${analysis.brandName}
Mission: ${plan.mission}
Vision: ${plan.vision}
Values: ${plan.values.join(", ")}
Positioning: ${analysis.positioning}
Archetype: ${plan.brandArchetype}
Target Audience: ${analysis.targetAudience}
Competitors: ${analysis.competitors.join(", ")}
Differentiators: ${analysis.differentiators.join(", ")}

Cover:
1. Brand Overview — who we are, what we stand for
2. Target Audience — demographics, psychographics, pain points
3. Competitive Landscape — positioning against competitors
4. Brand Pillars — key themes that support the brand
5. Value Proposition — what makes us unique
6. Go-to-Market Messaging — key messages for different channels

Write 400-600 words in professional markdown. No JSON wrapper — return plain text.`;
}

export function brandStoryPrompt(analysis: BrandAnalysis, plan: BrandPlanResult): string {
  return `Write a compelling brand story for "${analysis.brandName}".

Brand: ${analysis.brandName}
Mission: ${plan.mission}
Vision: ${plan.vision}
Values: ${plan.values.join(", ")}
Archetype: ${plan.brandArchetype}
Emotional Appeal: ${analysis.emotionalAppeal}
Target Audience: ${analysis.targetAudience}

Write the brand story that:
- Opens with the problem or opportunity that inspired the brand
- Introduces the brand as the solution
- Connects emotionally with the audience
- Ends with the aspirational future

Write 200-400 words. Compelling, authentic, and memorable. Return plain text — no JSON wrapper.`;
}

export function logoGuidelinesPrompt(analysis: BrandAnalysis, plan: BrandPlanResult): string {
  const colors = plan.colorPalette.map((c) => `${c.name}: ${c.hex} (${c.role})`).join(", ");
  return `Write professional logo usage guidelines for the "${analysis.brandName}" brand.

Brand: ${analysis.brandName}
Color Palette: ${colors}
Typography: ${plan.typography.primary} (primary), ${plan.typography.secondary} (secondary)
Brand Personality: ${analysis.personality}

Cover:
1. Logo Clear Space — minimum clear space rules
2. Minimum Size — smallest acceptable size
3. Color Variations — full color, monochrome, reversed
4. Backgrounds — approved backgrounds, prohibited backgrounds
5. Don'ts — distortion, recoloring, rotation, effects to avoid
6. File Formats — when to use SVG, PNG, PDF

Write 200-350 words in markdown. Return plain text — no JSON wrapper.`;
}

export function brandAssetPrompt(
  assetType: string,
  analysis: BrandAnalysis,
  plan: BrandPlanResult,
): string {
  const colors = plan.colorPalette.map((c) => `${c.name}: ${c.hex}`).join(", ");
  const base = `Brand: ${analysis.brandName}\nColors: ${colors}\nFonts: ${plan.typography.primary} / ${plan.typography.secondary}\nTone: ${plan.voiceTone.tone}\nTagline: ${plan.voiceTone.tagline}`;

  const prompts: Record<string, string> = {
    "business-card": `Design a professional business card layout for "${analysis.brandName}".
${base}

Return a JSON object with:
- name: "Business Card"
- category: "Stationery"
- description: layout description
- content: complete SVG markup of a business card (3.5"x2" ratio, viewBox="0 0 350 200"). Include brand name, tagline, placeholder name/title/email/phone, and brand colors. Use generic fonts.
- format: "svg"

Return ONLY valid JSON.`,

    letterhead: `Design a professional letterhead for "${analysis.brandName}".
${base}

Return a JSON object with:
- name: "Letterhead"
- category: "Stationery"
- description: layout description
- content: complete SVG markup of a letterhead (A4 ratio, viewBox="0 0 595 842"). Include brand header with name/logo area, tagline, footer with contact info, and brand colors. Use generic fonts.
- format: "svg"

Return ONLY valid JSON.`,

    "email-signature": `Create a professional HTML email signature for "${analysis.brandName}".
${base}

Return a JSON object with:
- name: "Email Signature"
- category: "Digital"
- description: signature layout description
- content: complete HTML for an email signature (table-based layout for email client compatibility). Include brand name, placeholder for name/title, email, phone, website, and brand colors. Keep it compact (max 600px wide, ~150px tall). Inline styles only.
- format: "html"

Return ONLY valid JSON.`,

    "social-kit": `Design a social media brand kit guide for "${analysis.brandName}".
${base}

Return a JSON object with:
- name: "Social Media Kit"
- category: "Digital"
- description: guide overview
- content: markdown document covering: profile picture guidelines, cover photo guidelines (sizes for Instagram, LinkedIn, Twitter/X, Facebook), post templates (quote posts, announcement posts, product posts), hashtag strategy (5-10 branded hashtags), posting tone guidelines, and recommended content pillars. 300-500 words.
- format: "markdown"

Return ONLY valid JSON.`,
  };

  return prompts[assetType] || `Create a "${assetType}" brand asset for "${analysis.brandName}".\n${base}\n\nReturn JSON with: name, category, description, content (the asset content as text/markup), format ("markdown" or "svg" or "html").\nReturn ONLY valid JSON.`;
}
