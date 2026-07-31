"use client";

import { useEffect, useState } from "react";
import type { WbTemplateRendererMeta } from "@/lib/website/template-renderer-contract";
import type { WbTemplateRuntimeModel } from "@/lib/website/template-renderer-contract/types";
import {
  clearActiveBuilderTemplateRuntime,
  setActiveBuilderTemplateRuntime,
} from "@/lib/website/builder/builder-template-runtime-session.client";
import type {
  BuilderTemplateRuntimeFailure,
  BuilderTemplateRuntimeScope,
} from "@/lib/website/builder/template-runtime.types";
import { fetchBuilderTemplateRuntimeModel } from "@/lib/website/builder/template-runtime-client";

export type BuilderTemplateRuntimeState = {
  model: WbTemplateRuntimeModel | null;
  meta: WbTemplateRendererMeta | null;
  error: BuilderTemplateRuntimeFailure | null;
  loading: boolean;
  templateId: string | null;
};

const IDLE_STATE: BuilderTemplateRuntimeState = {
  model: null,
  meta: null,
  error: null,
  loading: false,
  templateId: null,
};

/**
 * Resolves and caches the active Website Builder template runtime model.
 * No UI is rendered; this hook only wires renderer output into builder state.
 */
export function useBuilderTemplateRuntime(
  templateId?: string | null,
  scope?: BuilderTemplateRuntimeScope,
): BuilderTemplateRuntimeState {
  const [state, setState] = useState<BuilderTemplateRuntimeState>(IDLE_STATE);

  useEffect(() => {
    const normalizedId = templateId?.trim() || null;
    if (!normalizedId) {
      clearActiveBuilderTemplateRuntime();
      setState(IDLE_STATE);
      return;
    }

    let cancelled = false;
    setState((current) => ({
      ...current,
      loading: true,
      templateId: normalizedId,
      error: null,
    }));

    void fetchBuilderTemplateRuntimeModel(normalizedId, scope).then((result) => {
      if (cancelled) return;

      if (result.ok) {
        setActiveBuilderTemplateRuntime(result);
        setState({
          model: result.model,
          meta: result.meta,
          error: null,
          loading: false,
          templateId: normalizedId,
        });
        return;
      }

      clearActiveBuilderTemplateRuntime();
      setState({
        model: null,
        meta: null,
        error: result,
        loading: false,
        templateId: normalizedId,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [templateId, scope?.layoutId, scope?.pageId]);

  return state;
}
