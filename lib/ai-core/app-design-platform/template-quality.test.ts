import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { listAppTemplates } from "@/lib/ai-core/app-design-platform/templates";
import {
  FLAGSHIP_QUALITY_MIN,
  FLAGSHIP_TEMPLATE_IDS,
  TEMPLATE_QUALITY_MIN,
  auditAllAppTemplates,
  auditAppTemplate,
} from "@/lib/ai-core/app-design-platform/template-quality";

describe("app template quality floor", () => {
  it("defines a strict minimum bar", () => {
    assert.ok(TEMPLATE_QUALITY_MIN.minModels >= 3);
    assert.ok(TEMPLATE_QUALITY_MIN.minFieldsPerModel >= 4);
    assert.ok(TEMPLATE_QUALITY_MIN.minRoles >= 3);
  });

  it("flagship verticals meet the raised quality bar", () => {
    assert.ok(FLAGSHIP_QUALITY_MIN.minFieldsPerModel >= 5);
    assert.equal(FLAGSHIP_TEMPLATE_IDS.length, 5);
  });

  it("every business template meets the quality floor", () => {
    const templates = listAppTemplates();
    assert.ok(templates.length >= 12);
    const issues = auditAllAppTemplates(templates);
    assert.deepEqual(
      issues,
      [],
      issues.map((issue) => issue.message).join("\n"),
    );
  });

  it("reports phantoms clearly when introduced", () => {
    const base = listAppTemplates()[0]!;
    const broken = {
      ...base,
      screens: [
        ...base.screens,
        {
          ...base.screens[0]!,
          name: "Broken",
          path: "/broken",
          dataBindings: ["DoesNotExist"],
        },
      ],
    };
    const issues = auditAppTemplate(broken);
    assert.ok(issues.some((issue) => issue.code === "phantom_binding"));
  });
});
