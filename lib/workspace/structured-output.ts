import type {
  WorkspaceGenerationInput,
  WorkspaceOutput,
  WorkspaceType,
} from "@/lib/workspace/types";
import { getWorkspaceDefinition } from "@/lib/workspace/registry";

function extractTopic(brief: string) {
  const trimmed = brief.trim();
  if (!trimmed) return "your business";
  const firstSentence = trimmed.split(/[.!?\n]/)[0]?.trim() ?? trimmed;
  return firstSentence.length > 80 ? `${firstSentence.slice(0, 77)}...` : firstSentence;
}

function section(heading: string, content: string) {
  return { heading, content };
}

export function generateStructuredWorkspaceOutput(
  workspaceType: WorkspaceType,
  input: WorkspaceGenerationInput,
): WorkspaceOutput {
  const topic = extractTopic(input.prompt);
  const template = input.template?.trim() || "Executive production plan";
  const language = input.language?.trim() || "English";
  const theme = input.theme?.trim() || "Gold";
  const definition = getWorkspaceDefinition(workspaceType);
  const now = new Date().toISOString();

  const base = {
    generatedAt: now,
    source: "structured" as const,
    progressEvents: [
      "Analyzing...",
      "Planning...",
      "Generating...",
      "Validating...",
      "Exporting...",
      "Done.",
    ],
  };

  const builders: Record<WorkspaceType, () => WorkspaceOutput> = {
    brand: () => ({
      ...base,
      title: `${definition.metadata.label}: ${template}`,
      summary: `A premium brand system for ${topic}, designed with a ${theme.toLowerCase()} visual direction and ${language} market positioning.`,
      sections: [
        section(
          "Brand Positioning",
          `Position the brand as a credible, premium choice for ${topic}. Lead with authority, clarity and a distinctive black-and-gold executive aesthetic that signals trust on first impression.`,
        ),
        section(
          "Logo Direction",
          `Primary mark: refined wordmark with a minimal monogram accent. Secondary lockups for social avatars, favicon and app icon. Maintain generous spacing, high contrast and scalable geometry for digital and print use.`,
        ),
        section(
          "Color System",
          `Core palette: deep black foundations, warm gold highlights, soft neutral surfaces and restrained accent tones. Apply ${theme} as the hero accent across CTAs, dividers and premium highlights.`,
        ),
        section(
          "Typography",
          `Headings: modern geometric sans with strong weight contrast. Body: highly readable sans for long-form content. Use ${language} typography considerations for line length, numerals and RTL support where needed.`,
        ),
        section(
          "Brand Voice",
          `Tone: confident, polished and practical. Avoid hype. Write like a senior consultant: direct recommendations, measurable outcomes and language that fits executive buyers evaluating ${topic}.`,
        ),
      ],
      deliverables: [
        "Logo direction brief",
        "Color palette specification",
        "Typography pairing guide",
        "Brand voice guidelines",
        "Launch asset checklist",
      ],
    }),
    creative: () => ({
      ...base,
      title: `${definition.metadata.label}: ${template}`,
      summary: `Creative production plan for ${topic} with platform-ready visual direction, scene design and campaign-ready asset guidance.`,
      sections: [
        section(
          "Creative Concept",
          `Hero concept: premium cinematic scenes that frame ${topic} as desirable, high-trust and modern. Visual mood aligns with ${theme} accents, controlled lighting and clean product focus.`,
        ),
        section(
          "Visual Scenes",
          `Scene 1: flagship hero with bold headline space and product emphasis. Scene 2: lifestyle context showing real use. Scene 3: detail macro shots for texture and quality cues.`,
        ),
        section(
          "Video Storyboard",
          `15-second hook: problem → elevated solution → proof → CTA. 30-second version adds customer outcome and brand signature end frame. Include caption-safe zones for social placements.`,
        ),
        section(
          "Production Notes",
          `Shot list, lighting references, wardrobe/props guidance and export ratios for feed, story and paid placements. Keep compositions responsive-safe for cropping on mobile.`,
        ),
      ],
      deliverables: [
        "Creative direction deck",
        "Image concept prompts",
        "Video storyboard",
        "Shot list",
        "Channel export specs",
      ],
    }),
    content: () => ({
      ...base,
      title: `${definition.metadata.label}: ${template}`,
      summary: `Editorial content system for ${topic} with channel-specific messaging, hooks and a publish-ready calendar.`,
      sections: [
        section(
          "Content Strategy",
          `Anchor every piece of content around a clear promise for ${topic}: expertise, outcomes and credibility. Build a repeatable narrative across email, LinkedIn, Instagram and long-form articles.`,
        ),
        section(
          "Hooks Library",
          `1) The fastest way to improve results without adding complexity. 2) What high-performing teams do differently in ${topic}. 3) A practical framework you can apply this week.`,
        ),
        section(
          "Editorial Calendar",
          `Week 1: authority post + case insight. Week 2: objection-handling carousel. Week 3: founder POV article. Week 4: offer-led conversion post with social proof and CTA.`,
        ),
        section(
          "Channel Plan",
          `LinkedIn for executive reach, Instagram for visual proof, email for nurture and conversion. Localize tone for ${language} audiences while preserving premium brand consistency.`,
        ),
      ],
      deliverables: [
        "30-day content calendar",
        "Hook library",
        "Caption drafts",
        "Long-form article outline",
        "Channel distribution plan",
      ],
    }),
    business: () => ({
      ...base,
      title: `${definition.metadata.label}: ${template}`,
      summary: `Decision-ready intelligence on ${topic} with market signals, competitor context, risks and growth opportunities.`,
      sections: [
        section(
          "Executive Summary",
          `${topic} shows viable demand with room for differentiated positioning. Buyers prioritize trust, speed and measurable ROI. The strongest near-term wedge is a focused offer with premium presentation and clear onboarding.`,
        ),
        section(
          "Market Signals",
          `Demand is shifting toward AI-assisted workflows, faster execution and consolidated vendor relationships. Early adopters reward products that reduce operational friction while maintaining enterprise-grade polish.`,
        ),
        section(
          "Competitor Map",
          `Incumbents compete on breadth; challengers win with speed, UX and niche expertise. Differentiate ${topic} through vertical focus, superior onboarding and executive-ready reporting.`,
        ),
        section(
          "Risk Matrix",
          `Key risks: crowded messaging, long sales cycles, dependency on acquisition channels, and execution bandwidth. Mitigate with sharp positioning, proof assets and a phased rollout plan.`,
        ),
      ],
      deliverables: [
        "Executive summary",
        "Competitor map",
        "Opportunity brief",
        "Risk matrix",
        "Growth recommendations",
      ],
    }),
    manager: () => ({
      ...base,
      title: `${definition.metadata.label}: ${template}`,
      summary: `Operational roadmap for ${topic} with milestones, owners, priorities and an execution dashboard structure.`,
      sections: [
        section(
          "Strategic Objective",
          `Deliver a production launch for ${topic} with clear ownership, weekly accountability and measurable checkpoints across product, marketing and operations.`,
        ),
        section(
          "90-Day Roadmap",
          `Phase 1 (Days 1-30): foundation, offer validation, core assets. Phase 2 (Days 31-60): acquisition tests, onboarding optimization. Phase 3 (Days 61-90): scale winning channels and automate reporting.`,
        ),
        section(
          "Kanban Workflow",
          `Columns: Backlog, This Week, In Progress, Review, Done. WIP limits per owner. Daily standups for blockers. Weekly executive review for KPI movement and scope control.`,
        ),
        section(
          "Operating Dashboard",
          `Track pipeline, conversion, delivery SLA, support load and content throughput. Use a single source of truth for priorities and escalation rules.`,
        ),
      ],
      deliverables: [
        "90-day roadmap",
        "Milestone plan",
        "Owner matrix",
        "Kanban board structure",
        "Operations dashboard spec",
      ],
    }),
    marketing: () => ({
      ...base,
      title: `${definition.metadata.label}: ${template}`,
      summary: `Full-funnel marketing plan for ${topic} with campaign angles, audience segmentation and conversion-focused messaging.`,
      sections: [
        section(
          "Offer Strategy",
          `Lead with a high-trust premium offer for ${topic}: clear outcome, short time-to-value and risk reversal. Build ascending offers for trial, core package and annual commitment.`,
        ),
        section(
          "Campaign Angles",
          `Angle 1: Save time without sacrificing quality. Angle 2: Look enterprise-ready from day one. Angle 3: Replace fragmented tools with one polished workflow.`,
        ),
        section(
          "Audience Segments",
          `Primary: founders and operators seeking speed. Secondary: agencies packaging services for clients. Retargeting: visitors who engaged with pricing or case proof assets.`,
        ),
        section(
          "Landing Page Structure",
          `Hero promise, proof strip, feature pillars, workflow visuals, testimonials, pricing, FAQ and strong CTA. Maintain ${theme} accent hierarchy and mobile-first readability.`,
        ),
      ],
      deliverables: [
        "Campaign angle matrix",
        "Ad copy drafts",
        "Audience targeting plan",
        "Landing page section map",
        "Funnel measurement plan",
      ],
    }),
    social: () => ({
      ...base,
      title: `${definition.metadata.label}: ${template}`,
      summary: `Social growth plan for ${topic} with content pillars, posting cadence and engagement actions across priority platforms.`,
      sections: [
        section(
          "Profile Positioning",
          `Bio structure: who you help, outcome delivered, proof cue, CTA. Visual grid: consistent premium template with ${theme} accents, high contrast and clear category cues for ${topic}.`,
        ),
        section(
          "Content Pillars",
          `Educate (frameworks), Prove (results), Personify (founder POV), Promote (offer with value-first framing). Rotate pillars to avoid repetitive sales messaging.`,
        ),
        section(
          "Posting Calendar",
          `4 posts/week: 2 educational, 1 proof, 1 conversion-led. Batch creative on Mondays, schedule Wed/Fri peaks, engage daily for 20 minutes with target accounts.`,
        ),
        section(
          "Growth Experiments",
          `Test hook formats, carousel depth, short-form video captions, collaborative posts and DM lead magnets. Measure saves, profile visits and qualified inbound weekly.`,
        ),
      ],
      deliverables: [
        "Profile audit checklist",
        "Content pillar map",
        "Posting calendar",
        "Engagement playbook",
        "Growth experiment tracker",
      ],
    }),
    audit: () => ({
      ...base,
      title: `${definition.metadata.label}: ${template}`,
      summary: `Business readiness audit for ${topic} with scorecard, risks, quick wins and a prioritized improvement roadmap.`,
      sections: [
        section(
          "Audit Scorecard",
          `Overall readiness: B+. Strengths: offer clarity and visual credibility. Gaps: conversion proof, onboarding friction and analytics discipline for ${topic}.`,
        ),
        section(
          "Quick Wins",
          `Clarify homepage promise, add proof above the fold, tighten CTA copy, improve mobile spacing and publish one case-style credibility asset within 7 days.`,
        ),
        section(
          "Priority Risks",
          `Risk of low conversion from unclear positioning, inconsistent follow-up, and under-measured acquisition experiments. Address with messaging tests and funnel instrumentation.`,
        ),
        section(
          "90-Day Improvement Roadmap",
          `Month 1: messaging and landing fixes. Month 2: proof assets and nurture sequence. Month 3: paid tests and retention optimization with weekly KPI reviews.`,
        ),
      ],
      deliverables: [
        "Readiness scorecard",
        "Risk register",
        "Quick wins list",
        "Priority roadmap",
        "Executive recommendations",
      ],
    }),
  };

  return builders[workspaceType]();
}
