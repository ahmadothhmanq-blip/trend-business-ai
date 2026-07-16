import type { ContentPluginInput } from "@/plugins/content-studio/types";

function getContentTypeContext(type: string): string {
  const ctx: Record<string, string> = {
    "blog-post": "Long-form blog post (800-2000 words). Include introduction, body with subheadings, and conclusion. Optimize for readability and SEO.",
    article: "Professional article (1000-3000 words). Well-researched, structured with clear sections, supporting evidence, and expert insights.",
    "seo-article": "SEO-optimized article. Target primary and secondary keywords naturally. Include meta tags, heading hierarchy, internal linking opportunities, and FAQ schema.",
    "facebook-post": "Facebook post (50-300 words). Engaging, conversational. Include a hook, value, and CTA. Suggest emoji placement.",
    "instagram-post": "Instagram caption (50-200 words). Visual-first, storytelling, hashtag strategy (20-30 relevant tags). Include line breaks for readability.",
    "linkedin-post": "LinkedIn post (100-500 words). Professional thought leadership. Hook in first line. Use line breaks. End with engagement question.",
    "x-post": "X post (max 280 characters). Punchy, attention-grabbing. Optional thread format with numbered posts.",
    thread: "Thread (5-15 posts). Each post ≤280 chars. Numbered 1/N format. Strong hook in post 1. Value in middle. CTA at end.",
    "tiktok-caption": "TikTok caption (50-150 words). Trendy, casual, hook-driven. Include relevant hashtags and emoji.",
    "youtube-script": "YouTube video script. Include: hook (first 10 seconds), intro, main content with timestamps, transitions, B-roll suggestions, CTA, and outro.",
    "youtube-description": "YouTube description (200-500 words). SEO-optimized with timestamps, links, hashtags, and keywords.",
    "email-campaign": "Email campaign. Include: subject line (5 options), preview text, email body with personalization tokens, CTA buttons, and P.S. line.",
    newsletter: "Newsletter with sections: header, featured article, quick reads, tips, resources, CTA, and footer. Engaging and scannable.",
    "product-description": "Product description. Lead with benefits, include features, address objections, social proof hooks, and strong CTA. SEO-optimized.",
    "sales-page": "Sales page copy. Follow: headline → problem → agitation → solution → benefits → social proof → offer → guarantee → CTA → urgency.",
    "landing-page": "Landing page copy. Hero with headline + subheadline, features/benefits, social proof, FAQ, and CTA sections.",
    "google-ad": "Google Ad copy. Multiple headlines (30 chars each), descriptions (90 chars each), sitelink suggestions, and callout extensions.",
    "meta-ad": "Meta/Facebook Ad copy. Primary text, headline, description, CTA button text. Multiple variants for A/B testing.",
    headline: "Generate 10-15 headline variations. Mix of styles: question, how-to, number, power word, curiosity gap, and benefit-driven.",
    cta: "Generate 15-20 CTA variations. Mix button text, banner CTAs, and contextual CTAs. Focus on action verbs and urgency.",
    "business-report": "Professional business report. Executive summary, key findings, data analysis, recommendations, and action items.",
    "marketing-plan": "Marketing plan. Objectives, target audience, channels, content strategy, budget allocation, timeline, KPIs, and measurement plan.",
    "content-plan": "Content calendar plan. Weekly/monthly content schedule, themes, content types per channel, publishing frequency, and seasonal hooks.",
  };
  return ctx[type] ?? "Create high-quality content following the user's specifications.";
}

export function contentAnalyzePrompt(input: ContentPluginInput): string {
  return `You are a world-class content strategist. Analyze this content brief.

Content Tool: ${input.contentTool}
Content Type: ${input.contentType}
Prompt: ${input.prompt}
Tone: ${input.tone}
Audience: ${input.audience}
Language: ${input.language}
Writing Style: ${input.writingStyle}
Creativity: ${input.creativityLevel}
Brand Voice: ${input.brandVoice || "Not specified"}
SEO Keywords: ${input.seoKeywords || "Not specified"}
Options: ${input.options.join(", ") || "Standard"}

Context: ${getContentTypeContext(input.contentType)}

Produce a JSON object with:
- title: compelling title for this content
- contentType: the content category
- targetAudience: detailed audience description
- mainMessage: core message (1-2 sentences)
- keyPoints: array of 3-5 key points to cover
- suggestedStructure: content structure outline
- toneAnalysis: how the tone should manifest
- competitiveAngle: unique angle or differentiator

Return ONLY valid JSON.`;
}

export function contentPlanPrompt(input: ContentPluginInput, analysis: { title: string; keyPoints: string[]; suggestedStructure: string; toneAnalysis: string }): string {
  return `You are an expert content planner. Create a detailed content plan.

Title: ${analysis.title}
Content Type: ${input.contentType}
Key Points: ${analysis.keyPoints.join("; ")}
Structure: ${analysis.suggestedStructure}
Tone: ${input.tone} — ${analysis.toneAnalysis}
Audience: ${input.audience}
Writing Style: ${input.writingStyle}
SEO Keywords: ${input.seoKeywords || "None specified"}
Options: ${input.options.join(", ")}

Create a JSON object with:
- sections: array of content sections, each with:
  - heading: section heading
  - purpose: what this section achieves
  - wordCount: approximate word count
  - keyPoints: array of points to cover
- totalWordCount: estimated total word count
- seoStrategy: SEO approach description (if SEO enabled)
- primaryKeyword: main keyword (if keywords provided)
- secondaryKeywords: array of secondary keywords
- headlineVariants: array of 3-5 alternative headlines

Return ONLY valid JSON.`;
}

export function contentGeneratePrompt(
  input: ContentPluginInput,
  analysis: { title: string; mainMessage: string; keyPoints: string[]; toneAnalysis: string; competitiveAngle: string },
  plan: { sections: { heading: string; purpose: string; keyPoints: string[] }[]; seoStrategy: string; primaryKeyword: string },
): string {
  const sectionGuide = plan.sections
    .map((s, i) => `${i + 1}. ${s.heading} — ${s.purpose} (cover: ${s.keyPoints.join(", ")})`)
    .join("\n");

  return `You are a ${input.writingStyle} writer with expertise in ${input.contentType} content. Write the complete content piece.

Title: ${analysis.title}
Type: ${input.contentType}
Tone: ${input.tone}
Audience: ${input.audience}
Language: ${input.language}
Main Message: ${analysis.mainMessage}
Unique Angle: ${analysis.competitiveAngle}
${input.brandVoice ? `Brand Voice: ${input.brandVoice}` : ""}
${plan.primaryKeyword ? `Primary Keyword: ${plan.primaryKeyword}` : ""}
${plan.seoStrategy ? `SEO Strategy: ${plan.seoStrategy}` : ""}

Content Structure:
${sectionGuide}

Context: ${getContentTypeContext(input.contentType)}

IMPORTANT RULES:
- Write in ${input.language}
- Use ${input.tone} tone consistently
- Follow ${input.writingStyle} writing style
- ${input.options.includes("seo") ? "Optimize for SEO naturally — don't keyword-stuff" : "Focus on quality over SEO"}
- ${input.options.includes("emoji") ? "Use emoji naturally where appropriate" : "Minimal or no emoji"}
- ${input.options.includes("hashtags") ? "Include relevant hashtags" : ""}
- ${input.options.includes("cta") ? "Include compelling call-to-action" : ""}
- ${input.options.includes("readability") ? "Optimize for readability — short paragraphs, simple language" : ""}

Write the complete content. Use markdown formatting. Return ONLY the content text — no JSON wrapper.`;
}

export function contentSeoPrompt(content: string, keywords: string, contentType: string): string {
  return `You are an SEO expert. Analyze this ${contentType} content for SEO performance.

Content:
${content.slice(0, 6000)}

Target Keywords: ${keywords || "Not specified — identify the most relevant keywords"}

Produce a JSON object with:
- score: SEO score 0-100
- keywordDensity: object mapping each keyword to its density percentage (e.g. { "keyword": 1.5 })
- metaTitle: optimized meta title (≤60 chars)
- metaDescription: optimized meta description (≤160 chars)
- headingStructure: array of suggested headings (H1, H2, H3)
- internalLinkingSuggestions: array of 3-5 internal linking opportunities
- faqItems: array of 3-5 FAQ items (question + answer)
- schemaSuggestions: array of recommended schema types
- readabilityScore: readability score 0-100
- wordCount: approximate word count

Return ONLY valid JSON.`;
}

export function contentHeadlinesPrompt(title: string, contentType: string, tone: string, audience: string): string {
  return `Generate 10 headline variations for this ${contentType}.

Current title: ${title}
Tone: ${tone}
Audience: ${audience}

Create a JSON object with:
- headlines: array of 10 headline strings

Mix styles: question, how-to, number-list, power-word, curiosity-gap, benefit-driven.

Return ONLY valid JSON.`;
}

export function contentImprovementsPrompt(content: string, contentType: string): string {
  return `You are a senior editor. Review this ${contentType} content and suggest improvements.

Content (excerpt):
${content.slice(0, 4000)}

Create a JSON object with:
- suggestions: array of 3-5 improvement suggestions (actionable, specific)
- improvements: array of 3-5 specific edits to improve quality

Return ONLY valid JSON.`;
}
