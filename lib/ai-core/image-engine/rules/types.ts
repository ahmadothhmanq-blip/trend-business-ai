import type { ImageSlotKind } from "@/lib/ai-core/image-engine/slots";

export type ImageSourceTier = "user" | "ai" | "library" | "stock";

export type SlotOrientation = "landscape" | "portrait" | "square" | "any";

/** Per-slot image rules for an industry profile. */
export type SlotImageRule = {
  kind: ImageSlotKind;
  /** Subjects that must appear in alt text, URL hints, or metadata. */
  allowedSubjects: string[];
  /** Subjects that disqualify an image for this slot. */
  forbiddenSubjects: string[];
  orientation: SlotOrientation;
  minWidth: number;
};

export type IndustrySlotRules = {
  industryId: string;
  subcategories: string[];
  visualStyle: string;
  slots: Record<ImageSlotKind, SlotImageRule>;
};

export type DetectedImageContext = {
  industryId: string;
  industryLabel: string;
  subcategory: string | null;
  visualStyle: string;
  colorMood: string;
  matchedBy: "exact" | "alias" | "subcategory" | "fallback";
  confidence: number;
};

export type ImageSelectionRecord = {
  slotId: string;
  kind: ImageSlotKind;
  url: string;
  sourceTier: ImageSourceTier;
  industryId: string;
  accepted: boolean;
};

export type ImageRejectionRecord = {
  slotId: string;
  kind: ImageSlotKind;
  url: string;
  category:
    | "wrong-industry"
    | "wrong-subcategory"
    | "duplicate"
    | "low-quality"
    | "wrong-orientation"
    | "wrong-section"
    | "forbidden-subject";
  detail: string;
  replacedWith?: string;
  replacementTier?: ImageSourceTier;
};

export type IndustryImageRulesReport = {
  passed: boolean;
  score: number;
  detected: DetectedImageContext;
  profileId: string;
  selected: ImageSelectionRecord[];
  rejected: ImageRejectionRecord[];
  replaced: number;
  sourceCounts: Record<ImageSourceTier, number>;
  slotCoverage: Partial<
    Record<ImageSlotKind, { required: number; actual: number; passed: boolean }>
  >;
  summary: string;
};

export type ImageCandidate = {
  url: string;
  alt?: string;
  provider?: string;
  sourceTier?: ImageSourceTier;
  industryId?: string;
  isUserOverride?: boolean;
  assignedKind?: ImageSlotKind;
};

export type ResolveSlotImageInput = {
  kind: ImageSlotKind;
  index: number;
  userUrl?: string | null;
  aiUrl?: string | null;
  libraryUrl?: string | null;
  stockUrl?: string | null;
};

export type ResolvedSlotImage = {
  url: string;
  sourceTier: ImageSourceTier;
};
