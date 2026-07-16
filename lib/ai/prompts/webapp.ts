import {
  COMPLEXITY_GUIDE,
  FILE_GENERATION_RULES,
  PRODUCTION_ARCHITECTURE_GUIDE,
} from "@/lib/ai/prompts/shared";
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

Determine complexity:
- simple: 1-3 CRUD entities, basic dashboard (20-40 files)
- moderate: 4-8 entities, multiple views, reports (40-80 files)
- complex: 8+ entities, workflows, role-based access (80-150 files)

List all required database tables, API endpoints, pages, features and technologies.

Return only structured JSON.`;
}

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

Return only JSON.`;
}

export function webappPlanPrompt(
  input: WebAppPromptInput,
  analysis: unknown,
  blueprint: unknown,
): string {
  return `Analyze the blueprint and build a dynamic production-grade project file plan for this web application.

Original prompt: ${input.prompt}
Analysis: ${JSON.stringify(analysis)}
Blueprint: ${JSON.stringify(blueprint)}

${COMPLEXITY_GUIDE}
${PRODUCTION_ARCHITECTURE_GUIDE}

You must NOT use a fixed template file list.
Decide automatically based on the blueprint and analysis:
- required pages, layouts, components, API routes, hooks, utilities, types, configs

Build the complete file tree dynamically with realistic production scope.
Every file must include: path, purpose, language, category (layout | lib | types | hooks | components | pages | api | configs)

Web Application specific rules:
- All apps need a dashboard layout with sidebar and top nav.
- Include CRUD API routes for every data model identified in the analysis.
- Include form components for creating/editing each entity.
- Include data table components for listing each entity.
- Include Prisma schema with all identified database tables.
- Include middleware for route protection.
- Include hooks for data fetching (useQuery patterns or server components).
- Include Zod validation schemas for all API inputs.
- Include types for all database entities.
- Match complexity to estimated file count.
- Reuse shared UI primitives — do not plan duplicate button/card/input implementations.
- Do not plan unused files.
- Do not include file contents.
- Return only JSON.`;
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
}): string {
  const validationNote = args.validationReason
    ? `\nPrevious attempt failed validation:\n${args.validationReason}\nFix all issues and regenerate this file correctly.`
    : "";

  const appTypeContext = getAppTypeContext(args.input.appType);

  return `Generate exactly one production-ready file for this Next.js 16 App Router web application.

Current file path: ${args.filePlan.path}
Current file purpose: ${args.filePlan.purpose}
Current file language: ${args.filePlan.language}
Current file category: ${args.filePlan.category}

Original prompt: ${args.input.prompt}
App type: ${args.input.appType}
Analysis: ${JSON.stringify(args.analysis)}
Blueprint: ${JSON.stringify(args.blueprint)}
Dynamic project plan: ${JSON.stringify(args.dynamicPlan)}
Project tree: ${JSON.stringify(args.projectTree)}
Existing generated files: ${JSON.stringify(args.existingFiles)}
${validationNote}

${appTypeContext}

${PRODUCTION_ARCHITECTURE_GUIDE}
${FILE_GENERATION_RULES}

Web Application specific rules:
- Dashboard pages use server components with data fetching.
- Forms use controlled React components with proper validation and error states.
- Tables use pagination, sorting, and search.
- API routes use Zod validation, proper error handling, and typed responses.
- Prisma schema includes all relationships, indexes, and timestamps.
- Use realistic business copy — no lorem ipsum or "Your Company Here".
- Navigation sidebar must list all app sections.
- All pages must be responsive and use Tailwind CSS.`;
}
