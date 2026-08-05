/** Convert package component id (kebab-case) to PascalCase export name. */
export function componentIdToExportName(componentId: string): string {
  return componentId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/** Project file path for a V2 package component scaffold. */
export function componentIdToProjectPath(
  packageId: string,
  scaffoldRelativePath: string,
): string {
  const normalized = scaffoldRelativePath.replace(/^[/\\]+/, "");
  if (normalized.startsWith("components/")) {
    return normalized;
  }
  return `components/${packageId}/${normalized.replace(/^components\//, "")}`;
}

export function resolveV2ResponsiveFile(manifest: {
  responsive?: { file?: string } | Record<string, unknown>;
}): string {
  const responsive = manifest.responsive;
  if (
    responsive &&
    typeof responsive === "object" &&
    "file" in responsive &&
    typeof responsive.file === "string"
  ) {
    return responsive.file;
  }
  return "responsive/responsive.json";
}
