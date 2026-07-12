export const COMPLEXITY_GUIDE = `
Estimate project size and file count from the blueprint:
- Simple Landing Page: ~15 files
- Portfolio: ~25 files
- Restaurant / local business: ~35 files
- Dashboard SaaS: ~80 files
- CRM / internal app: ~120 files
- E-commerce: ~180 files
- Marketplace / multi-vendor platform: ~250 files
`;

export const PRODUCTION_ARCHITECTURE_GUIDE = `
Every generated project must be production-grade and include:
- ESLint + Prettier + TypeScript + Tailwind + Next.js App Router
- Root metadata, responsive layout, SEO helpers, loading states, error boundaries, 404 page
- Reusable UI primitives in components/ui (button, card, input) — no duplicated components
- Shared utilities in lib/ — no duplicated helpers
- Clean architecture: types/, hooks/, lib/, components/, app/

Conditional modules (include only when required by the blueprint):
- Authentication: login, register, forgot password, middleware protection, session handling
- Database: Prisma OR Supabase schema, CRUD APIs, types, Zod validation
- Dashboard: sidebar, navbar, cards, chart panels, tables, pagination, search, filters
- E-commerce: products, categories, cart, checkout, orders, payments, wishlist, profile
- SaaS: landing, pricing, authentication, dashboard, settings, billing, team, API routes

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
- Reuse components/ui and lib/utils — never duplicate utilities or UI primitives.
- TypeScript React function components for TSX files.
- app/layout.tsx must export metadata for SEO.
- app/loading.tsx and app/error.tsx must be functional UI.
- package.json must include next, react, react-dom, typescript, tailwindcss, eslint, prettier and scripts: dev, build, start, lint.
- The project must run immediately after npm install and npm run dev.
- Config files must be valid for Next.js App Router and Tailwind CSS 4.
`;
