import type { ImageSlotKind } from "@/lib/ai-core/image-engine/slots";

export type IndustryImageProfile = {
  id: string;
  label: string;
  /** Aliases for industry detection (lowercase). */
  aliases: string[];
  subcategories?: string[];
  visualStyle: string;
  colorMood: string;
  /** Curated photography per semantic slot — engine ensures uniqueness at runtime. */
  slots: Record<ImageSlotKind, string[]>;
  /** When true, same URL may appear in multiple slots. */
  allowReuse?: boolean;
};

export type ImageProfileContext = {
  industry?: string | null;
  subcategory?: string | null;
  routingIndustryId?: string | null;
  visualStyle?: string | null;
  businessType?: string | null;
  brandStyle?: string | null;
};

export type ResolvedImageProfile = {
  profile: IndustryImageProfile;
  matchedBy: "exact" | "alias" | "subcategory" | "fallback";
  confidence: number;
};
