import type { BusinessPluginInput } from "@/plugins/business-suite/types";

function getToolContext(tool: string): string {
  const ctx: Record<string, string> = {
    "business-dashboard": "Create a comprehensive business overview with key metrics, health indicators, and executive insights.",
    "business-intelligence": "Perform data-driven business intelligence analysis with actionable insights, market trends, and strategic recommendations.",
    "business-plan": "Write a complete business plan document including executive summary, company description, market analysis, organization, products/services, marketing strategy, financial projections, and appendix.",
    "business-model-canvas": "Create a Business Model Canvas covering: Customer Segments, Value Propositions, Channels, Customer Relationships, Revenue Streams, Key Resources, Key Activities, Key Partnerships, and Cost Structure.",
    "swot-analysis": "Perform a detailed SWOT Analysis: Strengths (internal advantages), Weaknesses (internal limitations), Opportunities (external possibilities), Threats (external risks). Score each and provide an action plan.",
    "market-research": "Conduct comprehensive market research: market size (TAM/SAM/SOM), growth trends, segmentation, customer behavior, regulatory landscape, and market forecast.",
    "competitor-analysis": "Analyze the competitive landscape: identify key competitors, analyze their strengths/weaknesses, market positioning, pricing, features, market share, and strategic advantages.",
    "customer-persona": "Build detailed customer personas: demographics, psychographics, behavior patterns, goals, pain points, objections, preferred channels, buying journey, and decision factors.",
    "pricing-strategy": "Develop a pricing strategy: cost analysis, value-based pricing, competitive pricing analysis, pricing tiers, psychological pricing, and revenue optimization.",
    "revenue-forecast": "Create revenue projections: best/expected/worst case scenarios, growth assumptions, revenue streams, unit economics, and sensitivity analysis.",
    "financial-planning": "Develop a financial plan: budget allocation, cash flow projections, P&L forecast, break-even analysis, key financial metrics, and funding requirements.",
    "marketing-strategy": "Create a go-to-market strategy: target audience, positioning, messaging, channel strategy, content plan, budget allocation, timeline, and KPIs.",
    "sales-strategy": "Design a sales strategy: sales process, funnel stages, pipeline management, team structure, compensation, targets, tools, and performance metrics.",
    "growth-planner": "Plan a growth strategy: growth levers, milestone roadmap, scaling challenges, team growth, infrastructure needs, and key metrics to track.",
    "kpi-dashboard": "Define a KPI framework: identify key metrics for each department, set targets, define measurement methods, create tracking cadence, and alert thresholds.",
    "business-reports": "Generate a professional business report: executive summary, data analysis, key findings, visualizations, recommendations, and next steps.",
    "executive-summary": "Write a concise executive summary: business highlights, key decisions, financial overview, strategic priorities, risks, and recommended actions.",
    "ai-consultant": "Provide AI-powered strategic business consulting: analyze the business situation, identify challenges, recommend solutions, assess risks, and create a prioritized action plan.",
  };
  return ctx[tool] ?? "Provide professional business analysis and recommendations.";
}

export function businessAnalyzePrompt(input: BusinessPluginInput): string {
  return `You are a senior management consultant at a top-tier firm. Analyze this business brief.

Business Tool: ${input.businessTool}
Business Type: ${input.businessType}
Industry: ${input.industry}
Company Stage: ${input.companyStage}
Target Market: ${input.targetMarket}
Prompt: ${input.prompt}
Options: ${input.options.join(", ") || "Standard analysis"}

Context: ${getToolContext(input.businessTool)}

Produce a JSON object with:
- title: compelling title for this analysis/document
- businessContext: business context summary (2-3 sentences)
- industryInsights: key industry observations
- mainChallenges: array of 3-5 primary challenges
- keyQuestions: array of 3-5 strategic questions to address
- analysisScope: what the analysis should cover
- urgencyLevel: urgency assessment (low/medium/high)

Return ONLY valid JSON.`;
}

export function businessPlanPrompt(input: BusinessPluginInput, analysis: { title: string; businessContext: string; mainChallenges: string[]; keyQuestions: string[]; analysisScope: string }): string {
  return `You are a strategy consultant. Plan the structure for this ${input.businessTool} analysis.

Title: ${analysis.title}
Context: ${analysis.businessContext}
Industry: ${input.industry}
Stage: ${input.companyStage}
Target Market: ${input.targetMarket}
Challenges: ${analysis.mainChallenges.join("; ")}
Questions: ${analysis.keyQuestions.join("; ")}
Scope: ${analysis.analysisScope}
Options: ${input.options.join(", ")}

Context: ${getToolContext(input.businessTool)}

Create a JSON object with:
- sections: array of document sections, each with:
  - heading: section heading
  - purpose: what this section delivers
  - keyPoints: array of points to cover
- scorecardMetrics: array of metric names to score (e.g. "viability", "market-fit")
- riskCategories: array of risk categories to assess
- opportunityAreas: array of opportunity areas to explore

Return ONLY valid JSON.`;
}

export function businessGeneratePrompt(
  input: BusinessPluginInput,
  analysis: { title: string; businessContext: string; mainChallenges: string[]; keyQuestions: string[]; industryInsights: string },
  plan: { sections: { heading: string; purpose: string; keyPoints: string[] }[] },
): string {
  const sectionGuide = plan.sections
    .map((s, i) => `${i + 1}. ${s.heading} — ${s.purpose}\n   Cover: ${s.keyPoints.join(", ")}`)
    .join("\n");

  return `You are a world-class business strategist. Write a complete, professional ${input.businessTool} document.

Title: ${analysis.title}
Business Type: ${input.businessType}
Industry: ${input.industry}
Company Stage: ${input.companyStage}
Target Market: ${input.targetMarket}
Context: ${analysis.businessContext}
Industry Insights: ${analysis.industryInsights}
Key Challenges: ${analysis.mainChallenges.join("; ")}
Strategic Questions: ${analysis.keyQuestions.join("; ")}

Document Structure:
${sectionGuide}

Context: ${getToolContext(input.businessTool)}

RULES:
- Write professionally with data-backed insights
- Use markdown formatting with clear headings
- Include specific, actionable recommendations
- Provide quantitative estimates where appropriate
- Be thorough but concise — executive-friendly language
- Include tables for comparisons where relevant (markdown tables)
- End each section with key takeaways

Write 1000-4000 words depending on the document type. Return ONLY the document text — no JSON wrapper.`;
}

export function businessScorecardPrompt(body: string, businessType: string, industry: string): string {
  return `You are a business analyst. Score this ${businessType} business in the ${industry} industry.

Document excerpt:
${body.slice(0, 5000)}

Create a JSON object with:
- overall: overall business score (0-100)
- viability: business viability score (0-100)
- marketFit: product-market fit score (0-100)
- financialHealth: financial health score (0-100)
- competitivePosition: competitive position score (0-100)
- growthPotential: growth potential score (0-100)
- riskLevel: risk level score (0-100, where 100 = highest risk)

Return ONLY valid JSON.`;
}

export function businessRisksPrompt(body: string, businessType: string): string {
  return `Identify business risks for this ${businessType} business.

Document excerpt:
${body.slice(0, 4000)}

Create a JSON object with:
- risks: array of 4-6 risks, each with:
  - category: risk category (Market, Financial, Operational, Legal, Technical, Competitive)
  - description: risk description
  - severity: "low" | "medium" | "high" | "critical"
  - mitigation: mitigation strategy
- opportunities: array of 3-5 opportunities, each with:
  - title: opportunity name
  - description: opportunity description
  - impact: "low" | "medium" | "high"
  - timeframe: expected timeframe
  - actionRequired: what action to take

Return ONLY valid JSON.`;
}

export function businessActionPlanPrompt(body: string, risks: string, opportunities: string): string {
  return `Create a prioritized action plan based on this business analysis.

Analysis excerpt:
${body.slice(0, 3000)}

Risks: ${risks}
Opportunities: ${opportunities}

Create a JSON object with:
- actionPlan: array of 5-8 action items, each with:
  - action: specific action to take
  - priority: "low" | "medium" | "high" | "urgent"
  - owner: suggested responsible role
  - deadline: suggested timeline
  - status: "pending"
- recommendations: array of 3-5 strategic recommendations (strings)
- improvements: array of 3-5 improvement suggestions (strings)

Return ONLY valid JSON.`;
}
