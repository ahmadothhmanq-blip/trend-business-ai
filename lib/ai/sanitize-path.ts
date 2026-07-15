export function sanitizeProjectPath(filePath: string) {
  const normalized = filePath.replaceAll("\\", "/").replace(/^\/+/, "");
  const parts = normalized.split("/").filter(Boolean);

  if (
    !parts.length ||
    parts.some((part) => part === "." || part === "..") ||
    normalized.startsWith("node_modules/") ||
    normalized.startsWith(".next/")
  ) {
    throw new Error(`Unsafe generated file path: ${filePath}`);
  }

  return parts.join("/");
}
