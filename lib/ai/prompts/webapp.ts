import {
  FILE_GENERATION_RULES,
  PRODUCTION_ARCHITECTURE_GUIDE,
} from "@/lib/ai/prompts/shared";
import { aiOutputLanguageDirective } from "@/lib/ai/prompts/language-directive";
import { buildWebsiteLanguageDirective } from "@/lib/ai-core/website-builder/language-directive";
import { WEBAPP_TYPES } from "@/lib/constants/webapp-builder";

type WebAppPromptInput = {
  prompt: string;
  appType: string;
  language: string;
  designStyle: string;
  colorStyle: string;
  features: string[];
};

function getAppTypeContext(appType: string): string {
  const def = WEBAPP_TYPES.find((t) => t.id === appType);
  if (!def) return "";

  const moduleMap: Record<string, string> = {
    crm: `CRM-specific modules:
- Contact management (list, detail, create, edit, import/export)
- Deal pipeline with drag-and-drop Kanban board
- Activity timeline and notes per contact/deal
- Task management linked to contacts and deals
- Email templates and communication log
- Reports: conversion funnel, revenue forecast, activity summary`,

    erp: `ERP-specific modules:
- Module-based navigation (Finance, HR, Operations, Procurement)
- Chart of accounts and journal entries
- Purchase orders and vendor management
- Inventory tracking with warehouse locations
- Employee directory and department hierarchy
- Approval workflows for purchases and expenses
- Audit log for all entity changes`,

    dashboard: `Dashboard-specific modules:
- KPI cards with sparkline trends
- Interactive charts (line, bar, pie, area) using recharts
- Date range picker with preset ranges
- Real-time data refresh with polling
- Data export to CSV/PDF
- Customizable widget grid layout
- Dark mode support`,

    saas: `SaaS-specific modules:
- Marketing landing page with feature highlights and CTA
- Pricing page with tiered plans (Free, Pro, Enterprise)
- Onboarding wizard for new users
- Team management with invite flow and role assignment
- Billing page with subscription status and invoice history
- Settings page with profile, notifications, API keys
- Usage metrics dashboard`,

    booking: `Booking System-specific modules:
- Calendar view (day, week, month) with time slot grid
- Service/resource catalog with duration and pricing
- Booking form with date/time picker and customer details
- Availability management for staff/resources
- Booking confirmation and reminder notifications
- Customer booking history and cancellations
- Revenue and utilization reports`,

    pos: `POS-specific modules:
- Product catalog with categories, search, and barcode lookup
- Cart interface optimized for quick transactions
- Payment processing with multiple payment methods
- Receipt generation (print-ready and email)
- Cash register open/close and shift management
- Daily sales report and transaction history
- Inventory alerts for low stock`,

    lms: `LMS-specific modules:
- Course catalog with categories and search
- Course builder with lesson ordering and content types (text, video, quiz)
- Quiz engine with multiple question types and auto-grading
- Student progress tracker with completion percentage
- Certificate generation on course completion
- Instructor dashboard with enrollment and revenue stats
- Discussion forum per course`,

    hr: `HR-specific modules:
- Employee directory with profile cards and org chart
- Leave management with calendar, balance, and approval workflow
- Attendance tracking with check-in/out
- Payroll summary with pay slip generation
- Recruitment pipeline (job posts, applications, interviews)
- Performance review forms and history
- Department and team management`,

    inventory: `Inventory-specific modules:
- Product catalog with SKU, category, variants, and images
- Stock levels with warehouse/location tracking
- Purchase order management with supplier directory
- Stock transfer between locations
- Low-stock alerts and reorder point configuration
- Barcode/QR scanning support
- Inventory valuation and movement reports`,

    "ecommerce-admin": `E-commerce Admin-specific modules:
- Product management (CRUD, variants, images, SEO)
- Order management with status workflow (pending → shipped → delivered)
- Customer management with order history and segments
- Analytics dashboard (revenue, orders, top products, conversion)
- Discount and coupon management
- Category and collection management
- Settings: store info, shipping zones, payment gateways`,

    custom: `Custom Web App modules:
- Build exactly what the user described in their prompt
- Infer required pages, components, and API routes from the description
- Include authentication if the prompt implies user accounts
- Include database schema if the prompt implies persistent data
- Include dashboard if the prompt implies admin or analytics views`,
  };

  return moduleMap[appType] ?? moduleMap.custom ?? "";
}

function appLanguageBlock(input: WebAppPromptInput): string {
  return `${buildWebsiteLanguageDirective({
    language: input.language,
    prompt: input.prompt,
  })}${aiOutputLanguageDirective(input.language, "app")}`;
}

export function webappAnalyzePrompt(input: WebAppPromptInput): string {
  const appTypeContext = getAppTypeContext(input.appType);
  const def = WEBAPP_TYPES.find((t) => t.id === input.appType);

  return `Analyze this web application request for a production Next.js full-stack project.

Application type: ${def?.label ?? input.appType}
${def ? `Type description: ${def.description}` : ""}
User prompt: ${input.prompt}
Language: ${input.language}
Design style: ${input.designStyle}
Color style: ${input.colorStyle}
Requested features: ${input.features.join(", ") || "None specified"}

${appTypeContext}

Detect capability flags:
- requiresAuth: true (all web apps require authentication)
- requiresDatabase: true (all web apps require persistent data)
- requiresDashboard: true (all web apps have a dashboard)
- isEcommerce: true only for e-commerce admin or POS with product catalog
- isSaas: true only for SaaS apps with subscription billing
- databaseProvider: "prisma" (use Prisma for all web apps)

Determine complexity (file counts must stay within the 18-file hard limit):
- simple: 1-3 CRUD entities, basic dashboard
- moderate: focused MVP with auth + one dashboard + 1-2 entity pages
- complex: still an 18-file MVP — do not plan a large incomplete tree

List all required database tables, API endpoints, pages, features and technologies.

Return only structured JSON.${appLanguageBlock(input)}`;
}

/**
 * Single Stage-2 planning prompt — one DeepSeek JSON response replaces
 * sequential Blueprint → Plan LLM calls. Context is compact structured JSON
 * (Universal Planner + seed analysis), not rebuilt prose from prior LLM turns.
 */
export function webappUnifiedPlanningPrompt(args: {
  input: WebAppPromptInput;
  seedAnalysis: unknown;
  designSeed: unknown;
  universalPlannerContext: unknown;
}): string {
  const appTypeContext = getAppTypeContext(args.input.appType);
  const contextJson = JSON.stringify(
    {
      input: {
        prompt: args.input.prompt,
        appType: args.input.appType,
        language: args.input.language,
        designStyle: args.input.designStyle,
        colorStyle: args.input.colorStyle,
        features: args.input.features,
      },
      seedAnalysis: args.seedAnalysis,
      designSeed: args.designSeed,
      universalPlanner: args.universalPlannerContext,
    },
    null,
    2,
  );

  return `Create a COMPLETE production planning document for a Next.js 16 App Router web application in ONE JSON response.

Structured planning context (use as source of truth; refine, do not ignore):
${contextJson}

${appTypeContext}

${PRODUCTION_ARCHITECTURE_GUIDE}

Return a single JSON object with ALL of these top-level keys:
- analysis: requirements analysis (appName, complexity, pages, features, technologies, databaseTables, apiEndpoints, capability flags)
- strategy: positioning, pages, sections, ctas, seoFocus
- universalBlueprint: intentSummary, goals, constraints, orderedServices, selectedServiceId ("app-builder")
- databaseSchema: provider ("prisma"), tables[{name, fields, relations}]
- apiPlan: routes[{path, methods, purpose}]
- uiPlan: layouts, pages, components, navigation, theme
- filePlan: dynamic file tree (complexity, estimatedFileCount, layouts, pages, components, apiRoutes, hooks, utilities, types, configs, files[{path, purpose, language, category}])
- servicePlan: services, integrations, authProvider ("cookie-session")
- dependencies: npm, devNpm (package names only; versions optional)
- executionMetadata: complexity, estimatedFileCount, generationMode ("mvp"), notes
- blueprint: title, description, pages, sections, dataModels, apiRoutes, components, navigation, theme, roadmap

Hard limits:
- Target 16–18 files; never exceed 18.
- Always plan: configs, app/layout.tsx, app/page.tsx, components/ui.tsx, prisma/schema.prisma, lib/db.ts, login, middleware, dashboard page, one authenticated CRUD API.
- Prisma + SQLite only. No competing catch-all routes. Explicit paths only.
- This is a full-stack app with real CRUD — no placeholder content.

Return only JSON.${appLanguageBlock(args.input)}`;
}

/** @deprecated Prefer webappUnifiedPlanningPrompt — kept for reference/tests. */
export function webappBlueprintPrompt(
  input: WebAppPromptInput,
  analysis: unknown,
): string {
  const appTypeContext = getAppTypeContext(input.appType);

  return `Create a complete production-grade project blueprint for a Next.js 16 App Router web application.

Original prompt: ${input.prompt}
Analysis: ${JSON.stringify(analysis)}

${appTypeContext}

${PRODUCTION_ARCHITECTURE_GUIDE}

The blueprint must define:
- All application pages with their purpose
- UI sections and layout structure
- Data models and their relationships
- API routes with CRUD operations
- Reusable components specific to this app type
- Navigation structure (sidebar items, breadcrumbs)
- Theme configuration (colors, typography, spacing)
- Development roadmap

This is a full-stack web application, not a static website.
Every page must have real functionality — forms that submit, tables that display data, charts that visualize metrics.
No placeholder content. Use realistic business data aligned with the app type.

Return only JSON.${appLanguageBlock(input)}`;
}

/** @deprecated Prefer webappUnifiedPlanningPrompt — kept for reference/tests. */
export function webappPlanPrompt(
  input: WebAppPromptInput,
  analysis: unknown,
  blueprint: unknown,
): string {
  return `Analyze the blueprint and build a dynamic production-grade project file plan for this web application.

Original prompt: ${input.prompt}
Analysis: ${JSON.stringify(analysis)}
Blueprint: ${JSON.stringify(blueprint)}

${PRODUCTION_ARCHITECTURE_GUIDE}

Target 16–18 files for a shippable MVP. Do not exceed 18 files.
Always include: Next.js configs, app/layout.tsx, app/page.tsx, components/ui.tsx, Prisma schema, lib/db.ts, login, middleware, one dashboard page, and one authenticated CRUD API route.
Prefer a complete local SQLite app over a large incomplete tree.

Decide automatically based on the blueprint and analysis:
- required pages, layouts, components, API routes, hooks, utilities, types, configs

Build the complete file tree dynamically with realistic production scope.
Every file must include: path, purpose, language, category (layout | lib | types | hooks | components | pages | api | configs)

Web Application specific rules:
- All apps need a dashboard layout with sidebar and top nav.
- Plan only pages that will actually be generated. Sidebar links must match planned page paths.
- Never plan two App Router pages that resolve to the same URL.
- Never plan two dynamic segments at the same URL depth (app/(auth)/[mode] and app/(dashboard)/[resource] both own /[param]). Use explicit routes such as /login, /contacts, and /deals.
- Include Prisma schema with SQLite, lib/db.ts, login, middleware, and at least one authenticated app/api/{resource}/route.ts CRUD handler.
- Include Zod validation schemas for forms and mutations.
- Include types for all database entities.
- Match complexity to estimated file count and stay within the 18-file hard limit.
- Reuse shared UI primitives — do not plan duplicate button/card/input implementations.
- If pages/forms use Label or Textarea, include matching UI primitives in the shared UI module plan (components/ui.tsx or equivalent).
- Do not plan unused files.
- Do not include file contents.
- Return only JSON.${appLanguageBlock(input)}`;
}

export function webappFilePrompt(args: {
  input: WebAppPromptInput;
  analysis: unknown;
  blueprint: unknown;
  dynamicPlan: Record<string, unknown>;
  filePlan: {
    path: string;
    purpose: string;
    language: string;
    category: string;
  };
  projectTree: unknown;
  existingFiles: unknown;
  validationReason?: string;
  /** Prefer compact structured unified planning JSON when Stage 2 produced it. */
  unifiedPlanning?: unknown;
}): string {
  const validationNote = args.validationReason
    ? `\nPrevious attempt failed validation:\n${args.validationReason}\nFix all issues and regenerate this file correctly.`
    : "";

  const appTypeContext = getAppTypeContext(args.input.appType);
  const planningContext = args.unifiedPlanning
    ? `Unified planning document: ${JSON.stringify(args.unifiedPlanning)}`
    : `Analysis: ${JSON.stringify(args.analysis)}
Blueprint: ${JSON.stringify(args.blueprint)}
Dynamic project plan: ${JSON.stringify(args.dynamicPlan)}`;

  return `Generate exactly one production-ready file for this Next.js 16 App Router web application.

Current file path: ${args.filePlan.path}
Current file purpose: ${args.filePlan.purpose}
Current file language: ${args.filePlan.language}
Current file category: ${args.filePlan.category}

Original prompt: ${args.input.prompt}
App type: ${args.input.appType}
${planningContext}
Project tree: ${JSON.stringify(args.projectTree)}
Existing generated files: ${JSON.stringify(args.existingFiles)}
${validationNote}

${appTypeContext}

${PRODUCTION_ARCHITECTURE_GUIDE}
${FILE_GENERATION_RULES}

Web Application specific rules:
- This app must be completely self-contained: it must install, typecheck, and build with no files from the parent platform.
- Do not generate proxy.ts that imports the host. If auth middleware is needed, generate middleware.ts that only uses this app's lib/auth (or Next.js APIs).
- next.config.ts must pin turbopack.root and outputFileTracingRoot to this app directory by default so nested builds never compile the host. (Verify tooling may expand turbopack.root via .webapp-turbopack-root when linking a shared dependency cache.)
- Dashboard pages use server components with data fetching.
- Pages that read cookies, headers, or Prisma must export const dynamic = 'force-dynamic'.
- Forms use controlled React components with proper validation and error states.
- Tables use pagination, sorting, and search.
- API routes use Zod validation, proper error handling, and typed responses.
- Prisma schema must use SQLite (provider = "sqlite") so the app runs after npm install without a hosted database. Do not use PostgreSQL enums; use String fields with defaults. Include relationships, indexes, and timestamps.
- Every prisma.*.create data object must include every required schema field (or give that field @default).
- Badge variants must match the BadgeVariant union. Never use variant="danger"; use variant="destructive".
- Pass Uint8Array values into crypto.subtle as BufferSource via bytes.buffer.slice(...) or a toBufferSource helper.
- Client components must never import modules that use next/headers, next/server, or inline "use server". Put Zod schemas in a separate file.
- Link href values must point at routes that exist in the project tree.
- Do not emit both components/ui.tsx and components/ui/*.tsx. Pick one UI module style and import from it consistently.
- Link must be imported from "next/link" (never from "next/navigation").
- cookies() from "next/headers" must always be awaited in Next.js 15+.
- headers() from "next/headers" must always be awaited in Next.js 15+.
- async function return types must be Promise<T> (never bare T on an async function).
- If pages pass Button asChild, components/ui.tsx must export ButtonProps.asChild only on Button.
- Never add asChild to Slot, Card, Input, Label, Textarea, or other wrapper components.
- Button asChild must clone a ReactElement<{ className?: string }>, never untyped children.props.
- badgeVariants must include every BadgeVariant union member (including destructive).
- Any symbol imported from "@/components/ui" (e.g. Label, Textarea) must be exported by that module.
- Avoid React type typos (HTMLAttributes, not HMLAttributes).
- Custom search handlers must not redefine InputHTMLAttributes.onSubmit; use onSearchSubmit instead.
- Use DB-backed cookie-session auth in lib/auth.ts via getSession(). Session must be { sessionId: string; userId: string; email: string }. Never use session.user — use session.email / session.userId / session.sessionId. Login must verify passwordHash; include signup. Do not scaffold NextAuth CredentialsProvider in lib/auth.ts.
- Toolchain files may already exist in Existing generated files (package.json, tsconfig, next.config, postcss, eslint, globals.css, lib/utils.ts, components/ui.tsx, lib/auth.ts). Reuse their exports and APIs — do not reinvent conflicting primitives.
- If NextAuth is ever required, CredentialsProvider must be a default import: import CredentialsProvider from "next-auth/providers/credentials", and authorize(credentials) must be explicitly typed (never implicit any).
- Do not emit competing catch-all pages at the same URL depth. Prefer app/contacts/page.tsx over app/[resource]/page.tsx.
- Do not emit both app/api/{resource}/route.ts and app/api/{resource}/[[...id]]/route.ts — optional catch-alls conflict with the collection route. Use either the collection route plus app/api/{resource}/[id]/route.ts, or a single optional catch-all handler.
- The client directive must be exactly "use client"; (including quotes). Never emit use client"; or other malformed directives.
- Never mix ?? with || or && in the same expression without explicit parentheses.
- Use realistic business copy — no lorem ipsum or "Your Company Here".
- Navigation sidebar must list only sections that have generated pages.
- All pages must be responsive and use Tailwind CSS.${appLanguageBlock(args.input)}`;
}
