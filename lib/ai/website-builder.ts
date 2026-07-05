import { z } from "zod";
import { createOpenAIClient, parseOpenAIJson, withOpenAIRetry } from "@/lib/ai/openai-client";
import {
  websiteBlueprintSchema,
  websiteBuilderInputSchema,
} from "@/lib/validations/website-builder";

export type WebsiteBuilderInput = z.infer<typeof websiteBuilderInputSchema>;
export type WebsiteBlueprint = z.infer<typeof websiteBlueprintSchema>;

function defaultPages(input: WebsiteBuilderInput) {
  const base = [
    {
      name: "Home",
      purpose: `Introduce ${input.projectName} and primary value proposition`,
      keySections: ["Hero", "Services overview", "Social proof", "CTA"],
    },
    {
      name: "About",
      purpose: "Build trust with brand story and team credentials",
      keySections: ["Mission", "Team", "Timeline", "Partners"],
    },
    {
      name: "Contact",
      purpose: "Capture leads and support inquiries",
      keySections: ["Contact form", "FAQ", "Location", "Support channels"],
    },
  ];

  if (input.features.includes("blog")) {
    base.push({
      name: "Blog",
      purpose: "Drive organic traffic with educational content",
      keySections: ["Featured posts", "Categories", "Newsletter signup"],
    });
  }

  if (input.features.includes("booking")) {
    base.push({
      name: "Book a Call",
      purpose: "Convert visitors into scheduled meetings",
      keySections: ["Calendar embed", "Availability", "Booking FAQ"],
    });
  }

  return base.slice(0, input.pageCount === "1-3" ? 3 : input.pageCount === "4-6" ? 5 : 7);
}

function paletteForStyle(colorStyle: string): WebsiteBlueprint["colorPalette"] {
  if (colorStyle.includes("Gold")) {
    return [
      { name: "Luxury Black", hex: "#111111", role: "Background" },
      { name: "Premium Gold", hex: "#D4AF37", role: "Primary accent" },
      { name: "Bright Gold", hex: "#FFD700", role: "Highlights & CTAs" },
      { name: "Soft Gold", hex: "#F1C44D", role: "Hover states" },
      { name: "Muted Text", hex: "#A3A3A3", role: "Secondary text" },
    ];
  }

  if (colorStyle.includes("Light")) {
    return [
      { name: "White", hex: "#FFFFFF", role: "Background" },
      { name: "Slate", hex: "#1E293B", role: "Primary text" },
      { name: "Blue", hex: "#2563EB", role: "Primary accent" },
      { name: "Sky", hex: "#38BDF8", role: "Links & highlights" },
      { name: "Gray", hex: "#64748B", role: "Secondary text" },
    ];
  }

  return [
    { name: "Charcoal", hex: "#0F0F0F", role: "Background" },
    { name: "Surface", hex: "#1A1A1A", role: "Cards & panels" },
    { name: "Accent", hex: "#6366F1", role: "Primary accent" },
    { name: "Success", hex: "#22C55E", role: "Positive states" },
    { name: "Muted", hex: "#9CA3AF", role: "Secondary text" },
  ];
}

function generateFallbackBlueprint(input: WebsiteBuilderInput): WebsiteBlueprint {
  const pages = defaultPages(input);
  const featureLabels = input.features.join(", ");

  return {
    structure: {
      overview: `${input.projectName} is a ${input.websiteType.toLowerCase()} site targeting ${input.targetAudience}. The architecture prioritizes clarity, conversion, and ${input.designStyle.toLowerCase()} aesthetics with ${input.pageCount} pages.`,
      hierarchy: pages.map((page) => page.name),
    },
    suggestedPages: pages,
    uiComponents: [
      {
        name: "Glass Hero",
        description: "Full-width hero with headline, subcopy, and dual CTAs",
        placement: "Home — above the fold",
      },
      {
        name: "Feature Grid",
        description: "Three-column cards highlighting core services",
        placement: "Home — mid page",
      },
      {
        name: "Testimonial Carousel",
        description: "Rotating social proof with star ratings",
        placement: "Home & About",
      },
      {
        name: "Pricing Table",
        description: input.features.includes("payment")
          ? "Tiered plans with checkout-ready CTAs"
          : "Plan comparison with contact CTAs",
        placement: input.websiteType === "SaaS" ? "Dedicated pricing page" : "Home footer",
      },
      {
        name: "Contact Module",
        description: "Lead form with validation and success state",
        placement: "Contact page & footer",
      },
    ],
    colorPalette: paletteForStyle(input.colorStyle),
    typography: {
      headingFont: input.designStyle === "Luxury" ? "Playfair Display" : "Inter",
      bodyFont: "Inter",
      notes: `Pair a bold heading face with a readable sans-serif body. Match ${input.colorStyle} contrast ratios for WCAG AA.`,
      scale: ["H1 48px", "H2 36px", "H3 24px", "Body 16px", "Caption 13px"],
    },
    seo: {
      metaTitle: `${input.projectName} | ${input.websiteType} — ${input.targetAudience}`,
      metaDescription: input.businessDescription.slice(0, 155),
      keywords: [
        input.projectName,
        input.websiteType,
        input.targetAudience.split(",")[0]?.trim() || "business",
        `${input.designStyle} website`,
        ...input.features.slice(0, 3),
      ],
      tips: [
        `Publish content in ${input.language} for your primary audience`,
        "Add structured data for organization and breadcrumbs",
        "Optimize hero LCP with compressed WebP imagery",
        featureLabels ? `Highlight integrations: ${featureLabels}` : "Map internal links between key pages",
      ],
    },
  };
}

async function generateWithOpenAI(input: WebsiteBuilderInput): Promise<WebsiteBlueprint> {
  const openai = await createOpenAIClient();

  const response = await withOpenAIRetry(() =>
    openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a senior product designer and web architect. Return JSON with this exact shape:
{
  "structure": { "overview": "string", "hierarchy": ["string"] },
  "suggestedPages": [{ "name": "string", "purpose": "string", "keySections": ["string"] }],
  "uiComponents": [{ "name": "string", "description": "string", "placement": "string" }],
  "colorPalette": [{ "name": "string", "hex": "#RRGGBB", "role": "string" }],
  "typography": { "headingFont": "string", "bodyFont": "string", "notes": "string", "scale": ["string"] },
  "seo": { "metaTitle": "string", "metaDescription": "string", "keywords": ["string"], "tips": ["string"] }
}
Provide 4-8 suggested pages, 5+ UI components, 5 color swatches, and 4+ SEO tips. Match the user's design preferences exactly.`,
        },
        {
          role: "user",
          content: `Project: ${input.projectName}
Website type: ${input.websiteType}
Business: ${input.businessDescription}
Audience: ${input.targetAudience}
Language: ${input.language}
Color style: ${input.colorStyle}
Design style: ${input.designStyle}
Page count: ${input.pageCount}
Required features: ${input.features.join(", ")}`,
        },
      ],
      temperature: 0.75,
    }),
  );

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");

  const parsed = parseOpenAIJson<WebsiteBlueprint>(content);
  const validated = websiteBlueprintSchema.safeParse(parsed);

  if (!validated.success) {
    throw new Error("Invalid OpenAI response format");
  }

  return validated.data;
}

export async function generateWebsiteBlueprint(
  input: WebsiteBuilderInput,
): Promise<{ blueprint: WebsiteBlueprint; source: "openai" | "fallback" }> {
  if (process.env.OPENAI_API_KEY) {
    try {
      const blueprint = await generateWithOpenAI(input);
      return { blueprint, source: "openai" };
    } catch (error) {
      console.error("OpenAI website builder failed, using fallback:", error);
    }
  }

  return { blueprint: generateFallbackBlueprint(input), source: "fallback" };
}
