import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type {
  ServiceCapabilityNeeds,
  UniversalServiceId,
} from "@/lib/ai-core/universal-planner/types";

const SERVICE_KEYWORDS: Array<{ serviceId: UniversalServiceId; keywords: string[] }> = [
  { serviceId: "website-builder", keywords: ["website", "site", "seo"] },
  { serviceId: "app-builder", keywords: ["app", "application", "dashboard"] },
  { serviceId: "landing-page-builder", keywords: ["landing page", "lead", "campaign page"] },
  { serviceId: "logo-designer", keywords: ["logo"] },
  { serviceId: "brand-designer", keywords: ["brand", "identity", "guideline"] },
  { serviceId: "image-generator", keywords: ["image", "visual", "photo"] },
  { serviceId: "video-studio", keywords: ["video", "scene", "clip"] },
  { serviceId: "content-studio", keywords: ["content", "copywriting", "article"] },
  { serviceId: "marketing", keywords: ["marketing", "campaign"] },
  { serviceId: "social-media", keywords: ["social", "post", "instagram", "linkedin"] },
  { serviceId: "crm", keywords: ["crm", "pipeline", "lead"] },
  { serviceId: "erp", keywords: ["erp", "inventory", "operations"] },
  { serviceId: "business-manager", keywords: ["organization", "workspace", "business manager"] },
  { serviceId: "business-intelligence", keywords: ["analytics", "report", "bi", "insight"] },
];

function fullText(brief: CoreBrief): string {
  const parts = [
    brief.prompt,
    brief.theme || "",
    ...(brief.features || []),
    typeof brief.metadata?.industry === "string" ? brief.metadata.industry : "",
  ];
  return parts.join(" ").toLowerCase();
}

export function detectTargetServices(brief: CoreBrief): UniversalServiceId[] {
  const text = fullText(brief);
  const matches: UniversalServiceId[] = [];

  for (const row of SERVICE_KEYWORDS) {
    if (row.keywords.some((keyword) => text.includes(keyword))) {
      matches.push(row.serviceId);
    }
  }

  if (matches.length === 0) {
    if (brief.productId === "website") return ["website-builder"];
    if (brief.productId === "webapp") return ["app-builder"];
    return ["future-service"];
  }

  return Array.from(new Set(matches));
}

export function mapCapabilities(brief: CoreBrief): ServiceCapabilityNeeds {
  const text = fullText(brief);

  const needsDatabase =
    /database|crud|records|table|inventory|crm|erp|dashboard|analytics/.test(text);
  const needsAuth =
    /login|auth|account|admin|private|workspace|team|role/.test(text) || needsDatabase;
  const needsImages = /image|gallery|visual|hero/.test(text);
  const needsVideo = /video|clip|scene/.test(text);
  const needsBranding = /brand|identity|logo/.test(text);

  const entities = Array.from(
    new Set(
      ["product", "order", "customer", "lead", "campaign", "project"].filter((entity) =>
        text.includes(entity),
      ),
    ),
  );

  return {
    auth: {
      required: needsAuth,
      providerHint: needsAuth ? "cookie-session" : undefined,
    },
    database: {
      required: needsDatabase,
      provider: needsDatabase ? "prisma" : "none",
      entities: entities.length ? entities : undefined,
    },
    assets: {
      images: needsImages || needsBranding,
      video: needsVideo,
      branding: needsBranding,
    },
    integrations: [],
  };
}
