import { getComposeUiFallbacks } from "@/lib/ai-core/content/content-language";
import { getThemeComponentRole } from "@/lib/website/builder/theme-component-registry";
import type { ThemePreviewContent } from "@/lib/website/theme-preview/types";
import { pickContent } from "@/lib/website/theme-preview/utils";

export function buildThemeComponentProps(
  componentId: string,
  content: ThemePreviewContent,
  contentSlot = 0,
): Record<string, unknown> {
  const role = getThemeComponentRole(componentId);
  const ui = getComposeUiFallbacks(content.language);

  if (role === "nav") {
    return {
      brandName: content.brandName,
      ctaLabel: content.primaryCta,
      links: content.navLinks,
    };
  }

  if (role === "hero") {
    return {
      title: content.heroHeadline,
      subtitle: content.heroSubheadline,
      eyebrow: content.heroEyebrow,
      primaryCta: content.primaryCta,
      secondaryCta: content.secondaryCta,
      imageUrl: content.heroImageUrl ?? null,
      layoutMode: content.heroLayout ?? "split",
    };
  }

  if (role === "footer") {
    return {
      brandName: content.brandName,
      tagline: content.description,
      links: content.navLinks,
    };
  }

  if (role === "floating-cta") {
    return {
      primaryCta: content.primaryCta,
      secondaryCta: content.secondaryCta,
    };
  }

  const eyebrow = pickContent(content.content, contentSlot, ui.heroEyebrow);
  const title = pickContent(
    content.content,
    contentSlot + 1,
    `${role ?? "Section"} title`,
  );
  const subtitle = pickContent(
    content.content,
    contentSlot + 2,
    content.description,
  );

  const base = { eyebrow, title, subtitle };

  if (!role) return base;

  if (role === "features" || role === "story" || role === "blog") {
    return {
      ...base,
      items: featureItems(content, contentSlot + 3, 3),
      features: featureItems(content, contentSlot + 3, 3),
    };
  }

  if (role === "services" || role === "process") {
    return {
      ...base,
      items: serviceItems(content, contentSlot + 3, 3),
    };
  }

  if (role === "testimonials" || role === "trust") {
    return {
      ...base,
      items: testimonialItems(content, contentSlot + 3, 2),
      quotes: testimonialItems(content, contentSlot + 3, 2),
    };
  }

  if (role === "pricing") {
    return {
      ...base,
      plans: pricingPlans(content, contentSlot + 3),
    };
  }

  if (role === "faq") {
    return {
      ...base,
      items: faqItems(content, contentSlot + 3, 2),
      faqs: faqItems(content, contentSlot + 3, 2),
    };
  }

  if (role === "gallery" || role === "portfolio" || role === "cases") {
    return {
      ...base,
      items: galleryItems(content, contentSlot + 3, 4),
    };
  }

  if (role === "cta") {
    return {
      ...base,
      primaryCta: content.primaryCta,
      secondaryCta: content.secondaryCta,
    };
  }

  if (role === "contact") {
    return {
      ...base,
      ctaLabel: content.primaryCta,
    };
  }

  return base;
}

function featureItems(
  content: ThemePreviewContent,
  start: number,
  count: number,
) {
  return Array.from({ length: count }, (_, index) => ({
    title: pickContent(content.content, start + index * 2, `Feature ${index + 1}`),
    body: pickContent(
      content.content,
      start + index * 2 + 1,
      content.description,
    ),
    description: pickContent(
      content.content,
      start + index * 2 + 1,
      content.description,
    ),
  }));
}

function serviceItems(
  content: ThemePreviewContent,
  start: number,
  count: number,
) {
  return Array.from({ length: count }, (_, index) => ({
    title: pickContent(content.content, start + index * 2, `Service ${index + 1}`),
    body: pickContent(
      content.content,
      start + index * 2 + 1,
      content.description,
    ),
    description: pickContent(
      content.content,
      start + index * 2 + 1,
      content.description,
    ),
  }));
}

function testimonialItems(
  content: ThemePreviewContent,
  start: number,
  count: number,
) {
  return Array.from({ length: count }, (_, index) => ({
    quote: pickContent(
      content.content,
      start + index,
      "Exceptional quality and attention to detail.",
    ),
    name: pickContent(content.content, start + index + 1, "Client name"),
    role: pickContent(content.content, start + index + 2, "Role"),
  }));
}

function pricingPlans(content: ThemePreviewContent, start: number) {
  return [
    {
      name: pickContent(content.content, start, "Starter"),
      price: pickContent(content.content, start + 1, "$29"),
      description: pickContent(content.content, start + 2, content.description),
      features: [
        pickContent(content.content, start + 3, "Core features"),
        pickContent(content.content, start + 4, "Email support"),
      ],
    },
    {
      name: pickContent(content.content, start + 5, "Pro"),
      price: pickContent(content.content, start + 6, "$79"),
      description: pickContent(content.content, start + 7, content.description),
      features: [
        pickContent(content.content, start + 8, "Everything in Starter"),
        pickContent(content.content, start + 9, "Priority support"),
      ],
      featured: true,
    },
  ];
}

function faqItems(
  content: ThemePreviewContent,
  start: number,
  count: number,
) {
  return Array.from({ length: count }, (_, index) => ({
    question: pickContent(
      content.content,
      start + index * 2,
      `Question ${index + 1}`,
    ),
    answer: pickContent(
      content.content,
      start + index * 2 + 1,
      content.description,
    ),
  }));
}

function galleryItems(
  content: ThemePreviewContent,
  start: number,
  count: number,
) {
  return Array.from({ length: count }, (_, index) => ({
    title: pickContent(content.content, start + index, `Item ${index + 1}`),
    tag: pickContent(content.content, start + index + 1, "Featured"),
  }));
}
