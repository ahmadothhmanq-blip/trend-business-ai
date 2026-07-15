/**
 * Public template catalog for SEO / sitemap / internal linking.
 * Hub is /templates; individual entries only when real assets exist.
 */

export type TemplateMeta = {
  id: string;
  title: string;
  description: string;
  path: string;
  category: "website" | "landing" | "brand" | "content" | "business";
  image?: string;
  relatedProductSlugs?: string[];
  status: "draft" | "published";
};

const TEMPLATES: TemplateMeta[] = [
  {
    id: "saas-landing",
    title: "SaaS Landing Page Template",
    description: "Conversion-focused SaaS landing structure with hero, proof, pricing and CTA sections.",
    path: "/templates",
    category: "landing",
    image: "/images/ai/template-landing.png",
    relatedProductSlugs: ["landing-page-builder"],
    status: "published",
  },
  {
    id: "brand-kit",
    title: "Brand Identity Starter Kit",
    description: "Logo, palette and identity direction patterns for new brands.",
    path: "/templates",
    category: "brand",
    image: "/images/ai/brand-studio.png",
    relatedProductSlugs: ["brand-studio", "logo-maker"],
    status: "published",
  },
];

/** Individual indexable template URLs — only when path differs from the hub. */
export function getTemplateCatalog() {
  return TEMPLATES.filter(
    (template) => template.status === "published" && template.path !== "/templates",
  );
}

export function getTemplateHubItems() {
  return TEMPLATES.filter((template) => template.status === "published");
}
