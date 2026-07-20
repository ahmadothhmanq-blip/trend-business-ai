/**
 * App data & backend management foundation.
 */

import type { AppDataModel, StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import { slugId } from "@/lib/ai-core/app-design-platform/ids";

export type CrudOperation = "create" | "read" | "update" | "delete" | "list";

export type ScreenDataBinding = {
  screenId: string;
  modelId: string;
  operations: CrudOperation[];
};

export function listDataModels(model: StructuredAppModel): AppDataModel[] {
  return model.dataModels;
}

export function getDataModel(
  model: StructuredAppModel,
  modelIdOrName: string,
): AppDataModel | undefined {
  return model.dataModels.find(
    (m) => m.id === modelIdOrName || m.name === modelIdOrName,
  );
}

export function upsertDataModel(
  model: StructuredAppModel,
  dataModel: Omit<AppDataModel, "id"> & { id?: string },
): StructuredAppModel {
  const id = dataModel.id || slugId("model", dataModel.name, model.dataModels.length);
  const next: AppDataModel = { ...dataModel, id };
  const idx = model.dataModels.findIndex((m) => m.id === id || m.name === next.name);
  const dataModels =
    idx >= 0
      ? model.dataModels.map((m, i) => (i === idx ? next : m))
      : [...model.dataModels, next];
  return {
    ...model,
    dataModels,
    updatedAt: new Date().toISOString(),
    version: model.version + 1,
  };
}

export function connectScreenToData(
  model: StructuredAppModel,
  screenId: string,
  dataModelName: string,
): StructuredAppModel {
  return {
    ...model,
    screens: model.screens.map((s) =>
      s.id === screenId
        ? {
            ...s,
            dataBindings: Array.from(new Set([...s.dataBindings, dataModelName])),
          }
        : s,
    ),
    updatedAt: new Date().toISOString(),
    version: model.version + 1,
  };
}

export function deriveScreenDataBindings(model: StructuredAppModel): ScreenDataBinding[] {
  return model.screens.flatMap((screen) =>
    screen.dataBindings
      .map((name) => {
        const dm = getDataModel(model, name);
        if (!dm) return null;
        return {
          screenId: screen.id,
          modelId: dm.id,
          operations: dm.crud,
        } satisfies ScreenDataBinding;
      })
      .filter((x): x is ScreenDataBinding => Boolean(x)),
  );
}

export function describeBackendWorkflows(model: StructuredAppModel): string[] {
  return model.workflows.map(
    (w) => `${w.name}: ${w.trigger} → ${w.steps.join(" → ")} [${w.roles.join(", ")}]`,
  );
}

/** Prisma-like schema sketch for generation prompts / management UI. */
export function toPrismaSchemaSketch(model: StructuredAppModel): string {
  const blocks = model.dataModels.map((dm) => {
    const fields = dm.fields
      .map((f) => {
        const t =
          f.type === "string"
            ? "String"
            : f.type === "number"
              ? "Int"
              : f.type === "boolean"
                ? "Boolean"
                : f.type === "date"
                  ? "DateTime"
                  : f.type === "money"
                    ? "Decimal"
                    : f.type === "json"
                      ? "Json"
                      : "String";
        const req = f.required ? "" : "?";
        const uniq = f.unique ? " @unique" : "";
        return `  ${f.name} ${t}${req}${uniq}`;
      })
      .join("\n");
    return `model ${dm.name} {\n  id String @id @default(cuid())\n${fields}\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}`;
  });
  return blocks.join("\n\n");
}
