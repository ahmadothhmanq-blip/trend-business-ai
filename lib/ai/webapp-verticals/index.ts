/**
 * Apply at most one vertical overlay (CRM / booking / ecommerce / healthcare / finance).
 */

import type { AppDataModel } from "@/lib/ai-core/app-design-platform/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import { applyBookingVerticalScaffold } from "@/lib/ai/webapp-verticals/booking-scaffold";
import { applyCrmVerticalScaffold } from "@/lib/ai/webapp-verticals/crm-scaffold";
import { applyEcommerceVerticalScaffold } from "@/lib/ai/webapp-verticals/ecommerce-scaffold";
import { applyFinanceVerticalScaffold } from "@/lib/ai/webapp-verticals/finance-scaffold";
import { applyHealthcareVerticalScaffold } from "@/lib/ai/webapp-verticals/healthcare-scaffold";

export type VerticalScaffoldOptions = {
  templateId?: string | null;
  dataModels?: AppDataModel[];
};

const APPLYERS = [
  applyCrmVerticalScaffold,
  applyBookingVerticalScaffold,
  applyEcommerceVerticalScaffold,
  applyHealthcareVerticalScaffold,
  applyFinanceVerticalScaffold,
] as const;

export function applyVerticalScaffolds(
  files: GeneratedProjectFile[],
  options: VerticalScaffoldOptions,
): GeneratedProjectFile[] {
  let next = files;
  for (const apply of APPLYERS) {
    const candidate = apply(next, options);
    if (candidate !== next) return candidate;
  }
  return next;
}
