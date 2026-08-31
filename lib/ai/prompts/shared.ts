export {
  aiOutputLanguageDirective,
  type GlsOutputSurface,
} from "@/lib/ai/prompts/language-directive";

export const COMPLEXITY_GUIDE = `
Estimate project size and file count from the blueprint.
HARD LIMIT: never plan more than 18 files total (configs + app code).
Prefer a focused, shippable MVP over a large incomplete tree.

Guidance:
- Simple Landing Page / Portfolio: 10-14 files
- Local business / brochure site: 12-16 files
- Dashboard or booking app MVP: 14-18 files
- Never exceed 18 files even for SaaS, CRM, ecommerce, or marketplace briefs
`;

export const PRODUCTION_ARCHITECTURE_GUIDE = `
Every generated project must be production-grade and include:
- ESLint + Prettier + TypeScript + Tailwind + Next.js App Router
- Root metadata, responsive layout, SEO helpers
- Reusable UI primitives in components/ui (button, card, input)
- Shared utilities in lib/
- Clean architecture: types/, hooks/, lib/, components/, app/

Keep scope to an MVP under the 18-file hard limit.
Prioritize: configs, root layout, home page, 1-2 feature pages, shared UI, and only essential feature modules.
Do not generate unused files. Every file must be imported or referenced by the project.
`;

export const FILE_GENERATION_RULES = `
Rules:
- Return only JSON for this one file.
- Generate only the file at the current path.
- The file must be aware of the whole project blueprint, project tree and existing files.
- Use production-quality React + Next.js + Tailwind code with responsive layout.
- No placeholders, no TODOs, no fake content, no lorem ipsum.
- Use realistic business copy aligned with the project prompt.
- Import only from files that exist in the project tree or standard npm packages declared in package.json.
- The generated project is a standalone Next.js app. Never import files from the host platform, parent repo, or Trend Business AI.
- Never import @/lib/supabase/proxy, @/lib/ai-core, @/lib/i18n/paths, @/plugins, or any path that leaves this project (no ../../ into the parent).
- Generate every required module inside this app. Do not copy host proxy.ts, middleware from the parent, or platform path aliases.
- Reuse components/ui and lib/utils — never duplicate utilities or UI primitives.
- TypeScript React function components for TSX files.
- app/layout.tsx must export metadata for SEO.
- app/loading.tsx and app/error.tsx must be functional UI.
- package.json must include next, react, react-dom, typescript, tailwindcss, eslint, prettier and scripts: dev, build, start, lint.
- If prisma/schema.prisma exists, package.json scripts must include postinstall: "prisma generate" and build: "prisma generate && next build".
- Never set typedRoutes or experimental.typedRoutes to true.
- Do not emit two App Router pages that resolve to the same URL (for example app/page.tsx and app/(dashboard)/page.tsx both own "/").
- The project must run immediately after npm install and npm run dev.
- Config files must be valid for Next.js App Router and Tailwind CSS 4.
`;
