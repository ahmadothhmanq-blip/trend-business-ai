import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  APP_TEMPLATE_TO_WEBAPP_TYPE,
  WEBAPP_TYPES,
  getWebappTypeForTemplate,
} from "@/lib/constants/webapp-builder";
import { listAppTemplates } from "@/lib/ai-core/app-design-platform/templates";

describe("webapp type catalog alignment", () => {
  it("maps every App Design template to a first-class webapp type", () => {
    for (const template of listAppTemplates()) {
      const typeId = getWebappTypeForTemplate(template.id);
      assert.notEqual(typeId, "custom", `${template.id} should not fall back to custom`);
      assert.ok(
        WEBAPP_TYPES.some((type) => type.id === typeId),
        `${template.id} maps to missing type ${typeId}`,
      );
      assert.equal(APP_TEMPLATE_TO_WEBAPP_TYPE[template.id], typeId);
    }
  });
});
