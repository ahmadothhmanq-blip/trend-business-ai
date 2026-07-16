import type { LogoPluginInput, LogoAnalysis, LogoConcept } from "@/plugins/logo-designer/types";

function getStyleGuidance(style: string): string {
  const guides: Record<string, string> = {
    wordmark: "Focus purely on typography. The brand name IS the logo. Choose or describe a typeface that conveys the brand personality. Consider letter spacing, weight, and custom ligatures. No icon needed.",
    lettermark: "Use the brand initials or a single letter. Create a distinctive monogram. Focus on elegance, readability at small sizes, and memorability. Consider interlocking or overlapping letters.",
    brandmark: "Create an icon or symbol only — no text. The symbol should be instantly recognizable, work at any size (from favicon to billboard), and convey the brand essence through shape and form alone.",
    combination: "Design an icon paired with the brand name. The icon and text should work together as a unit but also function independently. Define the spatial relationship (icon left/above/integrated).",
    emblem: "Integrate text within a shape — a badge, shield, seal, or crest. Think heritage, authority, and craftsmanship. The text is contained within the emblem boundary.",
    abstract: "Use geometric or abstract shapes. No literal representation. The forms should evoke feelings and values rather than depict objects. Focus on balance, proportion, and visual harmony.",
    mascot: "Design a character or figure. The mascot should have personality, be friendly and approachable, and work across different expressions and contexts. Describe its features in detail.",
    minimalist: "Extreme simplicity. Every element must earn its place. Use negative space, single-weight lines, and no decorative elements. The logo should feel effortless and timeless.",
    vintage: "Classic, heritage-inspired design. Use ornamental details, serif typography, ribbons, borders, and textures that evoke craftsmanship and tradition. Think hand-lettered quality.",
    "three-dimensional": "Add depth through gradients, shadows, and perspective. Modern and digital-native. Use color transitions and lighting effects to create dimensionality.",
    dynamic: "Design a responsive logo system — a primary mark plus simplified versions for different contexts (app icon, social avatar, watermark). Define how each version relates.",
    custom: "Follow the user's specific style direction as described in their prompt.",
  };
  return guides[style] || guides.custom;
}

export function logoAnalyzePrompt(input: LogoPluginInput): string {
  return `You are a professional brand strategist and logo designer. Analyze the following logo design brief and produce a structured analysis.

Brand Name: ${input.brandName}
User Description: ${input.prompt}
Logo Style: ${input.logoStyle}
Industry: ${input.industry || "Not specified"}
Color Direction: ${input.colorPalette}
Icon Style: ${input.iconStyle}
Typography Direction: ${input.typography}
Brand Personality: ${input.personality}
Requested Deliverables: ${input.options.join(", ") || "Standard set"}

Produce a JSON object with:
- brandName: the brand name to display
- industry: the industry category
- style: the logo style approach
- mood: the overall mood/feeling the logo should convey
- personality: brand personality traits (comma-separated)
- colorDirection: recommended color approach
- typographyDirection: recommended typography approach
- conceptSuggestions: array of 3 concept directions (strings)
- targetAudience: who this brand serves
- brandValues: array of 3-5 brand values

Return ONLY valid JSON.`;
}

export function logoPlanPrompt(input: LogoPluginInput, analysis: LogoAnalysis): string {
  return `You are an expert logo designer. Based on this analysis, create a detailed plan for the logo design.

Brand: ${analysis.brandName}
Industry: ${analysis.industry}
Style: ${analysis.style}
Mood: ${analysis.mood}
Personality: ${analysis.personality}
Color Direction: ${analysis.colorDirection}
Typography: ${analysis.typographyDirection}
Target Audience: ${analysis.targetAudience}
Brand Values: ${analysis.brandValues.join(", ")}
Concept Suggestions: ${analysis.conceptSuggestions.join(", ")}

Style Guidance: ${getStyleGuidance(input.logoStyle)}

Produce a JSON object with:
- concepts: array of 2-3 logo concepts, each with:
  - name: concept name
  - description: detailed description of the visual approach
  - approach: the design methodology
  - iconDescription: what the icon/symbol looks like (or "N/A" for wordmarks)
  - layoutDescription: how elements are arranged
  - colorUsage: how colors are applied
- colorPalette: array of 3-5 colors, each with name, hex, role
- typography: object with primary (font name), secondary (font name), weight (e.g. "Bold 700")
- deliverables: array of deliverable names
- svgApproach: brief description of how the SVG should be constructed

Return ONLY valid JSON.`;
}

export function logoGeneratePrompt(
  input: LogoPluginInput,
  analysis: LogoAnalysis,
  concept: LogoConcept,
  colorPalette: { name: string; hex: string; role: string }[],
): string {
  const colors = colorPalette.map((c) => `${c.name}: ${c.hex} (${c.role})`).join("\n");

  return `You are a world-class SVG logo designer. Generate a production-ready SVG logo based on this concept.

Brand Name: ${analysis.brandName}
Concept: ${concept.name} — ${concept.description}
Approach: ${concept.approach}
Icon: ${concept.iconDescription}
Layout: ${concept.layoutDescription}
Color Usage: ${concept.colorUsage}
Style: ${analysis.style}
Mood: ${analysis.mood}

Color Palette:
${colors}

Style Guidance: ${getStyleGuidance(input.logoStyle)}

CRITICAL SVG RULES:
- The SVG MUST be valid, well-formed XML.
- Use viewBox="0 0 400 400" for square logos or "0 0 600 200" for horizontal layouts.
- Use the exact hex colors from the color palette.
- For text elements, use a generic font-family like "Arial, Helvetica, sans-serif" or "Georgia, serif".
- Keep the SVG clean — no unnecessary groups or transforms.
- The logo must look professional at both 32px and 1024px.
- Do NOT use external images, links, or scripts.
- Do NOT use <image>, <foreignObject>, or <use> with external references.
- Shapes should be precise with clean paths.
- The design must be centered within the viewBox.

Return a JSON object with:
- name: the concept name
- description: what the logo represents
- svgCode: the complete SVG markup as a string (starting with <svg and ending with </svg>)

Return ONLY valid JSON.`;
}

export function logoVariationPrompt(
  brandName: string,
  primarySvg: string,
  variationName: string,
  colorPalette: { name: string; hex: string; role: string }[],
): string {
  return `You are an expert SVG logo designer. Create a "${variationName}" variation of this logo.

Brand Name: ${brandName}
Primary Logo SVG:
${primarySvg}

Color Palette: ${colorPalette.map((c) => `${c.name}: ${c.hex}`).join(", ")}

Variation: ${variationName}
${variationName === "Dark Version" ? "Invert colors for dark backgrounds. Use light text/shapes on transparent background." : ""}
${variationName === "Light Version" ? "Ensure all elements work on white/light backgrounds." : ""}
${variationName === "Icon Only" ? "Extract only the icon/symbol, remove all text. If wordmark, create an initial letter mark." : ""}
${variationName === "Horizontal Layout" ? 'Rearrange to a horizontal layout. Use viewBox="0 0 600 200".' : ""}
${variationName === "Monochrome" ? "Convert to single color (black or the primary brand color). No gradients." : ""}
${variationName === "Favicon" ? 'Simplify to work at 32x32px. Use viewBox="0 0 64 64". Icon only, maximum simplicity.' : ""}
${variationName === "Social Avatar" ? 'Square format, centered, with padding. Use viewBox="0 0 400 400".' : ""}
${variationName === "Watermark" ? "Semi-transparent version at 20% opacity. Simple and non-intrusive." : ""}

SVG RULES:
- Valid, well-formed SVG XML.
- Use generic font families.
- No external references.
- Clean, minimal markup.

Return a JSON object with:
- name: "${variationName}"
- description: brief description of changes made
- useCase: when to use this variation
- svgCode: the complete SVG markup

Return ONLY valid JSON.`;
}

export function logoGuidelinesPrompt(
  brandName: string,
  analysis: LogoAnalysis,
  colorPalette: { name: string; hex: string; role: string }[],
  typography: { primary: string; secondary: string; notes: string },
  variations: { name: string; description: string }[],
): string {
  return `Write concise brand guidelines for the "${brandName}" logo. Cover:

1. Logo Usage — clear space rules, minimum size, do's and don'ts.
2. Color Palette — list each color (${colorPalette.map((c) => `${c.name}: ${c.hex}`).join(", ")}), usage rules.
3. Typography — primary: ${typography.primary}, secondary: ${typography.secondary}. ${typography.notes}
4. Variations — when to use each: ${variations.map((v) => v.name).join(", ")}.
5. Brand Voice — ${analysis.personality}, targeting ${analysis.targetAudience}.

Keep it professional and concise (300-500 words). Use markdown formatting.
Return ONLY the guidelines text as a plain string (not JSON).`;
}
