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
  label: string;
  description: string;
  icon: LucideIcon;
  defaultOptions: string[];
};

export const BUSINESS_TOOLS: BusinessToolDefinition[] = [
  { id: "business-dashboard", label: "Business Dashboard", description: "Overview of all business metrics", icon: LayoutDashboard, defaultOptions: ["kpis", "summary"] },
  { id: "business-intelligence", label: "Business Intelligence", description: "Data-driven insights and analytics", icon: BarChart3, defaultOptions: ["analysis", "trends", "recommendations"] },
  { id: "business-plan", label: "Business Plan Generator", description: "Complete business plan documents", icon: BookOpen, defaultOptions: ["executive-summary", "financials", "market-analysis", "operations"] },
  { id: "business-model-canvas", label: "Business Model Canvas", description: "Visual business model framework", icon: Layers, defaultOptions: ["value-proposition", "revenue-streams", "cost-structure"] },
  { id: "swot-analysis", label: "SWOT Analysis", description: "Strengths, weaknesses, opportunities, threats", icon: Shield, defaultOptions: ["scoring", "action-plan"] },
  { id: "market-research", label: "Market Research", description: "Comprehensive market analysis", icon: Search, defaultOptions: ["market-size", "trends", "segmentation", "forecast"] },
  { id: "competitor-analysis", label: "Competitor Analysis", description: "Competitive landscape assessment", icon: Radar, defaultOptions: ["positioning", "pricing", "strengths-weaknesses"] },
  { id: "customer-persona", label: "Customer Persona Builder", description: "Detailed customer profiles", icon: Users, defaultOptions: ["demographics", "psychographics", "pain-points", "goals"] },
  { id: "pricing-strategy", label: "Pricing Strategy", description: "Optimal pricing framework", icon: DollarSign, defaultOptions: ["analysis", "tiers", "competitive-pricing"] },
  { id: "revenue-forecast", label: "Revenue Forecast", description: "Financial projections and modeling", icon: TrendingUp, defaultOptions: ["projections", "scenarios", "assumptions"] },
  { id: "financial-planning", label: "Financial Planning", description: "Budget, cash flow, and P&L planning", icon: ChartLine, defaultOptions: ["budget", "cash-flow", "profit-loss", "break-even"] },
  { id: "marketing-strategy", label: "Marketing Strategy", description: "Go-to-market and growth marketing", icon: Megaphone, defaultOptions: ["channels", "messaging", "budget", "timeline"] },
  { id: "sales-strategy", label: "Sales Strategy", description: "Sales process and pipeline design", icon: Target, defaultOptions: ["funnel", "process", "targets", "incentives"] },
  { id: "growth-planner", label: "Growth Planner", description: "Scaling strategy and milestones", icon: Compass, defaultOptions: ["milestones", "metrics", "roadmap"] },
  { id: "kpi-dashboard", label: "KPI Dashboard", description: "Key performance indicator framework", icon: LineChart, defaultOptions: ["metrics", "targets", "tracking"] },
  { id: "business-reports", label: "Business Reports", description: "Professional business documents", icon: FileBarChart, defaultOptions: ["executive-summary", "data-analysis", "recommendations"] },
  { id: "executive-summary", label: "Executive Summary", description: "Concise leadership briefings", icon: ClipboardList, defaultOptions: ["highlights", "decisions", "next-steps"] },
  { id: "ai-consultant", label: "AI Business Consultant", description: "Strategic advice and recommendations", icon: Brain, defaultOptions: ["analysis", "recommendations", "risk-assessment", "action-plan"] },
];

/* ------------------------------------------------------------------ */
/*  BUSINESS TYPES                                                     */
/* ------------------------------------------------------------------ */

export type BusinessTypeDefinition = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const BUSINESS_TYPES: BusinessTypeDefinition[] = [
  { id: "startup", label: "Startup", description: "Early-stage venture", icon: Lightbulb },
  { id: "small-business", label: "Small Business", description: "Local or small-scale business", icon: Building2 },
  { id: "enterprise", label: "Enterprise", description: "Large-scale corporation", icon: Briefcase },
  { id: "ecommerce", label: "E-Commerce", description: "Online retail business", icon: DollarSign },
  { id: "saas", label: "SaaS", description: "Software as a service", icon: Layers },
  { id: "agency", label: "Agency", description: "Service-based agency", icon: Users },
  { id: "marketplace", label: "Marketplace", description: "Two-sided platform", icon: Scale },
  { id: "consulting", label: "Consulting", description: "Professional consultancy", icon: Brain },
  { id: "franchise", label: "Franchise", description: "Franchise operation", icon: Building2 },
  { id: "nonprofit", label: "Nonprofit", description: "Mission-driven organization", icon: Target },
  { id: "custom", label: "Custom", description: "Define your own type", icon: Compass },
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

export const BUSINESS_OPTION_LIST: { id: string; label: string; category: string }[] = [
  { id: "executive-summary", label: "Executive Summary", category: "Report" },
  { id: "financials", label: "Financial Projections", category: "Report" },
  { id: "market-analysis", label: "Market Analysis", category: "Analysis" },
  { id: "operations", label: "Operations Plan", category: "Report" },
  { id: "analysis", label: "Deep Analysis", category: "Analysis" },
  { id: "trends", label: "Trend Analysis", category: "Analysis" },
  { id: "recommendations", label: "AI Recommendations", category: "AI" },
  { id: "risk-assessment", label: "Risk Assessment", category: "AI" },
  { id: "action-plan", label: "Action Plan", category: "AI" },
  { id: "scoring", label: "Business Scoring", category: "AI" },
  { id: "kpis", label: "KPI Framework", category: "Metrics" },
  { id: "summary", label: "Summary Report", category: "Report" },
  { id: "value-proposition", label: "Value Proposition", category: "Strategy" },
  { id: "revenue-streams", label: "Revenue Streams", category: "Strategy" },
  { id: "cost-structure", label: "Cost Structure", category: "Strategy" },
  { id: "positioning", label: "Market Positioning", category: "Strategy" },
  { id: "pricing", label: "Pricing Analysis", category: "Strategy" },
  { id: "strengths-weaknesses", label: "Strengths & Weaknesses", category: "Analysis" },
  { id: "market-size", label: "Market Size", category: "Analysis" },
  { id: "segmentation", label: "Segmentation", category: "Analysis" },
  { id: "forecast", label: "Forecast", category: "Metrics" },
  { id: "demographics", label: "Demographics", category: "Audience" },
  { id: "psychographics", label: "Psychographics", category: "Audience" },
  { id: "pain-points", label: "Pain Points", category: "Audience" },
  { id: "goals", label: "Goals & Motivations", category: "Audience" },
  { id: "tiers", label: "Pricing Tiers", category: "Strategy" },
  { id: "competitive-pricing", label: "Competitive Pricing", category: "Strategy" },
  { id: "projections", label: "Revenue Projections", category: "Metrics" },
  { id: "scenarios", label: "Scenarios (Best/Worst/Expected)", category: "Metrics" },
  { id: "assumptions", label: "Key Assumptions", category: "Report" },
  { id: "budget", label: "Budget Plan", category: "Metrics" },
  { id: "cash-flow", label: "Cash Flow Analysis", category: "Metrics" },
  { id: "profit-loss", label: "Profit & Loss", category: "Metrics" },
  { id: "break-even", label: "Break-Even Analysis", category: "Metrics" },
  { id: "channels", label: "Channel Strategy", category: "Strategy" },
  { id: "messaging", label: "Messaging Framework", category: "Strategy" },
  { id: "timeline", label: "Timeline", category: "Report" },
  { id: "funnel", label: "Sales Funnel", category: "Strategy" },
  { id: "process", label: "Sales Process", category: "Strategy" },
  { id: "targets", label: "Targets & Goals", category: "Metrics" },
  { id: "incentives", label: "Incentive Structure", category: "Strategy" },
  { id: "milestones", label: "Milestones", category: "Report" },
  { id: "metrics", label: "Key Metrics", category: "Metrics" },
  { id: "roadmap", label: "Growth Roadmap", category: "Report" },
  { id: "tracking", label: "Performance Tracking", category: "Metrics" },
  { id: "data-analysis", label: "Data Analysis", category: "Analysis" },
  { id: "highlights", label: "Key Highlights", category: "Report" },
  { id: "decisions", label: "Decision Points", category: "Report" },
  { id: "next-steps", label: "Next Steps", category: "Report" },
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
