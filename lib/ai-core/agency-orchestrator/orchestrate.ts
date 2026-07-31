import { createHash } from "node:crypto";
import type { CoreBrief } from "@/lib/ai-core/layers/types";
import {
  applyBusinessIntelligenceToBrief,
  getBusinessIntelligenceFromBrief,
  runBusinessIntelligenceAnalysis,
} from "@/lib/ai-core/business-intelligence";
import { generateAgencyBrandKit } from "@/lib/ai-core/agency-brand-kit";
import { AGENCY_BRAND_KIT_KEY } from "@/lib/ai-core/agency-brand-kit/types";
import { generateAgencyContentLlm } from "@/lib/ai-core/content-intelligence/llm-generate";
import { AGENCY_CONTENT_KEY } from "@/lib/ai-core/content-intelligence/generate";
import { resolveDesignDNA, DESIGN_DNA_KEY } from "@/lib/ai-core/design-dna";
import type { AgencyGenerationContract } from "@/lib/ai-core/agency-orchestrator/types";
import { AGENCY_CONTRACT_KEY } from "@/lib/ai-core/agency-orchestrator/types";

function hashPrompt(prompt: string): string {
  return createHash("sha256").update(prompt.trim()).digest("hex").slice(0, 16);
}

export function getAgencyContractFromBrief(
  brief: CoreBrief,
): AgencyGenerationContract | null {
  const raw = brief.metadata?.[AGENCY_CONTRACT_KEY];
  if (!raw || typeof raw !== "object") return null;
  const contract = raw as AgencyGenerationContract;
  if (!contract.brandKit?.companyName || !contract.designDNA) return null;
  return contract;
}

export function applyAgencyContractToBrief(
  brief: CoreBrief,
  contract: AgencyGenerationContract,
): CoreBrief {
  return {
    ...brief,
    metadata: {
      ...(brief.metadata ?? {}),
      [AGENCY_CONTRACT_KEY]: contract,
      [DESIGN_DNA_KEY]: contract.designDNA,
      [AGENCY_BRAND_KIT_KEY]: contract.brandKit,
      [AGENCY_CONTENT_KEY]: contract.content,
      projectName: contract.brandKit.companyName,
      brandStyle: contract.designDNA.label,
    },
  };
}

export type RunAgencyOrchestratorParams = {
  brief: CoreBrief;
  onProgress?: (message: string) => void;
  reuseExisting?: boolean;
};

/**
 * Agency Orchestrator — runs after business intelligence, before design/assets.
 * Produces the unified Agency Generation Contract for all downstream engines.
 */
export async function runAgencyOrchestrator(
  params: RunAgencyOrchestratorParams,
): Promise<{ contract: AgencyGenerationContract; brief: CoreBrief }> {
  const prompt = params.brief.prompt?.trim() || "";
  const promptHash = hashPrompt(prompt);

  const existing = getAgencyContractFromBrief(params.brief);
  if (
    params.reuseExisting !== false &&
    existing &&
    existing.promptHash === promptHash
  ) {
    params.onProgress?.(
      `[agency] Reusing contract · ${existing.brandKit.companyName} · ${existing.designDNA.label}`,
    );
    return { contract: existing, brief: params.brief };
  }

  params.onProgress?.("[agency] Orchestrating digital agency pipeline…");

  let brief = params.brief;
  let businessIntel = getBusinessIntelligenceFromBrief(brief);
  if (!businessIntel) {
    businessIntel = await runBusinessIntelligenceAnalysis({
      brief,
      onProgress: params.onProgress,
    });
    brief = applyBusinessIntelligenceToBrief(brief, businessIntel);
  }

  const profile = businessIntel.profile;

  params.onProgress?.(
    `[agency] Business locked · ${profile.industry} · ${profile.subcategory}`,
  );

  const designDNA = resolveDesignDNA({ prompt, businessProfile: profile });
  params.onProgress?.(`[agency] Design DNA · ${designDNA.label}`);

  const brandKit = await generateAgencyBrandKit({
    prompt,
    profile,
    designDNA,
    language: params.brief.language,
    onProgress: params.onProgress,
  });
  params.onProgress?.(`[agency] Brand kit · ${brandKit.companyName}`);

  const content = await generateAgencyContentLlm({
    profile,
    brandKit,
    designDNA,
    language: params.brief.language,
    prompt: params.brief.prompt,
    onProgress: params.onProgress,
  });
  params.onProgress?.(`[agency] Content strategy · ${content.services.length} service sections`);

  const { runContentIntelligenceEngine, persistContentIntelligenceOnBrief } =
    await import("@/lib/ai-core/content-intelligence/engine");
  const { superviseAgentSync, getWorkflowStateFromBrief } = await import(
    "@/lib/ai-core/multi-agent-orchestration"
  );

  const runCie = () =>
    runContentIntelligenceEngine({
      businessProfile: profile,
      industryId: profile.routingIndustryId,
      agencyContent: content,
      brandName: brandKit.companyName,
      language: params.brief.language,
    });

  let contentIntel;
  if (getWorkflowStateFromBrief(brief)) {
    const supervised = superviseAgentSync({
      agentId: "CIE",
      brief,
      relaxedDependencies: true,
      onProgress: params.onProgress,
      executor: runCie,
      updateBrief: (result, currentBrief) =>
        persistContentIntelligenceOnBrief(currentBrief, result),
    });
    contentIntel = supervised.result;
    brief = supervised.brief;
  } else {
    contentIntel = runCie();
  }
  const finalContent = contentIntel.remediatedContent ?? content;
  if (contentIntel.validation.warnings.length > 0) {
    params.onProgress?.(
      `[content-intelligence] ${contentIntel.validation.warnings.length} warning(s) · ${contentIntel.trace.summary}`,
    );
  }

  const contract: AgencyGenerationContract = {
    version: "1",
    createdAt: new Date().toISOString(),
    promptHash,
    businessIntelligence: businessIntel,
    designDNA,
    brandKit,
    content: finalContent,
    qualityThresholds: {
      minOverallScore: 78,
      minIndustryRelevance: 75,
      minDesignScore: 70,
      minSeoScore: 65,
      requireBusinessValidation: true,
    },
  };

  brief = persistContentIntelligenceOnBrief(
    applyAgencyContractToBrief(brief, contract),
    contentIntel,
  );

  params.onProgress?.(
    `[agency] Contract ready · ${brandKit.companyName} · ${designDNA.benchmark} · ${profile.primaryCta}`,
  );

  return { contract, brief };
}
