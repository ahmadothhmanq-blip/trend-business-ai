/**
 * Content Studio platform templates — system catalog + variable substitution.
 */

import type { ContentTemplate, ContentTemplateVariable } from "@/types/content";

export const SYSTEM_CONTENT_TEMPLATES: Omit<
  ContentTemplate,
  "user_id" | "created_at" | "updated_at"
>[] = [
  {
    id: "blog-how-to",
    name: "How-To Blog Post",
    category: "Blog",
    description: "Step-by-step educational blog post",
    prompt_structure:
      "Write a how-to blog post about {{topic}} for {{audience}}. Tone: {{tone}}. Include introduction, numbered steps, tips, and conclusion.",
    variables: [
      { key: "topic", label: "Topic", placeholder: "e.g. email marketing" },
      { key: "audience", label: "Audience", placeholder: "e.g. small business owners" },
      { key: "tone", label: "Tone", default: "Professional" },
    ],
    preview: "A practical guide that walks readers through a process with clear steps and actionable advice.",
    content_tool: "blog-writer",
    content_type: "blog-post",
    is_system: true,
  },
  {
    id: "social-linkedin",
    name: "LinkedIn Thought Leadership",
    category: "Social Media",
    description: "Professional LinkedIn post with hook and CTA",
    prompt_structure:
      "Write a LinkedIn post about {{topic}}. Hook: {{hook}}. Tone: {{tone}}. Include a clear takeaway and call-to-action.",
    variables: [
      { key: "topic", label: "Topic" },
      { key: "hook", label: "Opening Hook" },
      { key: "tone", label: "Tone", default: "Professional" },
    ],
    preview: "Engaging professional post designed for LinkedIn engagement.",
    content_tool: "social-writer",
    content_type: "linkedin-post",
    is_system: true,
  },
  {
    id: "ad-google",
    name: "Google Search Ad",
    category: "Ads",
    description: "High-converting Google ad copy",
    prompt_structure:
      "Write Google Search ad copy for {{product}}. Target keyword: {{keyword}}. Tone: {{tone}}. Include 3 headlines and 2 descriptions.",
    variables: [
      { key: "product", label: "Product/Service" },
      { key: "keyword", label: "Target Keyword" },
      { key: "tone", label: "Tone", default: "Marketing" },
    ],
    preview: "Concise ad copy optimized for search intent and click-through.",
    content_tool: "ad-copy",
    content_type: "google-ad",
    is_system: true,
  },
  {
    id: "email-welcome",
    name: "Welcome Email",
    category: "Email",
    description: "Onboarding welcome email sequence opener",
    prompt_structure:
      "Write a welcome email for {{brand}} targeting {{audience}}. Tone: {{tone}}. Include warm greeting, value proposition, and next steps.",
    variables: [
      { key: "brand", label: "Brand Name" },
      { key: "audience", label: "Audience" },
      { key: "tone", label: "Tone", default: "Friendly" },
    ],
    preview: "Warm onboarding email that sets expectations and drives engagement.",
    content_tool: "email-writer",
    content_type: "email-campaign",
    is_system: true,
  },
  {
    id: "product-ecommerce",
    name: "E-commerce Product Description",
    category: "Product Description",
    description: "Benefit-focused product copy",
    prompt_structure:
      "Write a product description for {{product}}. Key benefits: {{benefits}}. Tone: {{tone}}. Focus on benefits over features.",
    variables: [
      { key: "product", label: "Product Name" },
      { key: "benefits", label: "Key Benefits" },
      { key: "tone", label: "Tone", default: "Marketing" },
    ],
    preview: "Compelling product copy that highlights benefits and drives purchases.",
    content_tool: "product-description",
    content_type: "product-description",
    is_system: true,
  },
  {
    id: "landing-hero",
    name: "Landing Page Hero",
    category: "Landing Pages",
    description: "Conversion-focused hero section",
    prompt_structure:
      "Write landing page hero copy for {{product}}. Target audience: {{audience}}. Tone: {{tone}}. Include headline, subheadline, and CTA.",
    variables: [
      { key: "product", label: "Product/Service" },
      { key: "audience", label: "Audience" },
      { key: "tone", label: "Tone", default: "Marketing" },
    ],
    preview: "Hero section with headline, value prop, and strong call-to-action.",
    content_tool: "landing-copy",
    content_type: "landing-page",
    is_system: true,
  },
  {
    id: "seo-pillar",
    name: "SEO Pillar Article",
    category: "SEO Articles",
    description: "Long-form SEO-optimized article",
    prompt_structure:
      "Write an SEO pillar article about {{topic}}. Primary keyword: {{keyword}}. Tone: {{tone}}. Include H2 sections, FAQ, and meta suggestions.",
    variables: [
      { key: "topic", label: "Topic" },
      { key: "keyword", label: "Primary Keyword" },
      { key: "tone", label: "Tone", default: "Professional" },
    ],
    preview: "Comprehensive SEO article structured for search visibility.",
    content_tool: "article-writer",
    content_type: "seo-article",
    is_system: true,
  },
  {
    id: "business-proposal",
    name: "Business Proposal",
    category: "Business Documents",
    description: "Professional business proposal outline",
    prompt_structure:
      "Write a business proposal for {{client}} about {{project}}. Tone: {{tone}}. Include executive summary, scope, timeline, and next steps.",
    variables: [
      { key: "client", label: "Client Name" },
      { key: "project", label: "Project" },
      { key: "tone", label: "Tone", default: "Professional" },
    ],
    preview: "Structured business proposal with executive summary and clear scope.",
    content_tool: "content-writer",
    content_type: "business-report",
    is_system: true,
  },
];

export function getSystemTemplate(id: string) {
  return SYSTEM_CONTENT_TEMPLATES.find((t) => t.id === id);
}

export function applyTemplateVariables(
  structure: string,
  values: Record<string, string>,
  variables: ContentTemplateVariable[] = [],
): string {
  let result = structure;
  for (const v of variables) {
    const val = values[v.key]?.trim() || v.default || "";
    result = result.replaceAll(`{{${v.key}}}`, val);
  }
  result = result.replace(/\{\{[^}]+\}\}/g, "");
  return result.trim();
}

export function listTemplatesByCategory(category?: string) {
  if (!category) return SYSTEM_CONTENT_TEMPLATES;
  return SYSTEM_CONTENT_TEMPLATES.filter((t) => t.category === category);
}
