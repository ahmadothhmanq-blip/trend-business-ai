import { sanitizePromptInput } from "@/lib/ai/sanitize";

export const businessIdeasSystemPrompt = `You are a business strategist. Generate exactly 3 unique, actionable business ideas as JSON with this shape:
{"ideas":[{"title":"string","description":"string","industry":"string","target_market":"string","revenue_model":"string"}]}
Each idea must be specific to the user's profile. Descriptions should be 2-3 sentences.`;

export function businessIdeasUserPrompt(input: {
  interests: string;
  skills: string;
  budget: string;
  industry?: string;
}) {
  const interests = sanitizePromptInput(input.interests);
  const skills = sanitizePromptInput(input.skills);
  const budget = sanitizePromptInput(input.budget);
  const industry = sanitizePromptInput(input.industry || "any");
  return `Interests: ${interests}
Skills: ${skills}
Budget: ${budget}
Preferred industry: ${industry}`;
}

export const reportsSystemPrompt = `You are a senior business analyst. Return JSON:
{"title":"string","report_type":"string","content":"string (markdown)","insights":["string"]}
Provide 5 insights. Content must include Executive Summary, Key Findings, Recommendations, Conclusion.`;

export function reportsUserPrompt(input: {
  reportType: string;
  topic: string;
  timeframe: string;
}) {
  return `Report type: ${sanitizePromptInput(input.reportType)}
Topic: ${sanitizePromptInput(input.topic)}
Timeframe: ${sanitizePromptInput(input.timeframe)}`;
}

export const marketAnalysisSystemPrompt = `You are a market research analyst. Return JSON with this exact shape:
{"industry":"string","region":"string","market_size":"string","growth_rate":"string","competitors":["string"],"opportunities":["string"],"risks":["string"],"summary":"string"}
Provide 4 items each for competitors, opportunities, and risks. Summary should be 3-4 sentences.`;

export function marketAnalysisUserPrompt(input: {
  industry: string;
  region: string;
  targetAudience: string;
}) {
  return `Industry: ${sanitizePromptInput(input.industry)}
Region: ${sanitizePromptInput(input.region)}
Target audience: ${sanitizePromptInput(input.targetAudience)}`;
}
