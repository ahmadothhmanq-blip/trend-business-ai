import { APP_TEMPLATES } from "@/lib/ai-core/app-design-platform/templates";

for (const t of APP_TEMPLATES) {
  const modelNames = new Set(t.dataModels.map((m) => m.name));
  const bindings = [...new Set(t.screens.flatMap((s) => s.dataBindings))];
  const phantoms = bindings.filter((b) => !modelNames.has(b));
  const thin = t.dataModels
    .filter((m) => m.fields.length < 4)
    .map((m) => `${m.name}(${m.fields.length})`);
  const avg =
    t.dataModels.reduce((a, m) => a + m.fields.length, 0) /
    Math.max(1, t.dataModels.length);
  console.log(
    [
      t.id.padEnd(16),
      `m=${t.dataModels.length}`,
      `avg=${avg.toFixed(1)}`,
      `s=${t.screens.length}`,
      `r=${t.roles.length}`,
      phantoms.length ? `PHANTOM:${phantoms.join(",")}` : "ok-bind",
      thin.length ? `THIN:${thin.join(",")}` : "ok-fields",
    ].join(" | "),
  );
}
