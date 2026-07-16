export type PublicSaasPageConfig = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta?: string;
  secondaryCta?: string;
  sections: {
    title: string;
    description: string;
    items: string[];
  }[];
};

export const PUBLIC_SAAS_PAGES = {
  features: {
    eyebrow: "Platform Features",
    title: "One AI workspace for every stage of business growth.",
    description:
      "Trend Business AI combines project generation, brand planning, market intelligence, content workflows and export-ready assets in one premium SaaS platform.",
    primaryCta: "Start Building",
    secondaryCta: "View Pricing",
    sections: [
      {
        title: "AI creation suite",
        description: "Generate full projects, business plans and campaign assets without switching tools.",
        items: [
          "AI Website & App Builder with source files and ZIP export",
          "Brand, creative, content, marketing and social workspaces",
          "Business intelligence, feasibility and audit modules",
        ],
      },
      {
        title: "Workspace operations",
        description: "Organize generated assets like a professional SaaS workspace.",
        items: [
          "Saved projects, favorites and generation history",
          "IDE-like project workspace with code, files and metadata",
          "Responsive dashboard with search, settings and usage views",
        ],
      },
      {
        title: "Production foundation",
        description: "Built with privacy, authentication and exportability in mind.",
        items: [
          "Supabase-authenticated private dashboard",
          "Per-user project persistence and safe route protection",
          "SEO-ready public pages and polished onboarding paths",
        ],
      },
    ],
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Simple plans for founders, operators and growing teams.",
    description:
      "Start during beta, then scale into higher limits, team workflows and advanced AI usage controls as your business grows.",
    primaryCta: "Create Free Account",
    secondaryCta: "Contact Sales",
    sections: [
      {
        title: "Starter",
        description: "$0 during beta for individuals exploring AI business workflows.",
        items: ["Core AI workspaces", "Saved project history", "ZIP export", "Private dashboard"],
      },
      {
        title: "Growth",
        description: "For teams that need higher limits, collaboration and advanced exports.",
        items: ["Team workspaces", "Advanced usage controls", "Priority support", "Billing controls"],
      },
      {
        title: "Business",
        description: "For agencies and companies managing multiple brands or client workspaces.",
        items: ["Admin dashboard", "Workspace analytics", "API key management", "Custom onboarding"],
      },
    ],
  },
  docs: {
    eyebrow: "Help Center",
    title: "Documentation for building, saving and exporting AI business assets.",
    description:
      "Use these guides to get started, generate better prompts and manage your projects inside Trend Business AI.",
    primaryCta: "Open Dashboard",
    secondaryCta: "Contact Support",
    sections: [
      {
        title: "Getting started",
        description: "Launch your first workflow in minutes.",
        items: [
          "Create an account and complete your profile",
          "Choose an AI workspace from the dashboard",
          "Save, favorite, reopen and export generated outputs",
        ],
      },
      {
        title: "Website & App Builder",
        description: "Generate source-code projects with structured files.",
        items: [
          "Describe the product, audience, features and design direction",
          "Review generated files in the AI Project Workspace",
          "Download production-ready ZIP packages for further development",
        ],
      },
      {
        title: "Account and workspace",
        description: "Manage the operational side of your SaaS account.",
        items: ["Billing and subscription pages", "Team and workspace controls", "API keys and notifications"],
      },
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Talk to the Trend Business AI team.",
    description:
      "Need help with onboarding, partnerships, billing or a custom AI business workflow? Send us a clear brief and we will respond with next steps.",
    primaryCta: "Email Support",
    secondaryCta: "Read FAQ",
    sections: [
      {
        title: "Support",
        description: "For account, product and workspace questions.",
        items: ["support@trendbusiness.ai", "Response target: 1-2 business days", "Include your account email"],
      },
      {
        title: "Sales",
        description: "For team plans, agency workflows and business onboarding.",
        items: ["sales@trendbusiness.ai", "Workspace setup guidance", "Custom workflow scoping"],
      },
      {
        title: "Partnerships",
        description: "For integrations, affiliates and strategic business relationships.",
        items: ["partners@trendbusiness.ai", "AI SaaS collaborations", "Co-marketing opportunities"],
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Answers to common product, billing and generation questions.",
    description:
      "Everything you need to understand the current platform, beta limits, project persistence and export workflows.",
    primaryCta: "Start Free",
    secondaryCta: "Open Help Center",
    sections: [
      {
        title: "Can I export generated projects?",
        description: "Yes. Website and app projects can be downloaded as ZIP files with generated source files.",
        items: ["Generated files persist in your history", "Favorites sync to saved projects", "Live Preview is intentionally frozen for MVP stability"],
      },
      {
        title: "Is my data private?",
        description: "Dashboard records are scoped to your authenticated Supabase user account.",
        items: ["Route protection is enabled", "Projects are tied to your user ID", "Public pages do not expose private workspace data"],
      },
      {
        title: "What is included in beta?",
        description: "Core generation, saved history, project workspace, exports and dashboard modules are available.",
        items: ["Billing pages are ready for subscription rollout", "Team and admin pages are scaffolded", "Usage dashboards show current platform state"],
      },
    ],
  },
  changelog: {
    eyebrow: "Changelog",
    title: "Product updates for Trend Business AI.",
    description:
      "Follow the evolution from business planning MVP to a complete AI SaaS workspace for generation, management and export.",
    primaryCta: "Open Dashboard",
    sections: [
      {
        title: "AI Project Workspace",
        description: "Added IDE-style generated project management.",
        items: ["File explorer and code editor", "Prompt and metadata panels", "Rename, favorite, delete and ZIP toolbar"],
      },
      {
        title: "Website & App Builder",
        description: "Upgraded AI generation from blueprints to full projects.",
        items: ["Next.js App Router file generation", "README and package.json output", "Supabase project persistence"],
      },
      {
        title: "Premium dashboard",
        description: "Expanded the product into a multi-module AI workspace.",
        items: ["Business, marketing and creative modules", "Saved projects and history", "Responsive black and gold UI"],
      },
    ],
  },
  blog: {
    eyebrow: "Blog",
    title: "Insights on AI business building, launches and growth.",
    description:
      "Product education, founder guides and AI workflow playbooks from the Trend Business AI team.",
    primaryCta: "Join Beta",
    secondaryCta: "Read Help Center",
    sections: [
      {
        title: "Latest articles",
        description: "Browse published posts for launch playbooks, AI workflows and product updates.",
        items: ["AI website launch checklists", "Market research workflows", "Brand and campaign planning guides"],
      },
      {
        title: "Product education",
        description: "Practical examples for getting more from each workspace.",
        items: ["Better prompts", "Reusable templates", "Export and handoff workflows"],
      },
      {
        title: "Business strategy",
        description: "Playbooks for validating, positioning and growing new ventures.",
        items: ["Feasibility analysis", "Competitive positioning", "Campaign testing"],
      },
    ],
  },
} satisfies Record<string, PublicSaasPageConfig>;

