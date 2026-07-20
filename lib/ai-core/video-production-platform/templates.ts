/**
 * Expandable AI Video Template Engine.
 * Builds a large catalog from category matrices + explicit product templates.
 */

import type {
  ContentTypeId,
  LocationId,
  PresenterPersonaId,
  VideoTemplateDefinition,
} from "@/lib/ai-core/video-production-platform/types";

const PRESENTERS: Array<{
  id: PresenterPersonaId;
  label: string;
  character: string;
  voiceStyle: string;
}> = [
  { id: "fitness-trainer", label: "Fitness Trainer", character: "Athletic coach with energetic posture", voiceStyle: "Motivational energetic" },
  { id: "doctor", label: "Doctor", character: "Credible medical professional in coat", voiceStyle: "Calm authoritative" },
  { id: "teacher", label: "Teacher", character: "Friendly educator with clear gestures", voiceStyle: "Clear instructional" },
  { id: "business-expert", label: "Business Expert", character: "Executive in smart attire", voiceStyle: "Confident professional" },
  { id: "news-presenter", label: "News Presenter", character: "Broadcast anchor with polished presence", voiceStyle: "Neutral broadcast" },
  { id: "sales-representative", label: "Sales Representative", character: "Approachable sales pro", voiceStyle: "Persuasive warm" },
  { id: "fashion-model", label: "Fashion Model", character: "Stylish on-camera talent", voiceStyle: "Soft aspirational" },
  { id: "chef", label: "Chef", character: "Culinary expert in kitchen whites", voiceStyle: "Warm inviting" },
  { id: "automotive-expert", label: "Automotive Expert", character: "Car specialist beside vehicle", voiceStyle: "Technical confident" },
  { id: "real-estate-agent", label: "Real Estate Agent", character: "Property advisor in polished look", voiceStyle: "Trustworthy upbeat" },
];

const LOCATIONS: Array<{
  id: LocationId;
  label: string;
  environment: string;
  camera: string;
}> = [
  { id: "gym", label: "Gym", environment: "Modern gym with equipment and mirrors", camera: "Dynamic tracking + medium close-ups" },
  { id: "clinic", label: "Clinic", environment: "Clean medical clinic interior", camera: "Steady tripod, soft key light" },
  { id: "office", label: "Office", environment: "Bright contemporary office", camera: "Smooth dolly + talking-head" },
  { id: "restaurant", label: "Restaurant", environment: "Styled restaurant dining room", camera: "Warm shallow depth of field" },
  { id: "store", label: "Store", environment: "Retail floor with product shelves", camera: "Handheld walkthrough + product inserts" },
  { id: "studio", label: "Studio", environment: "Controlled studio with backdrop", camera: "Multi-angle studio lighting" },
  { id: "factory", label: "Factory", environment: "Industrial production floor", camera: "Wide establishing + detail inserts" },
  { id: "showroom", label: "Showroom", environment: "Premium branded showroom", camera: "Orbit + hero product shots" },
  { id: "home", label: "Home", environment: "Lifestyle home interior", camera: "Natural light lifestyle framing" },
  { id: "street", label: "Street", environment: "Urban street environment", camera: "Handheld documentary motion" },
];

const CONTENT_TYPES: Array<{
  id: ContentTypeId;
  label: string;
  scriptStructure: string[];
  duration: number;
  visualStyle: string;
  motion: string;
}> = [
  { id: "marketing", label: "Marketing Video", scriptStructure: ["Hook", "Problem", "Solution", "Proof", "CTA"], duration: 30, visualStyle: "Cinematic commercial", motion: "Punchy cuts" },
  { id: "educational", label: "Educational Video", scriptStructure: ["Intro", "Concept", "Example", "Recap", "Next steps"], duration: 90, visualStyle: "Clean instructional", motion: "Steady explanatory" },
  { id: "motivational", label: "Motivational Video", scriptStructure: ["Open hook", "Story beat", "Lesson", "Call to rise"], duration: 45, visualStyle: "Dramatic cinematic", motion: "Slow push-ins" },
  { id: "company-presentation", label: "Company Presentation", scriptStructure: ["Company intro", "Mission", "Offerings", "Proof", "Contact"], duration: 120, visualStyle: "Corporate polish", motion: "Smooth transitions" },
  { id: "training", label: "Training Video", scriptStructure: ["Objective", "Steps", "Demo", "Common mistakes", "Checklist"], duration: 180, visualStyle: "Process-focused", motion: "Step-by-step cuts" },
  { id: "social-media", label: "Social Media Video", scriptStructure: ["Hook in 1s", "Value", "Proof", "CTA"], duration: 15, visualStyle: "Vertical native", motion: "Fast jump cuts" },
  { id: "product-ad", label: "Product Advertisement", scriptStructure: ["Attention", "Product reveal", "Benefits", "Offer", "CTA"], duration: 20, visualStyle: "Product hero", motion: "Macro + lifestyle" },
  { id: "product-launch", label: "Product Launch", scriptStructure: ["Tease", "Reveal", "Features", "Availability", "CTA"], duration: 45, visualStyle: "Launch event", motion: "Dramatic reveals" },
  { id: "product-review", label: "Product Review", scriptStructure: ["Intro", "Unbox", "Pros", "Cons", "Verdict"], duration: 60, visualStyle: "Review desk", motion: "Hands-on inserts" },
  { id: "ecommerce", label: "Ecommerce Video", scriptStructure: ["Product hero", "Use cases", "Social proof", "Buy CTA"], duration: 25, visualStyle: "Catalog commercial", motion: "Clean product orbit" },
  { id: "sales", label: "Sales Video", scriptStructure: ["Pain", "Promise", "Demo", "Objection handle", "Close"], duration: 40, visualStyle: "Persuasive sales", motion: "Direct-to-camera" },
];

/** Preferred presenter × content affinities for smarter combos */
const AFFINITY: Partial<Record<ContentTypeId, PresenterPersonaId[]>> = {
  marketing: ["sales-representative", "business-expert", "fashion-model"],
  educational: ["teacher", "doctor", "business-expert"],
  motivational: ["fitness-trainer", "business-expert", "news-presenter"],
  "company-presentation": ["business-expert", "news-presenter"],
  training: ["teacher", "fitness-trainer", "chef"],
  "social-media": ["fashion-model", "fitness-trainer", "sales-representative"],
  "product-ad": ["sales-representative", "fashion-model", "chef"],
  "product-launch": ["business-expert", "news-presenter"],
  "product-review": ["sales-representative", "automotive-expert", "fashion-model"],
  ecommerce: ["sales-representative", "fashion-model"],
  sales: ["sales-representative", "business-expert", "real-estate-agent"],
};

const LOCATION_AFFINITY: Partial<Record<PresenterPersonaId, LocationId[]>> = {
  "fitness-trainer": ["gym", "studio", "street"],
  doctor: ["clinic", "studio", "office"],
  teacher: ["studio", "office", "home"],
  "business-expert": ["office", "studio", "showroom"],
  "news-presenter": ["studio", "office"],
  "sales-representative": ["store", "showroom", "office"],
  "fashion-model": ["studio", "street", "store"],
  chef: ["restaurant", "studio", "home"],
  "automotive-expert": ["showroom", "street", "factory"],
  "real-estate-agent": ["home", "street", "office"],
};

function buildComboTemplates(): VideoTemplateDefinition[] {
  const out: VideoTemplateDefinition[] = [];
  let n = 0;
  for (const content of CONTENT_TYPES) {
    const personas =
      AFFINITY[content.id] || PRESENTERS.map((p) => p.id);
    for (const personaId of personas) {
      const presenter = PRESENTERS.find((p) => p.id === personaId)!;
      const locs =
        LOCATION_AFFINITY[personaId] || LOCATIONS.map((l) => l.id).slice(0, 3);
      for (const locId of locs) {
        const loc = LOCATIONS.find((l) => l.id === locId)!;
        n += 1;
        out.push({
          id: `tpl-${content.id}-${personaId}-${locId}`,
          label: `${content.label} · ${presenter.label} · ${loc.label}`,
          category: "combo",
          contentType: content.id,
          presenterPersona: personaId,
          location: locId,
          character: presenter.character,
          environment: loc.environment,
          cameraStyle: loc.camera,
          motionStyle: content.motion,
          voiceStyle: presenter.voiceStyle,
          scriptStructure: content.scriptStructure,
          recommendedDurationSec: content.duration,
          visualStyle: content.visualStyle,
          tags: [content.id, personaId, locId, "expandable"],
          expandable: true,
        });
      }
    }
  }
  return out;
}

const PRODUCT_EXPLICIT: VideoTemplateDefinition[] = [
  {
    id: "tpl-product-ad-hero",
    label: "Product Advertisement Hero",
    category: "product-marketing",
    contentType: "product-ad",
    presenterPersona: "sales-representative",
    location: "showroom",
    character: "On-brand product host",
    environment: "Hero product set with brand lighting",
    cameraStyle: "Macro + lifestyle cutaways",
    motionStyle: "Product orbit and whip pans",
    voiceStyle: "Persuasive commercial",
    scriptStructure: ["Hook", "Reveal", "Benefits", "Offer", "CTA"],
    recommendedDurationSec: 20,
    visualStyle: "Premium product commercial",
    tags: ["product", "ad", "ecommerce"],
    expandable: true,
  },
  {
    id: "tpl-product-launch-event",
    label: "Product Launch Event",
    category: "product-marketing",
    contentType: "product-launch",
    presenterPersona: "news-presenter",
    location: "studio",
    character: "Launch host",
    environment: "Stage-like launch studio",
    cameraStyle: "Wide stage + close-ups",
    motionStyle: "Dramatic reveal timing",
    voiceStyle: "Excited broadcast",
    scriptStructure: ["Tease", "Reveal", "Features", "Availability", "CTA"],
    recommendedDurationSec: 45,
    visualStyle: "Launch keynote",
    tags: ["launch", "product"],
    expandable: true,
  },
  {
    id: "tpl-ecommerce-catalog",
    label: "Ecommerce Catalog Spot",
    category: "product-marketing",
    contentType: "ecommerce",
    presenterPersona: "fashion-model",
    location: "store",
    character: "Catalog presenter",
    environment: "Clean retail / infinite backdrop hybrid",
    cameraStyle: "Catalog framing",
    motionStyle: "Smooth product transitions",
    voiceStyle: "Soft sales",
    scriptStructure: ["Hero", "Use cases", "Proof", "Buy CTA"],
    recommendedDurationSec: 25,
    visualStyle: "Ecommerce native",
    tags: ["ecommerce", "catalog"],
    expandable: true,
  },
  {
    id: "tpl-sales-close",
    label: "Sales Close Video",
    category: "product-marketing",
    contentType: "sales",
    presenterPersona: "sales-representative",
    location: "office",
    character: "Sales closer",
    environment: "Direct-to-camera office set",
    cameraStyle: "Eye-level talking head",
    motionStyle: "Minimal cuts",
    voiceStyle: "Consultative close",
    scriptStructure: ["Pain", "Promise", "Demo", "Objection", "Close"],
    recommendedDurationSec: 40,
    visualStyle: "Sales letter video",
    tags: ["sales"],
    expandable: true,
  },
];

let _cache: VideoTemplateDefinition[] | null = null;

export function listVideoTemplates(): VideoTemplateDefinition[] {
  if (!_cache) {
    _cache = [...PRODUCT_EXPLICIT, ...buildComboTemplates()];
  }
  return _cache;
}

export function getVideoTemplate(id: string): VideoTemplateDefinition | undefined {
  return listVideoTemplates().find((t) => t.id === id);
}

export function listTemplatesByCategory(
  category: VideoTemplateDefinition["category"],
): VideoTemplateDefinition[] {
  return listVideoTemplates().filter((t) => t.category === category);
}

export function matchVideoTemplate(params: {
  prompt?: string;
  videoType?: string;
  contentType?: ContentTypeId;
  presenter?: PresenterPersonaId;
  location?: LocationId;
}): VideoTemplateDefinition {
  const templates = listVideoTemplates();
  const hay = `${params.prompt || ""} ${params.videoType || ""}`.toLowerCase();

  if (params.contentType && params.presenter && params.location) {
    const exact = templates.find(
      (t) =>
        t.contentType === params.contentType &&
        t.presenterPersona === params.presenter &&
        t.location === params.location,
    );
    if (exact) return exact;
  }

  const typeHints: Array<{ keys: string[]; content: ContentTypeId }> = [
    { keys: ["launch"], content: "product-launch" },
    { keys: ["review"], content: "product-review" },
    { keys: ["ecommerce", "shop", "store"], content: "ecommerce" },
    { keys: ["sale", "sales", "closing"], content: "sales" },
    { keys: ["ad", "advert", "commercial"], content: "product-ad" },
    { keys: ["train", "training", "onboarding"], content: "training" },
    { keys: ["educat", "lesson", "course", "explain"], content: "educational" },
    { keys: ["motivat", "inspire"], content: "motivational" },
    { keys: ["company", "corporate", "presentation"], content: "company-presentation" },
    { keys: ["tiktok", "reel", "shorts", "social"], content: "social-media" },
  ];
  let content = params.contentType;
  if (!content) {
    for (const h of typeHints) {
      if (h.keys.some((k) => hay.includes(k))) {
        content = h.content;
        break;
      }
    }
  }
  content = content || "marketing";

  let presenter = params.presenter;
  if (!presenter) {
    for (const p of PRESENTERS) {
      if (hay.includes(p.id.replace(/-/g, " ")) || hay.includes(p.label.toLowerCase())) {
        presenter = p.id;
        break;
      }
    }
  }
  presenter = presenter || AFFINITY[content]?.[0] || "business-expert";

  let location = params.location;
  if (!location) {
    for (const l of LOCATIONS) {
      if (hay.includes(l.id) || hay.includes(l.label.toLowerCase())) {
        location = l.id;
        break;
      }
    }
  }
  location = location || LOCATION_AFFINITY[presenter]?.[0] || "studio";

  return (
    templates.find(
      (t) =>
        t.contentType === content &&
        t.presenterPersona === presenter &&
        t.location === location,
    ) ||
    templates.find((t) => t.contentType === content) ||
    templates[0]!
  );
}

export function templateCatalogStats() {
  const all = listVideoTemplates();
  return {
    total: all.length,
    productMarketing: all.filter((t) => t.category === "product-marketing").length,
    combos: all.filter((t) => t.category === "combo").length,
    presenters: PRESENTERS.length,
    locations: LOCATIONS.length,
    contentTypes: CONTENT_TYPES.length,
  };
}

export {
  PRESENTERS as VIDEO_PRESENTER_PERSONAS,
  LOCATIONS as VIDEO_LOCATIONS,
  CONTENT_TYPES as VIDEO_CONTENT_TYPES,
};
