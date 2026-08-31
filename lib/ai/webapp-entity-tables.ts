/**
 * Canonical entity-table resolution for App Builder.
 * Scaffold, requirements, and validation must share one source of truth.
 */

function normalizeTableName(name: string): string {
  return name.trim();
}

function dedupeTables(tables: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tables) {
    const name = normalizeTableName(raw);
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
}

/**
 * Merge planner / analysis / blueprint entity names into one ordered list.
 * Prefer app-model (design) names first so validation and scaffold stay aligned.
 */
export function resolveWebAppEntityTables(sources: {
  analysisTables?: string[];
  appModelTables?: string[];
  blueprintModels?: string[];
}): string[] {
  const merged = dedupeTables([
    ...(sources.appModelTables ?? []),
    ...(sources.blueprintModels ?? []),
    ...(sources.analysisTables ?? []),
  ]);
  return merged.length > 0 ? merged : ["Item"];
}

export function entityTablesFromAppModel(
  appModel: { dataModels?: Array<{ name: string }> } | null | undefined,
): string[] {
  return (appModel?.dataModels ?? []).map((model) => model.name);
}
