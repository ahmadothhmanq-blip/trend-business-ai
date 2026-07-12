export type FileCategory =
  | "layout"
  | "lib"
  | "types"
  | "hooks"
  | "components"
  | "pages"
  | "api"
  | "configs";

export type PlannedFile = {
  path: string;
  purpose: string;
  language: string;
  category: FileCategory;
};

const CATEGORY_ORDER: FileCategory[] = [
  "layout",
  "lib",
  "types",
  "hooks",
  "components",
  "pages",
  "api",
  "configs",
];

export function normalizeCategory(value: string): FileCategory {
  const category = value.toLowerCase().trim();
  if (category === "layout" || category === "layouts") return "layout";
  if (category === "lib" || category === "utility" || category === "utilities")
    return "lib";
  if (category === "type" || category === "types") return "types";
  if (category === "hook" || category === "hooks") return "hooks";
  if (category === "component" || category === "components") return "components";
  if (category === "page" || category === "pages") return "pages";
  if (category === "api" || category === "route" || category === "routes")
    return "api";
  return "configs";
}

export function inferCategoryFromPath(filePath: string): FileCategory {
  if (filePath.startsWith("app/api/")) return "api";
  if (filePath === "app/layout.tsx" || filePath.endsWith("/layout.tsx"))
    return "layout";
  if (filePath.startsWith("app/")) return "pages";
  if (filePath.startsWith("components/")) return "components";
  if (filePath.startsWith("hooks/")) return "hooks";
  if (filePath.startsWith("types/")) return "types";
  if (filePath.startsWith("lib/")) return "lib";
  return "configs";
}

export function sortFilesByDependency<T extends { category: FileCategory; path: string }>(
  files: T[],
): T[] {
  return [...files].sort((a, b) => {
    const categoryDelta =
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    if (categoryDelta !== 0) return categoryDelta;
    return a.path.localeCompare(b.path);
  });
}

export function truncateForContext(content: string, limit = 3500) {
  if (content.length <= limit) return content;
  return `${content.slice(0, limit)}\n/* ... truncated for context ... */`;
}
