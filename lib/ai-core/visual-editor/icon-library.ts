/**
 * Icon library catalog for the visual editor picker.
 */

export type IconCategory =
  | "all"
  | "arrows"
  | "communication"
  | "business"
  | "social"
  | "interface"
  | "media"
  | "favorites"
  | "recent";

export type IconLibraryEntry = {
  id: string;
  label: string;
  category: Exclude<IconCategory, "all" | "favorites" | "recent">;
  keywords: string[];
};

export const ICON_LIBRARY: IconLibraryEntry[] = [
  { id: "ArrowRight", label: "Arrow right", category: "arrows", keywords: ["next", "forward"] },
  { id: "ArrowLeft", label: "Arrow left", category: "arrows", keywords: ["back", "previous"] },
  { id: "ChevronRight", label: "Chevron right", category: "arrows", keywords: ["next"] },
  { id: "ChevronDown", label: "Chevron down", category: "arrows", keywords: ["dropdown"] },
  { id: "Mail", label: "Mail", category: "communication", keywords: ["email", "contact"] },
  { id: "Phone", label: "Phone", category: "communication", keywords: ["call", "contact"] },
  { id: "MessageCircle", label: "Message", category: "communication", keywords: ["chat"] },
  { id: "MapPin", label: "Location", category: "communication", keywords: ["address", "map"] },
  { id: "Building2", label: "Building", category: "business", keywords: ["office", "company"] },
  { id: "Briefcase", label: "Briefcase", category: "business", keywords: ["work", "job"] },
  { id: "BarChart3", label: "Chart", category: "business", keywords: ["analytics", "stats"] },
  { id: "Target", label: "Target", category: "business", keywords: ["goal", "conversion"] },
  { id: "Sparkles", label: "Sparkles", category: "interface", keywords: ["premium", "magic"] },
  { id: "Star", label: "Star", category: "interface", keywords: ["rating", "favorite"] },
  { id: "Check", label: "Check", category: "interface", keywords: ["done", "success"] },
  { id: "Shield", label: "Shield", category: "interface", keywords: ["security", "trust"] },
  { id: "Zap", label: "Zap", category: "interface", keywords: ["fast", "energy"] },
  { id: "Globe", label: "Globe", category: "interface", keywords: ["world", "web"] },
  { id: "Users", label: "Users", category: "interface", keywords: ["team", "people"] },
  { id: "Heart", label: "Heart", category: "social", keywords: ["like", "love"] },
  { id: "Share2", label: "Share", category: "social", keywords: ["social"] },
  { id: "Instagram", label: "Instagram", category: "social", keywords: ["social"] },
  { id: "Twitter", label: "Twitter", category: "social", keywords: ["x", "social"] },
  { id: "Linkedin", label: "LinkedIn", category: "social", keywords: ["social"] },
  { id: "Facebook", label: "Facebook", category: "social", keywords: ["social"] },
  { id: "Youtube", label: "YouTube", category: "social", keywords: ["video", "social"] },
  { id: "Play", label: "Play", category: "media", keywords: ["video"] },
  { id: "Download", label: "Download", category: "media", keywords: ["file"] },
  { id: "ExternalLink", label: "External link", category: "interface", keywords: ["open"] },
  { id: "Menu", label: "Menu", category: "interface", keywords: ["nav", "hamburger"] },
  { id: "Search", label: "Search", category: "interface", keywords: ["find"] },
  { id: "Settings", label: "Settings", category: "interface", keywords: ["gear"] },
  { id: "Clock", label: "Clock", category: "interface", keywords: ["time"] },
  { id: "Calendar", label: "Calendar", category: "interface", keywords: ["date"] },
  { id: "FileText", label: "Document", category: "business", keywords: ["file", "pdf"] },
  { id: "Layers", label: "Layers", category: "business", keywords: ["features"] },
  { id: "LayoutGrid", label: "Grid", category: "interface", keywords: ["layout"] },
];

const UNICODE_ICON_MAP: Record<string, string> = {
  "▦": "LayoutGrid",
  "◈": "Layers",
  "⬡": "Zap",
  "◉": "Shield",
  "◎": "Target",
  "◆": "Star",
  "◇": "Sparkles",
  "○": "Globe",
  "•": "Check",
  "→": "ArrowRight",
};

export function resolveIconName(raw: string | undefined): string {
  if (!raw?.trim()) return "Sparkles";
  const value = raw.trim();
  if (ICON_LIBRARY.some((e) => e.id === value)) return value;
  return UNICODE_ICON_MAP[value] ?? "Sparkles";
}

export function searchIcons(
  query: string,
  category: IconCategory,
  favorites: string[],
  recent: string[],
): IconLibraryEntry[] {
  const q = query.trim().toLowerCase();
  let pool = ICON_LIBRARY;

  if (category === "favorites") {
    pool = ICON_LIBRARY.filter((e) => favorites.includes(e.id));
  } else if (category === "recent") {
    pool = recent
      .map((id) => ICON_LIBRARY.find((e) => e.id === id))
      .filter((e): e is IconLibraryEntry => Boolean(e));
  } else if (category !== "all") {
    pool = ICON_LIBRARY.filter((e) => e.category === category);
  }

  if (!q) return pool;
  return pool.filter(
    (e) =>
      e.id.toLowerCase().includes(q) ||
      e.label.toLowerCase().includes(q) ||
      e.keywords.some((k) => k.includes(q)),
  );
}

export const ICON_CATEGORIES: Array<{ id: IconCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "favorites", label: "Favorites" },
  { id: "recent", label: "Recent" },
  { id: "arrows", label: "Arrows" },
  { id: "communication", label: "Communication" },
  { id: "business", label: "Business" },
  { id: "social", label: "Social" },
  { id: "interface", label: "Interface" },
  { id: "media", label: "Media" },
];
