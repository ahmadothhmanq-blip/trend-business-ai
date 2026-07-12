import {
  BarChart3,
  BriefcaseBusiness,
  Clapperboard,
  Megaphone,
  Palette,
  PenLine,
  SearchCheck,
  Smartphone,
} from "lucide-react";
import type { AIWorkspaceConfig } from "@/lib/workspace/metadata";

export const AI_WORKSPACES = {
  brandDesigner: {
    title: "AI Brand Designer",
    eyebrow: "Brand System",
    description:
      "Create premium logo directions, brand positioning, colors, typography and identity systems for a business that needs to look credible from day one.",
    icon: Palette,
    promptLabel: "Brand brief",
    promptPlaceholder:
      "Describe the company name, target audience, visual style, competitors, personality and where the brand will be used.",
    generateLabel: "Generate Brand Kit",
    templates: ["Luxury logo system", "Startup brand identity", "Premium product launch"],
    recentProjects: ["Executive consulting identity", "Gold-label ecommerce brand", "AI SaaS launch kit"],
    outputs: ["Logo direction", "Color palette", "Typography system", "Brand voice", "Launch assets"],
    metrics: [
      { label: "Brand Assets", value: "24" },
      { label: "Templates", value: "12" },
      { label: "Exports", value: "PDF" },
      { label: "Quality", value: "Pro" },
    ],
  },
  creativeStudio: {
    title: "AI Creative Studio",
    eyebrow: "Visual Production",
    description:
      "Plan polished image concepts, video storyboards, creative directions and production-ready campaign visuals for modern digital brands.",
    icon: Clapperboard,
    promptLabel: "Creative brief",
    promptPlaceholder:
      "Describe the product, scene, visual mood, platform, audience, format and campaign objective.",
    generateLabel: "Generate Creative",
    templates: ["Product image concept", "Short-form video storyboard", "Launch campaign visuals"],
    recentProjects: ["Luxury skincare product scenes", "Founder announcement reel", "Black-gold SaaS hero visuals"],
    outputs: ["Image prompts", "Video storyboard", "Shot list", "Creative direction", "Production notes"],
    metrics: [
      { label: "Concepts", value: "36" },
      { label: "Formats", value: "9:16" },
      { label: "Exports", value: "Brief" },
      { label: "Style", value: "3D" },
    ],
  },
  contentStudio: {
    title: "AI Content Studio",
    eyebrow: "Editorial Engine",
    description:
      "Generate professional captions, hooks, articles, reports, launch calendars and content systems aligned to a premium business strategy.",
    icon: PenLine,
    promptLabel: "Content brief",
    promptPlaceholder:
      "Describe your audience, offer, channel, tone, content goal and the exact format you want to create.",
    generateLabel: "Generate Content",
    templates: ["30-day content calendar", "Executive thought leadership", "Launch caption suite"],
    recentProjects: ["LinkedIn founder posts", "Premium launch email sequence", "Instagram carousel plan"],
    outputs: ["Hooks", "Captions", "Calendar", "Report outline", "Channel plan"],
    metrics: [
      { label: "Drafts", value: "58" },
      { label: "Channels", value: "7" },
      { label: "Exports", value: "MD" },
      { label: "Tone", value: "Pro" },
    ],
  },
  businessIntelligence: {
    title: "AI Business Intelligence",
    eyebrow: "Market Intelligence",
    description:
      "Turn market context into competitor maps, demand signals, risk analysis, growth insights and decision-ready business intelligence.",
    icon: BarChart3,
    promptLabel: "Analysis brief",
    promptPlaceholder:
      "Describe the market, geography, business model, customer segment, competitors and the decision you need to make.",
    generateLabel: "Generate Intelligence",
    templates: ["Market opportunity scan", "Competitor intelligence", "Business feasibility study"],
    recentProjects: ["GCC ecommerce feasibility", "AI agency competitor map", "Restaurant expansion analysis"],
    outputs: ["Market signals", "Competitor map", "Risk matrix", "Revenue assumptions", "Executive summary"],
    metrics: [
      { label: "Reports", value: "18" },
      { label: "Signals", value: "142" },
      { label: "Exports", value: "PDF" },
      { label: "Depth", value: "Deep" },
    ],
  },
  businessManager: {
    title: "AI Business Manager",
    eyebrow: "Execution System",
    description:
      "Convert strategy into priorities, roadmaps, kanban workflows, operating plans and execution dashboards for growing teams.",
    icon: BriefcaseBusiness,
    promptLabel: "Management brief",
    promptPlaceholder:
      "Describe the business goal, timeline, team, constraints, deliverables and current blockers.",
    generateLabel: "Generate Roadmap",
    templates: ["90-day execution plan", "Project kanban system", "Operations dashboard"],
    recentProjects: ["Agency onboarding roadmap", "MVP launch sprint", "Sales operations workflow"],
    outputs: ["Milestones", "Task board", "Owner matrix", "Timeline", "Risk controls"],
    metrics: [
      { label: "Roadmaps", value: "11" },
      { label: "Tasks", value: "96" },
      { label: "Exports", value: "CSV" },
      { label: "Mode", value: "Ops" },
    ],
  },
  marketing: {
    title: "AI Marketing",
    eyebrow: "Growth Engine",
    description:
      "Build ad angles, campaign structures, landing page messages, offers, funnels and performance-ready marketing plans.",
    icon: Megaphone,
    promptLabel: "Campaign brief",
    promptPlaceholder:
      "Describe the offer, target audience, platform, budget, conversion goal, objections and brand tone.",
    generateLabel: "Generate Campaign",
    templates: ["Meta Ads campaign", "Google Ads campaign", "Full-funnel launch plan"],
    recentProjects: ["B2B SaaS lead funnel", "Premium course launch", "Local services retargeting plan"],
    outputs: ["Campaign angles", "Ad copy", "Audience segments", "Offer strategy", "Landing page sections"],
    metrics: [
      { label: "Campaigns", value: "27" },
      { label: "Angles", value: "84" },
      { label: "Exports", value: "Brief" },
      { label: "Focus", value: "ROI" },
    ],
  },
  socialMedia: {
    title: "AI Social Media",
    eyebrow: "Social Growth",
    description:
      "Plan platform-native content, analyze Instagram and Facebook positioning, and create growth actions for premium social channels.",
    icon: Smartphone,
    promptLabel: "Social brief",
    promptPlaceholder:
      "Describe the social profile, audience, competitors, best posts, weak spots and the growth target.",
    generateLabel: "Generate Social Plan",
    templates: ["Instagram growth audit", "Facebook content plan", "TikTok content dashboard"],
    recentProjects: ["Luxury clinic Instagram audit", "Restaurant content calendar", "Founder TikTok positioning"],
    outputs: ["Profile audit", "Content pillars", "Posting calendar", "Engagement actions", "Growth experiments"],
    metrics: [
      { label: "Profiles", value: "14" },
      { label: "Posts", value: "120" },
      { label: "Exports", value: "CSV" },
      { label: "Trend", value: "+18%" },
    ],
  },
  businessAudit: {
    title: "AI Business Audit",
    eyebrow: "Readiness Audit",
    description:
      "Audit a business idea, offer, website, funnel or operation to uncover gaps, risks, quick wins and priority improvements.",
    icon: SearchCheck,
    promptLabel: "Audit brief",
    promptPlaceholder:
      "Describe the business, current assets, goal, performance concerns, audience and what you want audited.",
    generateLabel: "Generate Audit",
    templates: ["Website conversion audit", "Business model audit", "Launch readiness audit"],
    recentProjects: ["Coaching funnel audit", "Marketplace readiness review", "SaaS landing page audit"],
    outputs: ["Scorecard", "Risk list", "Quick wins", "Priority roadmap", "Executive recommendations"],
    metrics: [
      { label: "Audits", value: "9" },
      { label: "Checks", value: "42" },
      { label: "Exports", value: "PDF" },
      { label: "Score", value: "A-" },
    ],
  },
} satisfies Record<string, AIWorkspaceConfig>;
