import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import type { CyberAssistantAction } from "@/types/cyber";

function parseJson<T>(raw: string): T {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned) as T;
}

const PROMPTS: Record<CyberAssistantAction, (input: { text: string; context?: string }) => string> = {
  analyze_posture: (i) => `Analyze security posture. Return JSON with score, strengths, gaps, priorities.\n\n${i.text}\n${i.context ?? ""}`,
  explain_threat: (i) => `Explain this threat for a SOC analyst. Return JSON with summary, impact, indicators, mitigations.\n\n${i.text}`,
  summarize_incident: (i) => `Summarize this security incident. Return JSON with timeline, impact, root cause, status.\n\n${i.text}\n${i.context ?? ""}`,
  recommend_remediation: (i) => `Recommend remediation steps. Return JSON with steps, priority, effort.\n\n${i.text}`,
  generate_security_report: (i) => `Generate executive security report. Return JSON with title, summary, sections, recommendations.\n\n${i.text}`,
  risk_assessment: (i) => `Perform risk assessment. Return JSON with riskScore, factors, mitigations.\n\n${i.text}\n${i.context ?? ""}`,
  compliance_recommendations: (i) => `Provide compliance recommendations (SOC2/ISO/GDPR). Return JSON with framework, gaps, actions.\n\n${i.text}`,
};

export async function runCyberAssistant(action: CyberAssistantAction, input: { text: string; context?: string }) {
  const providerName = getDefaultTextProvider();
  const resolved = providerManager.resolve(providerName);
  if (!resolved || !providerManager.isConfigured(resolved)) throw new Error("No AI provider configured.");
  const raw = await providerManager.generateText(
    { prompt: PROMPTS[action](input), system: "Return valid JSON only.", temperature: 0.5 },
    resolved,
  );
  return { ...parseJson<Record<string, unknown>>(raw), provider: resolved };
}
