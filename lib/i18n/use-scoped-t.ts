"use client";

import { useCallback } from "react";
import { useTranslation } from "@/lib/i18n/client";

/** Scoped translator: `ts("sections.projectType.title")` → `products.websiteBuilder.sections.projectType.title` */
export function useScopedT(scope: string) {
  const { t } = useTranslation();
  return useCallback(
    (key: string, values?: Record<string, string | number>) => {
      const fullKey = key.startsWith(scope) ? key : `${scope}.${key}`;
      return t(fullKey, values);
    },
    [scope, t],
  );
}

export function useWorkspaceT(workspace: "crm" | "erp" | "bi" | "cyber") {
  return useScopedT(`workspaces.${workspace}`);
}

export function useProductT(
  product:
    | "websiteBuilder"
    | "contentStudio"
    | "imageGenerator"
    | "videoStudio"
    | "webappBuilder"
    | "logoDesigner"
    | "brandIdentity"
    | "businessSuite"
    | "aiAgents"
    | "landingPageBuilder"
    | "marketAnalysis",
) {
  return useScopedT(`products.${product}`);
}
