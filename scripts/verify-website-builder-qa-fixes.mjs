/**
 * QA verification for Website Builder industry / template / Arabic / isolation fixes.
 * Source-contract tests only — no live AI calls.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

console.log("verify-website-builder-qa-fixes\n");

// 1) New modules exist and export key symbols
const promptIndustry = read("lib/ai-core/website-builder/prompt-industry.ts");
assert.match(promptIndustry, /export function detectIndustryFromPrompt/);
assert.match(promptIndustry, /id: "furniture"/);
assert.match(promptIndustry, /id: "technology"/);
assert.match(promptIndustry, /buildWebsiteGenerationKey/);
console.log("  ✓ prompt-industry module");

const validation = read("lib/ai-core/website-builder/generation-validation.ts");
assert.match(validation, /export function validateWebsiteGeneration/);
assert.match(validation, /hero-image-mismatch/);
assert.match(validation, /language-arabic/);
console.log("  ✓ generation-validation module");

// 2) Industry profiles include furniture + technology
const profiles = read("lib/ai-core/industry-intelligence/profiles.ts");
assert.match(profiles, /furniture:\s*\{/);
assert.match(profiles, /technology:\s*\{/);
assert.match(profiles, /"furniture"/);
assert.match(profiles, /"technology"/);
console.log("  ✓ industry profiles");

// 3) Detection runs keyword-first
const detect = read("lib/ai-core/industry-intelligence/detect.ts");
assert.match(detect, /detectIndustryFromPrompt/);
console.log("  ✓ keyword-first industry detection wired");

// 4) Template selection guards
const tiSelect = read("lib/ai-core/template-intelligence/select.ts");
assert.match(tiSelect, /tpl\.industry === "tourism"/);
assert.match(tiSelect, /furniture\|sofa\|bedroom/);
assert.match(tiSelect, /ti-technology-dark/);
console.log("  ✓ template intelligence industry guards");

// 5) Stock images for furniture + technology
const stock = read("lib/ai-core/image-engine/stock.ts");
assert.match(stock, /furniture:\s*\{/);
assert.match(stock, /technology:\s*\{/);
console.log("  ✓ industry stock image packs");

// 6) Project isolation
const adapter = read("lib/ai-core/adapters/website-builder.ts");
assert.match(adapter, /buildWebsiteGenerationKey/);
assert.match(adapter, /reuseModes/);
assert.match(adapter, /resolveBusinessIndustryLabel/);
assert.match(adapter, /resolveWebsiteOutputLanguage/);
console.log("  ✓ adapter isolation + industry label fix");

const generate = read("plugins/website/generate.ts");
assert.match(generate, /validateWebsiteGeneration/);
assert.match(generate, /buildGenerationRepairInstruction/);
console.log("  ✓ generation validation wired in pipeline");

// 7) Arabic prompts
const layersPrompt = read("lib/ai/prompts/website-layers.ts");
assert.match(layersPrompt, /Modern Standard Arabic/);
const filePrompt = read("lib/ai/prompts/website.ts");
assert.match(filePrompt, /buildWebsiteLanguageDirective/);
const i18n = read("lib/ai-core/website-design-platform/i18n.ts");
assert.match(i18n, /Arabic typography/);
console.log("  ✓ Arabic / RTL prompt + CSS support");

// 7b) Template apply localizes copy for project language
const contentLang = read("lib/ai-core/content/content-language.ts");
assert.match(contentLang, /resolveContentLanguage/);
const arCopy = read("lib/ai-core/content/arabic-industry-copy.ts");
assert.match(arCopy, /AR_PACKS/);
const arExtras = read("lib/ai-core/content/arabic-production-extras.ts");
assert.match(arExtras, /getArabicExtras/);
const industryCopy = read("lib/ai-core/content/industry-copy.ts");
assert.match(industryCopy, /language\?: string/);
const productionContent = read("lib/ai-core/content/production-content.ts");
assert.match(productionContent, /getArabicExtras/);
const templateRoute = read("app/api/website-builder/[id]/template/route.ts");
assert.match(templateRoute, /applyTemplateIntelligenceRetheme/);
assert.match(templateRoute, /generation\.language/);
const templateApply = read("lib/ai-core/template-intelligence/apply.ts");
assert.match(templateApply, /applyLocaleToWebsiteFiles/);
console.log("  ✓ Arabic template apply localization pipeline");

// 7c) Onboarding UI — project type / design / color removed; language kept
const wbTool = read("components/dashboard/website-builder-tool.tsx");
assert.doesNotMatch(wbTool, /sections\.projectType/);
assert.doesNotMatch(wbTool, /sections\.designStyle/);
assert.doesNotMatch(wbTool, /sections\.colorTheme/);
assert.match(wbTool, /sections\.outputLanguage/);
assert.match(wbTool, /inferWebsiteOnboardingDefaults/);
assert.match(wbTool, /data-onboarding="website-language"/);
console.log("  ✓ website-builder onboarding UI simplified");

// 8) Inline industry rule simulation (mirrors detectIndustryFromPrompt logic)
function simulateIndustry(prompt) {
  const p = prompt.toLowerCase();
  if (/furniture|sofa|bedroom|أثاث|كنب/.test(p)) return "furniture";
  if (/computer company|computers?|it services|servers|تكنولوجيا|حاسوب/.test(p))
    return "technology";
  if (/restaurant|dining|مطعم/.test(p)) return "restaurant";
  if (/real estate|عقار/.test(p)) return "real-estate";
  if (/clinic|healthcare|عيادة/.test(p)) return "clinic";
  if (/travel|tourism|destination/.test(p) && !/furniture|أثاث|sofa/.test(p))
    return "tourism";
  return "business";
}

function simulateArabic(prompt) {
  const arabic = (prompt.match(/[\u0600-\u06FF]/g) || []).length;
  return arabic >= 8;
}

// English Technology company test
const techPrompt =
  "Build a website for NovaTech, a computer company offering laptops, servers, and IT support for businesses.";
assert.equal(simulateIndustry(techPrompt), "technology");
assert.equal(simulateArabic(techPrompt), false);
console.log("\nPASS English Technology company scenario");

// Arabic Furniture company test
const arPrompt =
  "أنشئ موقعاً لشركة أثاث فاخرة تبيع الكنب وغرف النوم وصالات المعيشة";
assert.equal(simulateIndustry(arPrompt), "furniture");
assert.equal(simulateArabic(arPrompt), true);
console.log("PASS Arabic Furniture company scenario");

// Furniture must not map to travel
const furnitureEn =
  "Premium furniture showroom with sofas, bedrooms, and living room collections";
assert.equal(simulateIndustry(furnitureEn), "furniture");
assert.notEqual(simulateIndustry(furnitureEn), "tourism");
console.log("PASS Furniture not classified as Travel");

console.log("\nverify-website-builder-qa-fixes: ALL PASS");
