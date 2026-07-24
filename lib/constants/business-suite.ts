import {
  BarChart3,
  BookOpen,
  Brain,
  Briefcase,
  Building2,
  ChartLine,
  ClipboardList,
  Compass,
  DollarSign,
  FileBarChart,
  Layers,
  LayoutDashboard,
  Lightbulb,
  LineChart,
  Megaphone,
  Radar,
  Scale,
  Search,
  Shield,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  BUSINESS TOOLS                                                     */
/* ------------------------------------------------------------------ */

export type BusinessToolDefinition = {
  id: string;

  labelKey?: string;

  descriptionKey?: string;
  label: string;
  description: string;
  icon: LucideIcon;
  defaultOptions: string[];
};

export const BUSINESS_TOOLS: BusinessToolDefinition[] = [
  { id: "business-dashboard", labelKey: "constants.businessSuite.options.business_dashboard", label: "Business Dashboard", description: "Overview of all business metrics", icon: LayoutDashboard, defaultOptions: ["kpis", "summary"] },
  { id: "business-intelligence", labelKey: "constants.businessSuite.options.business_intelligence", label: "Business Intelligence", description: "Data-driven insights and analytics", icon: BarChart3, defaultOptions: ["analysis", "trends", "recommendations"] },
  { id: "business-plan", labelKey: "constants.businessSuite.options.business_plan", label: "Business Plan Generator", description: "Complete business plan documents", icon: BookOpen, defaultOptions: ["executive-summary", "financials", "market-analysis", "operations"] },
  { id: "business-model-canvas", labelKey: "constants.businessSuite.options.business_model_canvas", label: "Business Model Canvas", description: "Visual business model framework", icon: Layers, defaultOptions: ["value-proposition", "revenue-streams", "cost-structure"] },
  { id: "swot-analysis", labelKey: "constants.businessSuite.options.swot_analysis", label: "SWOT Analysis", description: "Strengths, weaknesses, opportunities, threats", icon: Shield, defaultOptions: ["scoring", "action-plan"] },
  { id: "market-research", labelKey: "constants.businessSuite.options.market_research", label: "Market Research", description: "Comprehensive market analysis", icon: Search, defaultOptions: ["market-size", "trends", "segmentation", "forecast"] },
  { id: "competitor-analysis", labelKey: "constants.businessSuite.options.competitor_analysis", label: "Competitor Analysis", description: "Competitive landscape assessment", icon: Radar, defaultOptions: ["positioning", "pricing", "strengths-weaknesses"] },
  { id: "customer-persona", labelKey: "constants.businessSuite.options.customer_persona", label: "Customer Persona Builder", description: "Detailed customer profiles", icon: Users, defaultOptions: ["demographics", "psychographics", "pain-points", "goals"] },
  { id: "pricing-strategy", labelKey: "constants.businessSuite.options.pricing_strategy", label: "Pricing Strategy", description: "Optimal pricing framework", icon: DollarSign, defaultOptions: ["analysis", "tiers", "competitive-pricing"] },
  { id: "revenue-forecast", labelKey: "constants.businessSuite.options.revenue_forecast", label: "Revenue Forecast", description: "Financial projections and modeling", icon: TrendingUp, defaultOptions: ["projections", "scenarios", "assumptions"] },
  { id: "financial-planning", labelKey: "constants.businessSuite.options.financial_planning", label: "Financial Planning", description: "Budget, cash flow, and P&L planning", icon: ChartLine, defaultOptions: ["budget", "cash-flow", "profit-loss", "break-even"] },
  { id: "marketing-strategy", labelKey: "constants.businessSuite.options.marketing_strategy", label: "Marketing Strategy", description: "Go-to-market and growth marketing", icon: Megaphone, defaultOptions: ["channels", "messaging", "budget", "timeline"] },
  { id: "sales-strategy", labelKey: "constants.businessSuite.options.sales_strategy", label: "Sales Strategy", description: "Sales process and pipeline design", icon: Target, defaultOptions: ["funnel", "process", "targets", "incentives"] },
  { id: "growth-planner", labelKey: "constants.businessSuite.options.growth_planner", label: "Growth Planner", description: "Scaling strategy and milestones", icon: Compass, defaultOptions: ["milestones", "metrics", "roadmap"] },
  { id: "kpi-dashboard", labelKey: "constants.businessSuite.options.kpi_dashboard", label: "KPI Dashboard", description: "Key performance indicator framework", icon: LineChart, defaultOptions: ["metrics", "targets", "tracking"] },
  { id: "business-reports", labelKey: "constants.businessSuite.options.business_reports", label: "Business Reports", description: "Professional business documents", icon: FileBarChart, defaultOptions: ["executive-summary", "data-analysis", "recommendations"] },
  { id: "executive-summary", labelKey: "constants.businessSuite.options.executive_summary", label: "Executive Summary", description: "Concise leadership briefings", icon: ClipboardList, defaultOptions: ["highlights", "decisions", "next-steps"] },
  { id: "ai-consultant", labelKey: "constants.businessSuite.options.ai_consultant", label: "AI Business Consultant", description: "Strategic advice and recommendations", icon: Brain, defaultOptions: ["analysis", "recommendations", "risk-assessment", "action-plan"] },
];

/* ------------------------------------------------------------------ */
/*  BUSINESS TYPES                                                     */
/* ------------------------------------------------------------------ */

export type BusinessTypeDefinition = {
  id: string;

  labelKey?: string;

  descriptionKey?: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const BUSINESS_TYPES: BusinessTypeDefinition[] = [
  { id: "startup", labelKey: "constants.businessSuite.options.startup", label: "Startup", description: "Early-stage venture", icon: Lightbulb },
  { id: "small-business", labelKey: "constants.businessSuite.options.small_business", label: "Small Business", description: "Local or small-scale business", icon: Building2 },
  { id: "enterprise", labelKey: "constants.businessSuite.options.enterprise", label: "Enterprise", description: "Large-scale corporation", icon: Briefcase },
  { id: "ecommerce", labelKey: "constants.businessSuite.options.ecommerce", label: "E-Commerce", description: "Online retail business", icon: DollarSign },
  { id: "saas", labelKey: "constants.businessSuite.options.saas", label: "SaaS", description: "Software as a service", icon: Layers },
  { id: "agency", labelKey: "constants.businessSuite.options.agency", label: "Agency", description: "Service-based agency", icon: Users },
  { id: "marketplace", labelKey: "constants.businessSuite.options.marketplace", label: "Marketplace", description: "Two-sided platform", icon: Scale },
  { id: "consulting", labelKey: "constants.businessSuite.options.consulting", label: "Consulting", description: "Professional consultancy", icon: Brain },
  { id: "franchise", labelKey: "constants.businessSuite.options.franchise", label: "Franchise", description: "Franchise operation", icon: Building2 },
  { id: "nonprofit", labelKey: "constants.businessSuite.options.nonprofit", label: "Nonprofit", description: "Mission-driven organization", icon: Target },
  { id: "custom", labelKey: "constants.businessSuite.options.custom", label: "Custom", description: "Define your own type", icon: Compass },
];

/* ------------------------------------------------------------------ */
/*  OPTIONS                                                            */
/* ------------------------------------------------------------------ */

export const COMPANY_STAGES = [
  "Idea", "Pre-Seed", "Seed", "Startup", "Growth", "Scale-Up", "Mature", "Enterprise",
] as const;

export const BUSINESS_INDUSTRIES = [
  "Technology", "Healthcare", "Finance", "Education", "E-Commerce",
  "Real Estate", "Manufacturing", "Food & Beverage", "Media & Entertainment",
  "Travel & Hospitality", "Automotive", "Energy", "Agriculture",
  "Legal", "Construction", "Retail", "Logistics", "Telecom", "Other",
] as const;

export const BUSINESS_OPTION_LIST: { id: string; labelKey?: string; label: string; category: string }[] = [
  { id: "executive-summary", labelKey: "constants.businessSuite.options.executive_summary", label: "Executive Summary", category: "Report" },
  { id: "financials", labelKey: "constants.businessSuite.options.financials", label: "Financial Projections", category: "Report" },
  { id: "market-analysis", labelKey: "constants.businessSuite.options.market_analysis", label: "Market Analysis", category: "Analysis" },
  { id: "operations", labelKey: "constants.businessSuite.options.operations", label: "Operations Plan", category: "Report" },
  { id: "analysis", labelKey: "constants.businessSuite.options.analysis", label: "Deep Analysis", category: "Analysis" },
  { id: "trends", labelKey: "constants.businessSuite.options.trends", label: "Trend Analysis", category: "Analysis" },
  { id: "recommendations", labelKey: "constants.businessSuite.options.recommendations", label: "AI Recommendations", category: "AI" },
  { id: "risk-assessment", labelKey: "constants.businessSuite.options.risk_assessment", label: "Risk Assessment", category: "AI" },
  { id: "action-plan", labelKey: "constants.businessSuite.options.action_plan", label: "Action Plan", category: "AI" },
  { id: "scoring", labelKey: "constants.businessSuite.options.scoring", label: "Business Scoring", category: "AI" },
  { id: "kpis", labelKey: "constants.businessSuite.options.kpis", label: "KPI Framework", category: "Metrics" },
  { id: "summary", labelKey: "constants.businessSuite.options.summary", label: "Summary Report", category: "Report" },
  { id: "value-proposition", labelKey: "constants.businessSuite.options.value_proposition", label: "Value Proposition", category: "Strategy" },
  { id: "revenue-streams", labelKey: "constants.businessSuite.options.revenue_streams", label: "Revenue Streams", category: "Strategy" },
  { id: "cost-structure", labelKey: "constants.businessSuite.options.cost_structure", label: "Cost Structure", category: "Strategy" },
  { id: "positioning", labelKey: "constants.businessSuite.options.positioning", label: "Market Positioning", category: "Strategy" },
  { id: "pricing", labelKey: "constants.businessSuite.options.pricing", label: "Pricing Analysis", category: "Strategy" },
  { id: "strengths-weaknesses", labelKey: "constants.businessSuite.options.strengths_weaknesses", label: "Strengths & Weaknesses", category: "Analysis" },
  { id: "market-size", labelKey: "constants.businessSuite.options.market_size", label: "Market Size", category: "Analysis" },
  { id: "segmentation", labelKey: "constants.businessSuite.options.segmentation", label: "Segmentation", category: "Analysis" },
  { id: "forecast", labelKey: "constants.businessSuite.options.forecast", label: "Forecast", category: "Metrics" },
  { id: "demographics", labelKey: "constants.businessSuite.options.demographics", label: "Demographics", category: "Audience" },
  { id: "psychographics", labelKey: "constants.businessSuite.options.psychographics", label: "Psychographics", category: "Audience" },
  { id: "pain-points", labelKey: "constants.businessSuite.options.pain_points", label: "Pain Points", category: "Audience" },
  { id: "goals", labelKey: "constants.businessSuite.options.goals", label: "Goals & Motivations", category: "Audience" },
  { id: "tiers", labelKey: "constants.businessSuite.options.tiers", label: "Pricing Tiers", category: "Strategy" },
  { id: "competitive-pricing", labelKey: "constants.businessSuite.options.competitive_pricing", label: "Competitive Pricing", category: "Strategy" },
  { id: "projections", labelKey: "constants.businessSuite.options.projections", label: "Revenue Projections", category: "Metrics" },
  { id: "scenarios", labelKey: "constants.businessSuite.options.scenarios", label: "Scenarios (Best/Worst/Expected)", category: "Metrics" },
  { id: "assumptions", labelKey: "constants.businessSuite.options.assumptions", label: "Key Assumptions", category: "Report" },
  { id: "budget", labelKey: "constants.businessSuite.options.budget", label: "Budget Plan", category: "Metrics" },
  { id: "cash-flow", labelKey: "constants.businessSuite.options.cash_flow", label: "Cash Flow Analysis", category: "Metrics" },
  { id: "profit-loss", labelKey: "constants.businessSuite.options.profit_loss", label: "Profit & Loss", category: "Metrics" },
  { id: "break-even", labelKey: "constants.businessSuite.options.break_even", label: "Break-Even Analysis", category: "Metrics" },
  { id: "channels", labelKey: "constants.businessSuite.options.channels", label: "Channel Strategy", category: "Strategy" },
  { id: "messaging", labelKey: "constants.businessSuite.options.messaging", label: "Messaging Framework", category: "Strategy" },
  { id: "timeline", labelKey: "constants.businessSuite.options.timeline", label: "Timeline", category: "Report" },
  { id: "funnel", labelKey: "constants.businessSuite.options.funnel", label: "Sales Funnel", category: "Strategy" },
  { id: "process", labelKey: "constants.businessSuite.options.process", label: "Sales Process", category: "Strategy" },
  { id: "targets", labelKey: "constants.businessSuite.options.targets", label: "Targets & Goals", category: "Metrics" },
  { id: "incentives", labelKey: "constants.businessSuite.options.incentives", label: "Incentive Structure", category: "Strategy" },
  { id: "milestones", labelKey: "constants.businessSuite.options.milestones", label: "Milestones", category: "Report" },
  { id: "metrics", labelKey: "constants.businessSuite.options.metrics", label: "Key Metrics", category: "Metrics" },
  { id: "roadmap", labelKey: "constants.businessSuite.options.roadmap", label: "Growth Roadmap", category: "Report" },
  { id: "tracking", labelKey: "constants.businessSuite.options.tracking", label: "Performance Tracking", category: "Metrics" },
  { id: "data-analysis", labelKey: "constants.businessSuite.options.data_analysis", label: "Data Analysis", category: "Analysis" },
  { id: "highlights", labelKey: "constants.businessSuite.options.highlights", label: "Key Highlights", category: "Report" },
  { id: "decisions", labelKey: "constants.businessSuite.options.decisions", label: "Decision Points", category: "Report" },
  { id: "next-steps", labelKey: "constants.businessSuite.options.next_steps", label: "Next Steps", category: "Report" },
];

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

export function getBusinessTool(id: string) {
  return BUSINESS_TOOLS.find((t) => t.id === id);
}

export function getBusinessToolLabel(id: string) {
  return getBusinessTool(id)?.label ?? id;
}

export function getBusinessType(id: string) {
  return BUSINESS_TYPES.find((t) => t.id === id);
}

export function getBusinessTypeLabel(id: string) {
  return getBusinessType(id)?.label ?? id;
}
