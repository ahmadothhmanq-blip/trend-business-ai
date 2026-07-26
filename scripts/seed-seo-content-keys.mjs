#!/usr/bin/env node
/**
 * Seed seoContent.* keys in en.json from SEO catalogs (blog, countries, industries, programmatic).
 */
import fs from "node:fs";
import path from "node:path";

const LOCALES_DIR = path.join(process.cwd(), "locales");
const enPath = path.join(LOCALES_DIR, "en.json");

const seoContent = {
  blog: {
    "ai-business-platform-vs-fragmented-tools": {
      title: "Why an All-in-One AI Business Platform Beats Fragmented Tools",
      description:
        "How founders save time by replacing disconnected AI chats with one authenticated workspace for websites, brand, content and business intelligence.",
      body: [
        "Most teams start with a pile of disconnected AI chats: one tab for website copy, another for logos, another for market research. The result is context loss, inconsistent brand language, and assets that never land in a private workspace.",
        "Trend Business AI is built as one platform across Create, Design, Content and Business. You describe a brief once, generate structured outputs, save them to your authenticated dashboard, and export when you are ready to execute.",
        "That architecture matters for SEO and operations alike. Public product pages map cleanly to real tools, while private generation stays behind authentication — so marketing surfaces stay indexable without exposing customer work.",
        "If you are evaluating AI tools for a startup or agency, prefer a workspace that stores history, supports exports, and covers the full journey from idea to launch assets — not a temporary chat transcript.",
      ],
    },
  },
  countries: {
    "united-states": {
      name: "United States",
      title: "AI Business Platform for United States Teams",
      description:
        "Plan products, websites, marketing and strategy with an AI workspace tuned for US founders and operators.",
    },
    "united-kingdom": {
      name: "United Kingdom",
      title: "AI Business Platform for United Kingdom Teams",
      description:
        "Build market analyses, brand systems and launch pages with AI workflows suited to UK businesses.",
    },
    "united-arab-emirates": {
      name: "United Arab Emirates",
      title: "AI Business Platform for UAE Teams",
      description:
        "Accelerate planning, branding and digital product workflows for startups and enterprises in the UAE.",
    },
    "saudi-arabia": {
      name: "Saudi Arabia",
      title: "AI Business Platform for Saudi Arabia Teams",
      description:
        "Generate business plans, websites and marketing systems for teams building in Saudi Arabia.",
    },
    canada: {
      name: "Canada",
      title: "AI Business Platform for Canadian Teams",
      description:
        "Use Trend Business AI to research markets, design brands and generate downloadable website source projects for Canadian companies.",
    },
  },
  industries: {
    saas: {
      name: "SaaS",
      title: "AI Business Tools for SaaS Companies",
      description:
        "Plan positioning, websites, content systems and go-to-market workflows for SaaS products with Trend Business AI.",
    },
    ecommerce: {
      name: "Ecommerce",
      title: "AI Growth Stack for Ecommerce Brands",
      description:
        "Generate store messaging, landing pages, creative assets and market analysis tailored to ecommerce operators.",
    },
    agencies: {
      name: "Agencies",
      title: "AI Delivery Suite for Digital Agencies",
      description:
        "Speed up client branding, websites, content calendars and strategy decks with agency-ready AI workflows.",
    },
    startups: {
      name: "Startups",
      title: "AI Planning Workspace for Startups",
      description:
        "Validate ideas, analyze markets, generate launch-site source projects, and package investor-ready narratives in one AI workspace.",
    },
    consultancies: {
      name: "Consultancies",
      title: "AI Research & Strategy for Consultancies",
      description:
        "Produce structured market analyses, feasibility studies and client strategy deliverables faster with AI.",
    },
  },
  programmatic: {
    "use-case-startup-website": {
      title: "AI Website Builder for Startups",
      description:
        "Plan and generate startup website source projects with Trend Business AI — positioning, page architecture, and ZIP export for self-hosting.",
      body: [
        "Startups need clarity fast: who you serve, what you sell, and how the site converts visitors into trials or demos.",
        "Use Trend Business AI to draft information architecture, homepage messaging, pricing page outlines and launch checklists in one workspace.",
        "Pair website generation with feasibility and market analysis so your narrative matches real demand signals.",
      ],
    },
    "use-case-agency-branding": {
      title: "AI Brand Studio for Agencies",
      description:
        "Produce logos, brand systems and client-ready identity concepts faster with AI brand workflows built for agency delivery timelines.",
      body: [
        "Agencies juggle multiple brand systems at once. Trend Business AI helps teams move from brief to direction without starting from a blank canvas.",
        "Generate logo concepts, palette systems and verbal identity drafts, then refine with your creative leadership.",
        "Connect brand outputs to website and content workflows so every deliverable stays on-message.",
      ],
    },
    "use-case-content-engine": {
      title: "AI Content Engine for Growth Teams",
      description:
        "Build a repeatable content system for blogs, social and campaigns with AI drafting, calendars and channel-ready packaging.",
      body: [
        "Growth teams need consistent publishing without sacrificing quality or brand voice.",
        "Use Content Studio and Marketing AI to plan themes, draft assets and schedule distribution across channels.",
        "Internal linking across product, blog and resource pages helps compound organic discovery over time.",
      ],
    },
    "comparison-ai-business-suite": {
      title: "All-in-One AI Business Suite vs Fragmented Tools",
      description:
        "See how a unified AI business platform compares to juggling separate chat tools for websites, design and marketing.",
      body: [
        "Fragmented AI tools create context loss: one chat for copy, another for design, another for strategy.",
        "Trend Business AI consolidates planning, creation and analysis so teams keep a single source of truth.",
        "Choose a suite when you need connected workflows, shared history and consistent brand execution.",
      ],
    },
    "service-seo-growth": {
      title: "SEO Growth System for AI-Powered Brands",
      description:
        "Technical SEO foundations, structured data, content clusters and internal linking designed for sustainable organic growth.",
      body: [
        "Organic growth compounds when technical SEO, content quality and internal linking work together.",
        "Trend Business AI ships metadata, sitemaps, JSON-LD and programmatic foundations as part of the product surface.",
        "Use the SEO Health Dashboard to monitor coverage, then expand published clusters deliberately.",
      ],
    },
    "service-go-to-market": {
      title: "AI Go-To-Market Planning Service",
      description:
        "Align positioning, messaging, landing pages and launch content with an AI-assisted go-to-market workspace.",
      body: [],
    },
  },
};

const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
en.seoContent = seoContent;
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + "\n");
console.log("Seeded seoContent keys in en.json");
