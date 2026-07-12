export type DashboardPlatformPageConfig = {
  title: string;
  description: string;
  badge: string;
  primaryAction: string;
  secondaryAction?: string;
  sections: {
    title: string;
    description: string;
    items: string[];
  }[];
};

export const DASHBOARD_PLATFORM_PAGES = {
  projects: {
    title: "Projects",
    description: "Manage generated projects, saved assets and workspace output from one project dashboard.",
    badge: "Project dashboard",
    primaryAction: "Open Website Builder",
    secondaryAction: "Review History",
    sections: [
      {
        title: "Generated projects",
        description: "All website and app projects remain available in Supabase history.",
        items: ["Reopen project files", "Download ZIP exports", "Favorite important work"],
      },
      {
        title: "Project operations",
        description: "Use the AI Project Workspace to inspect code, metadata and prompt context.",
        items: ["Search project files", "Rename and delete saved work", "Review generation metadata"],
      },
      {
        title: "Delivery readiness",
        description: "Hand generated source packages to developers or continue iteration in the dashboard.",
        items: ["README and package.json output", "Reusable components", "Responsive UI source files"],
      },
    ],
  },
  billing: {
    title: "Billing",
    description: "Review plan status, invoices and billing readiness for subscription rollout.",
    badge: "Billing center",
    primaryAction: "Manage Plan",
    secondaryAction: "Contact Sales",
    sections: [
      {
        title: "Current plan",
        description: "Beta access is active while paid subscriptions are prepared.",
        items: ["Free beta workspace", "Core AI modules enabled", "Upgrade path ready"],
      },
      {
        title: "Invoices",
        description: "Invoice history will appear here once paid billing is enabled.",
        items: ["No outstanding invoices", "Billing email uses account email", "Export-ready billing records"],
      },
      {
        title: "Payment controls",
        description: "Prepared for Stripe or provider-backed subscription management.",
        items: ["Plan limits", "Seat billing", "Usage-based add-ons"],
      },
    ],
  },
  subscription: {
    title: "Subscription",
    description: "Manage plan features, limits and subscription state for your workspace.",
    badge: "Subscription management",
    primaryAction: "Compare Plans",
    secondaryAction: "Open Billing",
    sections: [
      {
        title: "Plan status",
        description: "Your workspace is running on beta access.",
        items: ["Project history enabled", "ZIP downloads enabled", "AI workspaces enabled"],
      },
      {
        title: "Upcoming limits",
        description: "Production subscriptions can map usage, teams and API access to plan tiers.",
        items: ["Monthly AI credits", "Team seats", "Workspace storage"],
      },
      {
        title: "Upgrade workflow",
        description: "The UI is ready for provider-backed checkout and portal integration.",
        items: ["Checkout action", "Billing portal action", "Plan comparison"],
      },
    ],
  },
  apiKeys: {
    title: "API Keys",
    description: "Prepare secure API access for automations, integrations and developer workflows.",
    badge: "Developer access",
    primaryAction: "Create API Key",
    secondaryAction: "Read Docs",
    sections: [
      {
        title: "Key management",
        description: "API key creation is staged for production credential storage.",
        items: ["Scoped access", "Key rotation", "Last used metadata"],
      },
      {
        title: "Integrations",
        description: "Connect Trend Business AI workflows to external operations.",
        items: ["Project export automation", "Report generation", "Usage tracking"],
      },
      {
        title: "Security model",
        description: "Production keys should be hashed and never shown after creation.",
        items: ["Secret redaction", "Per-workspace scopes", "Audit events"],
      },
    ],
  },
  notifications: {
    title: "Notifications",
    description: "Control product, billing, project and generation alerts.",
    badge: "Notification center",
    primaryAction: "Save Preferences",
    secondaryAction: "Test Toast",
    sections: [
      {
        title: "Workspace alerts",
        description: "Stay informed about project and generation activity.",
        items: ["Generation completed", "Export ready", "Project favorited"],
      },
      {
        title: "Account alerts",
        description: "Manage security, billing and subscription notices.",
        items: ["Login security", "Plan changes", "Usage thresholds"],
      },
      {
        title: "Delivery channels",
        description: "Email and in-app notifications are prepared for production workflows.",
        items: ["Email notifications", "Dashboard notifications", "Toast feedback"],
      },
    ],
  },
  settings: {
    title: "Settings",
    description: "Manage account, theme, workspace and operational preferences.",
    badge: "Workspace settings",
    primaryAction: "Edit Profile",
    secondaryAction: "Open Notifications",
    sections: [
      {
        title: "Account",
        description: "Profile and preference controls remain available in the profile settings form.",
        items: ["Full name", "Company", "Role and theme"],
      },
      {
        title: "Workspace",
        description: "Control workspace defaults for AI generation and project management.",
        items: ["Default language", "Export behavior", "Project naming"],
      },
      {
        title: "Product preferences",
        description: "Tune notifications, billing and team behavior.",
        items: ["Email preferences", "Billing contact", "Team invitations"],
      },
    ],
  },
  team: {
    title: "Team & Workspace",
    description: "Manage members, workspace roles and collaboration readiness.",
    badge: "Team management",
    primaryAction: "Invite Member",
    secondaryAction: "Manage Roles",
    sections: [
      {
        title: "Members",
        description: "Team collaboration is staged for the production SaaS rollout.",
        items: ["Owner role", "Admin role", "Member role"],
      },
      {
        title: "Workspace controls",
        description: "Prepare shared access around projects, exports and billing.",
        items: ["Project visibility", "Shared favorites", "Workspace defaults"],
      },
      {
        title: "Governance",
        description: "Keep collaboration controlled and audit-friendly.",
        items: ["Invitation status", "Role changes", "Access review"],
      },
    ],
  },
  admin: {
    title: "Admin Dashboard",
    description: "Operate the SaaS platform with workspace, usage and quality signals.",
    badge: "Admin operations",
    primaryAction: "Review Usage",
    secondaryAction: "Open Analytics",
    sections: [
      {
        title: "Platform health",
        description: "Monitor generated records and user-facing module coverage.",
        items: ["Generation counts", "Saved assets", "Dashboard module availability"],
      },
      {
        title: "Operations",
        description: "Prepare support, billing and team workflows for production.",
        items: ["Subscription readiness", "Help center coverage", "Contact pathways"],
      },
      {
        title: "Governance",
        description: "Keep production operations aligned with secure SaaS practices.",
        items: ["Protected dashboard routes", "No-index private pages", "Per-user data access"],
      },
    ],
  },
  analytics: {
    title: "Analytics",
    description: "Understand workspace activity across generations, saved work and exports.",
    badge: "Analytics dashboard",
    primaryAction: "View Usage",
    secondaryAction: "Open Projects",
    sections: [
      {
        title: "Activity mix",
        description: "Track the product areas receiving the most generated output.",
        items: ["Ideas", "Market analyses", "Reports", "Website and app projects"],
      },
      {
        title: "Engagement",
        description: "Use favorites and history as practical engagement signals.",
        items: ["Saved projects", "Recently generated assets", "Workspace returns"],
      },
      {
        title: "Quality signals",
        description: "Review export readiness and project completeness.",
        items: ["Generated file counts", "ZIP export availability", "Project metadata"],
      },
    ],
  },
  usage: {
    title: "Usage",
    description: "Monitor AI workspace consumption, project volume and plan readiness.",
    badge: "Usage dashboard",
    primaryAction: "Manage Subscription",
    secondaryAction: "Open Billing",
    sections: [
      {
        title: "AI credits",
        description: "Usage cards prepare the product for credit-based subscriptions.",
        items: ["Monthly credit allocation", "Generation usage", "Remaining balance"],
      },
      {
        title: "Storage",
        description: "Generated files and saved projects are the main storage signals.",
        items: ["Saved projects", "Project files", "History records"],
      },
      {
        title: "Limits",
        description: "Future plans can enforce limits without changing the core UX.",
        items: ["Seat limits", "Project limits", "API request limits"],
      },
    ],
  },
  search: {
    title: "Search",
    description: "Search across projects, history, favorites and AI workspace modules.",
    badge: "Search everywhere",
    primaryAction: "Search Projects",
    secondaryAction: "Open History",
    sections: [
      {
        title: "Project search",
        description: "Find generated projects by title, prompt, description and files.",
        items: ["Website and app projects", "Saved favorites", "Generation history"],
      },
      {
        title: "Workspace search",
        description: "Jump to the right module or operational page.",
        items: ["Billing", "API keys", "Team", "Analytics"],
      },
      {
        title: "Public resources",
        description: "Discover help content and public SaaS pages.",
        items: ["Documentation", "FAQ", "Changelog"],
      },
    ],
  },
} satisfies Record<string, DashboardPlatformPageConfig>;

