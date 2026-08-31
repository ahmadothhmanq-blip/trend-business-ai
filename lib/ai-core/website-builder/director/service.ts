/**
 * Website Director service (Phase 2).
 * Prompt → intent → business → strategy → IA → plan.
 * LLM access is adapter-only. No HTML, React, CSS, database, or publish.
 */

import { createHash, randomUUID } from "node:crypto";
import { attachPlanToProject, createWebsitePlan } from "@/lib/ai-core/website-builder/domain/create";
import { transition } from "@/lib/ai-core/website-builder/domain/state-machine";
import type { WebsitePlan, WebsiteProject } from "@/lib/ai-core/website-builder/domain/contracts";
import type {
  DirectorWebsitePlan,
  WebsiteDirectorInput,
  WebsiteDirectorLlmAdapter,
  WebsiteDirectorLlmDraft,
  WebsiteDirectorPlanStore,
  WebsiteDirectorResult,
} from "@/lib/ai-core/website-builder/director/contracts";
import { WEBSITE_DIRECTOR_JSON_SCHEMA } from "@/lib/ai-core/website-builder/director/contracts";
import { WebsiteDirectorError } from "@/lib/ai-core/website-builder/director/errors";
import {
  buildWebsiteDirectorPrompt,
  buildWebsiteDirectorRetryPrompt,
} from "@/lib/ai-core/website-builder/director/prompts";
import {
  assertDirectorWebsitePlan,
  assertWebsiteDirectorInput,
  evaluateWebsiteDirectorDraft,
} from "@/lib/ai-core/website-builder/director/validation";

const MAX_ATTEMPTS = 2;

export type RunWebsiteDirectorParams = {
  input: WebsiteDirectorInput;
  adapter?: WebsiteDirectorLlmAdapter;
  store?: WebsiteDirectorPlanStore;
  now?: () => string;
  createId?: () => string;
};

export function createMemoryWebsiteDirectorStore(): WebsiteDirectorPlanStore {
  const plans = new Map<string, DirectorWebsitePlan>();
  return {
    get: (key) => plans.get(key),
    set: (key, plan) => {
      plans.set(key, plan);
    },
  };
}

export function websiteDirectorIdempotencyKey(
  input: WebsiteDirectorInput & { language: string },
): string {
  const payload = JSON.stringify({
    projectId: input.project.id,
    userId: input.project.userId,
    language: input.language,
    prompt: input.prompt.trim().replace(/\s+/g, " ").toLowerCase(),
  });
  return createHash("sha256").update(payload).digest("hex");
}

export function assembleDirectorWebsitePlan(params: {
  draft: WebsiteDirectorLlmDraft;
  project: WebsiteProject;
  language: string;
  promptHash: string;
  id: string;
  createdAt: string;
}): DirectorWebsitePlan {
  const { draft } = params;
  const ia = draft.informationArchitecture;
  const plan: DirectorWebsitePlan = {
    ...draft,
    id: params.id,
    projectId: params.project.id,
    userId: params.project.userId,
    version: 1,
    websiteType: draft.intent.websiteType,
    businessCategory: draft.business.businessCategory,
    targetAudience: draft.business.targetAudience,
    goals: draft.strategy.goals,
    brandSummary: draft.business.brandSummary,
    sitemap: ia.sitemap,
    navigation: ia.navigation,
    requiredPages: ia.requiredPages,
    seoStrategy: draft.strategy.seoStrategy,
    suggestedTheme: draft.strategy.suggestedTheme,
    contentRequirements: ia.contentRequirements,
    assetRequirements: ia.assetRequirements,
    forms: ia.forms,
    integrations: ia.integrations,
    promptHash: params.promptHash,
    language: params.language,
    createdAt: params.createdAt,
  };
  assertDirectorWebsitePlan(plan);
  return plan;
}

function failedResult(
  project: WebsiteProject,
  error: WebsiteDirectorError,
  attempts: number,
): WebsiteDirectorResult {
  return {
    status: "failed",
    plan: null,
    domainPlan: null,
    project,
    reused: false,
    attempts,
    errorCode: error.code,
    errorMessage: error.message,
  };
}

function toDirectorError(error: unknown, fallback: WebsiteDirectorError["code"]): WebsiteDirectorError {
  if (error instanceof WebsiteDirectorError) return error;
  return new WebsiteDirectorError(error instanceof Error ? error.message : "Website Director failed.", fallback);
}

async function generateDraft(params: {
  adapter: WebsiteDirectorLlmAdapter;
  prompt: string;
}): Promise<unknown> {
  try {
    return await params.adapter.generateJson({
      prompt: params.prompt,
      schema: WEBSITE_DIRECTOR_JSON_SCHEMA,
    });
  } catch (error) {
    throw toDirectorError(error, "llm_failed");
  }
}

function attachDomainPlan(project: WebsiteProject, directorPlan: DirectorWebsitePlan, planId: string): {
  project: WebsiteProject;
  domainPlan: WebsitePlan;
} {
  let next = project.domainState === "draft" ? transition(project, "planning") : project;
  const domainPlan = createWebsitePlan({
    id: planId,
    project: next,
    version: 1,
    objective: directorPlan.goals[0] ?? directorPlan.brandSummary,
  });
  next = attachPlanToProject(next, domainPlan);
  next = transition(next, "planned");
  return { project: next, domainPlan };
}

export async function runWebsiteDirector(params: RunWebsiteDirectorParams): Promise<WebsiteDirectorResult> {
  const input = { ...params.input };
  try {
    assertWebsiteDirectorInput(input);
  } catch (error) {
    return failedResult(params.input.project, toDirectorError(error, "invalid_input"), 0);
  }

  const language = input.language!;
  const normalizedInput = { ...input, language };
  const promptHash = websiteDirectorIdempotencyKey(normalizedInput);
  const existing = params.store?.get(promptHash);
  if (existing) {
    return {
      status: "reused",
      plan: existing,
      domainPlan: null,
      project: params.input.project,
      reused: true,
      attempts: 0,
    };
  }

  if (!params.adapter) {
    return failedResult(
      params.input.project,
      new WebsiteDirectorError("Website Director requires an LLM adapter.", "llm_unconfigured"),
      0,
    );
  }

  let attempts = 0;
  let lastReason = "Director response was invalid.";
  let lastCode: WebsiteDirectorError["code"] = "invalid_plan";
  let draft: WebsiteDirectorLlmDraft | null = null;

  while (attempts < MAX_ATTEMPTS) {
    attempts += 1;
    const prompt =
      attempts === 1
        ? buildWebsiteDirectorPrompt(normalizedInput)
        : buildWebsiteDirectorRetryPrompt(normalizedInput, lastReason);
    try {
      const raw = await generateDraft({ adapter: params.adapter, prompt });
      const evaluation = evaluateWebsiteDirectorDraft(raw);
      if (evaluation.ok) {
        draft = evaluation.draft;
        break;
      }
      lastReason = evaluation.reason;
      lastCode = evaluation.code;
    } catch (error) {
      return failedResult(params.input.project, toDirectorError(error, "llm_failed"), attempts);
    }
  }

  if (!draft) {
    return failedResult(params.input.project, new WebsiteDirectorError(lastReason, lastCode), attempts);
  }

  try {
    const plan = assembleDirectorWebsitePlan({
      draft,
      project: params.input.project,
      language,
      promptHash,
      id: params.createId?.() ?? randomUUID(),
      createdAt: params.now?.() ?? new Date().toISOString(),
    });
    const attached = attachDomainPlan(params.input.project, plan, plan.id);
    params.store?.set(promptHash, plan);
    return {
      status: "ready",
      plan,
      domainPlan: attached.domainPlan,
      project: attached.project,
      reused: false,
      attempts,
    };
  } catch (error) {
    return failedResult(params.input.project, toDirectorError(error, "invalid_plan"), attempts);
  }
}
