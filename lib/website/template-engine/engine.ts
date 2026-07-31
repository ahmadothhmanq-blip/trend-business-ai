import {
  WB_TEMPLATE_ENGINE_VERSION,
} from "@/lib/website/template-engine/constants";
import { resolveWbTemplatesRoot } from "@/lib/website/template-engine/constants.server";
import { loadWbTemplatePackages } from "@/lib/website/template-engine/loader";
import {
  buildWbTemplateEmptyPreviewDocument,
  buildWbTemplatePreviewDocument,
} from "@/lib/website/template-engine/preview";
import { getWbTemplateRegistry } from "@/lib/website/template-engine/registry";
import { renderWbTemplate } from "@/lib/website/template-engine/renderer";
import type {
  WbTemplateEngineStatus,
  WbTemplateId,
  WbTemplateListItem,
  WbTemplateLoadReport,
  WbTemplateManifest,
  WbTemplatePreviewDocument,
  WbTemplateRenderContext,
  WbTemplateRenderResult,
} from "@/lib/website/template-engine/types";

export type WbTemplateEngineOptions = {
  templatesRoot?: string;
  autoLoad?: boolean;
};

/**
 * Orchestrator for the isolated Website Builder Template Engine.
 */
export class WbTemplateEngine {
  private readonly templatesRoot: string;
  private initialized = false;
  private lastLoadReport: WbTemplateLoadReport | null = null;

  constructor(options?: WbTemplateEngineOptions) {
    this.templatesRoot = options?.templatesRoot ?? resolveWbTemplatesRoot();
    if (options?.autoLoad) {
      void this.initialize();
    }
  }

  async initialize(): Promise<WbTemplateLoadReport> {
    this.lastLoadReport = await loadWbTemplatePackages({
      templatesRoot: this.templatesRoot,
      clearRegistry: true,
    });
    this.initialized = true;
    return this.lastLoadReport;
  }

  getStatus(): WbTemplateEngineStatus {
    const registry = getWbTemplateRegistry();
    return {
      engineVersion: WB_TEMPLATE_ENGINE_VERSION,
      templatesRoot: this.templatesRoot,
      installedCount: registry.size(),
      initialized: this.initialized,
      lastLoadedAt: registry.getLastLoadedAt(),
    };
  }

  getLastLoadReport(): WbTemplateLoadReport | null {
    return this.lastLoadReport;
  }

  async ensureLoaded(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  async listTemplates(): Promise<WbTemplateListItem[]> {
    await this.ensureLoaded();
    return getWbTemplateRegistry().list();
  }

  async getManifest(id: WbTemplateId): Promise<WbTemplateManifest | null> {
    await this.ensureLoaded();
    return getWbTemplateRegistry().getManifest(id);
  }

  async renderTemplate(
    id: WbTemplateId,
    context?: WbTemplateRenderContext,
  ): Promise<WbTemplateRenderResult | null> {
    await this.ensureLoaded();
    const pkg = getWbTemplateRegistry().getPackage(id);
    if (!pkg) return null;
    return renderWbTemplate(pkg, context);
  }

  async buildPreview(
    id: WbTemplateId,
    context?: WbTemplateRenderContext,
  ): Promise<WbTemplatePreviewDocument | null> {
    await this.ensureLoaded();
    const pkg = getWbTemplateRegistry().getPackage(id);
    if (!pkg) return null;
    return buildWbTemplatePreviewDocument(pkg, context);
  }

  async buildCatalogPreview(): Promise<WbTemplatePreviewDocument> {
    await this.ensureLoaded();
    const templates = getWbTemplateRegistry().list();
    if (templates.length === 0) {
      return buildWbTemplateEmptyPreviewDocument();
    }
    return (
      (await this.buildPreview(templates[0]!.id, {
        brandName: templates[0]!.name,
      })) ?? buildWbTemplateEmptyPreviewDocument()
    );
  }
}

let defaultEngine: WbTemplateEngine | null = null;

export function createWbTemplateEngine(
  options?: WbTemplateEngineOptions,
): WbTemplateEngine {
  return new WbTemplateEngine(options);
}

export function getWbTemplateEngine(): WbTemplateEngine {
  if (!defaultEngine) {
    defaultEngine = new WbTemplateEngine();
  }
  return defaultEngine;
}

export async function initializeWbTemplateEngine(
  options?: WbTemplateEngineOptions,
): Promise<WbTemplateEngine> {
  const engine = options ? createWbTemplateEngine(options) : getWbTemplateEngine();
  await engine.initialize();
  return engine;
}
