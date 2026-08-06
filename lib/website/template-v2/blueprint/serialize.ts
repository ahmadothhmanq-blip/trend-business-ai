import {
  blueprintInputSchema,
  websiteBlueprintSchema,
} from "@/lib/website/template-v2/blueprint/schema";
import type {
  BlueprintInput,
  WebsiteBlueprint,
} from "@/lib/website/template-v2/blueprint/types";
import { BLUEPRINT_SCHEMA_VERSION } from "@/lib/website/template-v2/blueprint/weights";

export type SerializedWebsiteBlueprint = {
  schemaVersion: string;
  blueprint: WebsiteBlueprint;
};

export function serializeWebsiteBlueprint(
  blueprint: WebsiteBlueprint,
): string {
  const payload: SerializedWebsiteBlueprint = {
    schemaVersion: BLUEPRINT_SCHEMA_VERSION,
    blueprint,
  };
  return JSON.stringify(payload, null, 2);
}

export function deserializeWebsiteBlueprint(
  json: string,
): WebsiteBlueprint {
  const parsed = JSON.parse(json) as SerializedWebsiteBlueprint | WebsiteBlueprint;

  if ("schemaVersion" in parsed && "blueprint" in parsed) {
    return parseWebsiteBlueprint(parsed.blueprint);
  }

  return parseWebsiteBlueprint(parsed as WebsiteBlueprint);
}

export function parseWebsiteBlueprint(value: unknown): WebsiteBlueprint {
  const result = websiteBlueprintSchema.safeParse(value);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid WebsiteBlueprint: ${issues}`);
  }
  return result.data as WebsiteBlueprint;
}

export function parseBlueprintInput(value: unknown): BlueprintInput {
  const result = blueprintInputSchema.safeParse(value);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid BlueprintInput: ${issues}`);
  }
  return result.data;
}

export function isWebsiteBlueprint(value: unknown): value is WebsiteBlueprint {
  return websiteBlueprintSchema.safeParse(value).success;
}

export function isSerializedWebsiteBlueprint(
  value: unknown,
): value is SerializedWebsiteBlueprint {
  return (
    typeof value === "object" &&
    value !== null &&
    "schemaVersion" in value &&
    "blueprint" in value &&
    isWebsiteBlueprint((value as SerializedWebsiteBlueprint).blueprint)
  );
}
