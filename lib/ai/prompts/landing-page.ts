import {
  FILE_GENERATION_RULES,
  PRODUCTION_ARCHITECTURE_GUIDE,
} from "@/lib/ai/prompts/shared";
import { LANDING_PAGE_TYPES } from "@/lib/constants/landing-page-builder";

type LPPromptInput = {
  prompt: string;
  pageType: string;
  language: string;
  designStyle: string;
  colorStyle: string;
  sections: string[];
};

function getPageTypeContext(pageType: string): string {
  const contextMap: Record<string, string> = {
    saas: `SaaS Landing Page specifics:
- Hero with headline, subheadline, email capture or "Start Free Trial" CTA, and product screenshot/mockup
- Feature grid with icons, titles, and short descriptions (6-8 features)
- "How it works" 3-step process section
- Pricing table with 3 tiers (Free, Pro, Enterprise) and feature comparison
- Customer testimonials with avatar, name, role, company, and quote
- FAQ accordion with 6-8 common questions
- Final CTA banner with urgency copy`,

    startup: `Startup Landing Page specifics:
- Bold hero with vision statement and "Join waitlist" or "Get early access" CTA
- Problem/solution narrative sections
- Key metrics or traction (users, revenue, growth %)
- Team section with photos, names, and roles
- Investor logos or "backed by" social proof
- Final CTA for investors or early adopters`,

    product: `Product Landing Page specifics:
- Hero with product image/3D render and purchase CTA
- Benefits section (what the customer gains, not features)
- Detailed feature breakdown with visuals
- Image gallery or product carousel
- Customer reviews with star ratings
- Pricing with "Buy Now" or "Add to Cart" button
- 30-day guarantee badge`,

    "mobile-app": `Mobile App Landing Page specifics:
- Hero with phone mockup and App Store/Google Play buttons
- App screenshots carousel
- Feature list with phone frame illustrations
- Step-by-step onboarding preview
- User testimonials
- Download section with QR code
- FAQ section`,

    agency: `Agency Landing Page specifics:
- Hero with bold tagline and "Get a Quote" CTA
- Services grid with icons
- Portfolio/case studies with thumbnails, client names, and results
- Process timeline (Discovery → Strategy → Design → Launch)
- Team member cards
- Client testimonials with logos
- Contact form with project brief fields`,

    portfolio: `Portfolio Landing Page specifics:
- Hero with name, title, and brief intro
- About section with professional bio
- Skills/technologies as tags or progress bars
- Project showcase with thumbnails, descriptions, and live links
- Testimonials from clients or colleagues
- Contact form with social links`,

    event: `Event Landing Page specifics:
- Hero with event name, date, location, and countdown timer
- Speaker lineup with bios and session titles
- Schedule/agenda with time slots and tracks
- Venue info with embedded map
- Sponsor logos grid
- Ticket tiers with pricing and early-bird offers
- FAQ about logistics`,

    webinar: `Webinar Landing Page specifics:
- Hero with webinar title, date/time with timezone, and live countdown
- Speaker bios with credentials
- Topics/agenda bullet points
- "What you'll learn" benefits list
- Registration form (name, email, company)
- Social proof (past attendee count, ratings)
- FAQ about access and recordings`,

    course: `Course Landing Page specifics:
- Hero with course title, instructor name, and "Enroll Now" CTA
- Detailed curriculum with modules and lessons expandable accordion
- Instructor bio with credentials and photo
- Student testimonials with outcomes
- Pricing with money-back guarantee
- FAQ about access, certificates, and refunds
- Final enrollment CTA with urgency`,

    restaurant: `Restaurant Landing Page specifics:
- Hero with full-bleed food photography and "Reserve a Table" CTA
- Featured menu items with descriptions and prices
- About section with restaurant story
- Ambiance gallery
- Customer reviews from Google/Yelp
- Reservation form with date/time picker
- Location with embedded map and hours`,

    "real-estate": `Real Estate Landing Page specifics:
- Hero with property search or featured listing
- Featured properties grid with images, price, beds/baths, sqft
- Property search with filters (price, type, location)
- Market stats (listings, avg price, days on market)
- Agent bio with credentials and contact
- Client testimonials
- Contact form for property inquiries`,

    "ecommerce-product": `E-commerce Product Landing Page specifics:
- Hero with large product image and "Buy Now" CTA with price
- Product details with tabs (Description, Specs, Reviews)
- Technical specifications table
- Customer reviews with star ratings and photos
- Image gallery with zoom
- Related products or bundles
- Shipping info and guarantee`,

    "lead-generation": `Lead Generation Landing Page specifics:
- Hero with compelling offer headline and lead form above the fold
- Benefits list (what they get for signing up)
- Social proof (customer count, logos, reviews)
- Detailed offer description
- Lead capture form (name, email, phone, company)
- Trust badges and privacy guarantee
- Urgency element (limited time, spots remaining)`,

    custom: `Custom Landing Page:
- Build exactly what the user described
- Infer sections from the prompt
- Include hero, CTA, and footer at minimum
- Add relevant sections based on context`,
  };

  return contextMap[pageType] ?? contextMap.custom ?? "";
}

export function lpAnalyzePrompt(input: LPPromptInput): string {
  const def = LANDING_PAGE_TYPES.find((t) => t.id === input.pageType);
  const typeContext = getPageTypeContext(input.pageType);

  return `Analyze this landing page request for a production Next.js single-page project.

Page type: ${def?.label ?? input.pageType}
${def ? `Type description: ${def.description}` : ""}
User prompt: ${input.prompt}
Language: ${input.language}
Design style: ${input.designStyle}
Color style: ${input.colorStyle}
Requested sections: ${input.sections.join(", ") || "Default for type"}

${typeContext}

This is a SINGLE landing page (not a multi-page website or web app).
Detect capability flags:
- requiresAuth: false (landing pages don't need auth)
- requiresDatabase: false (no persistent data)
- requiresDashboard: false (no admin panel)
- isEcommerce: false (not a full store)
- isSaas: false (not a full SaaS app)
- databaseProvider: "none"

Return only structured JSON.`;
}

export function lpBlueprintPrompt(
  input: LPPromptInput,
  analysis: unknown,
): string {
  const typeContext = getPageTypeContext(input.pageType);

  return `Create a complete production-grade blueprint for a single-page Next.js 16 landing page.

Original prompt: ${input.prompt}
Analysis: ${JSON.stringify(analysis)}

${typeContext}

${PRODUCTION_ARCHITECTURE_GUIDE}

The blueprint must define:
- A compelling headline and subheadline
- All page sections with their content strategy
- Color palette matching the style: ${input.colorStyle}
- Typography choices for headings and body
- Reusable section components
- Realistic marketing copy (no lorem ipsum)
- SEO metadata (title, description, OG tags)

This is a SINGLE high-converting landing page, not a multi-page site.
Every section must have real, persuasive content that drives conversion.
The design must be premium, responsive, and visually impressive.

Return only JSON.`;
}

export function lpPlanPrompt(
  input: LPPromptInput,
  analysis: unknown,
  blueprint: unknown,
): string {
  return `Build a dynamic file plan for this Next.js 16 landing page project.

Original prompt: ${input.prompt}
Analysis: ${JSON.stringify(analysis)}
Blueprint: ${JSON.stringify(blueprint)}

This is a SINGLE landing page project. File count should be ~15-30 files:
- package.json, tsconfig.json, next.config.ts, tailwind.config.ts, postcss.config.js
- .eslintrc.json, .prettierrc, README.md
- app/layout.tsx, app/globals.css, app/page.tsx, app/not-found.tsx, app/loading.tsx, app/error.tsx
- lib/utils.ts, lib/seo.ts
- components/ui/button.tsx, components/ui/card.tsx, components/ui/input.tsx
- One component per section (components/sections/hero.tsx, components/sections/features.tsx, etc.)
- An API route for contact/lead form if applicable (app/api/contact/route.ts)

${PRODUCTION_ARCHITECTURE_GUIDE}

Every file must include: path, purpose, language, category (layout | lib | types | hooks | components | pages | api | configs)
Do not include file contents. Return only JSON.`;
}

export function lpFilePrompt(args: {
  input: LPPromptInput;
  analysis: unknown;
  blueprint: unknown;
  dynamicPlan: Record<string, unknown>;
  filePlan: { path: string; purpose: string; language: string; category: string };
  projectTree: unknown;
  existingFiles: unknown;
  validationReason?: string;
}): string {
  const validationNote = args.validationReason
    ? `\nPrevious attempt failed validation:\n${args.validationReason}\nFix all issues and regenerate this file correctly.`
    : "";

  const typeContext = getPageTypeContext(args.input.pageType);

  return `Generate exactly one production-ready file for this Next.js 16 landing page project.

Current file path: ${args.filePlan.path}
Current file purpose: ${args.filePlan.purpose}
Current file language: ${args.filePlan.language}
Current file category: ${args.filePlan.category}

Original prompt: ${args.input.prompt}
Page type: ${args.input.pageType}
Design style: ${args.input.designStyle}
Color style: ${args.input.colorStyle}
Analysis: ${JSON.stringify(args.analysis)}
Blueprint: ${JSON.stringify(args.blueprint)}
Dynamic project plan: ${JSON.stringify(args.dynamicPlan)}
Project tree: ${JSON.stringify(args.projectTree)}
Existing generated files: ${JSON.stringify(args.existingFiles)}
${validationNote}

${typeContext}

${PRODUCTION_ARCHITECTURE_GUIDE}
${FILE_GENERATION_RULES}

Landing Page specific rules:
- app/page.tsx is the main landing page — it imports and renders all section components in order.
- Each section component is self-contained with realistic, persuasive marketing copy.
- Use scroll animations or subtle transitions for polish.
- Hero must be full-viewport height with clear CTA.
- Responsive: mobile-first with breakpoints at sm, md, lg, xl.
- Use Tailwind CSS for all styling — no CSS modules or styled-components.
- SEO: metadata must include title, description, openGraph, and twitter card.
- No lorem ipsum, no placeholder text — use realistic business copy.`;
}
