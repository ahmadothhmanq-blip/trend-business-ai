/**
 * Website Builder language pipeline verification (no live LLM calls).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

// Mirror of extractUserFacingCopyFromSource / isCopyBearingWebsiteFile for CI-safe checks
function countArabic(text) {
  return (text.match(/[\u0600-\u06FF]/g) || []).length;
}

function extractCopy(content) {
  const parts = [];
  for (const m of content.matchAll(/>([^<>{}]+)</g)) {
    const t = (m[1] || "").trim();
    if (t.length >= 2) parts.push(t);
  }
  for (const m of content.matchAll(/(?:title|label|placeholder)\s*=\s*["']([^"']+)["']/gi)) {
    if (m[1]) parts.push(m[1]);
  }
  return parts.join("\n");
}

function isCopyBearing(path) {
  if (/components\/ui\/(button|card|input|motion|section-shell)\.tsx$/i.test(path)) {
    return false;
  }
  if (/components\/(sections|layout)\//i.test(path)) return true;
  if (/page\.tsx$/i.test(path)) return true;
  if (/layout\.tsx$/i.test(path)) return true;
  return false;
}

const buttonPrimitive = `export function Button({ children }: { children: React.ReactNode }) {
  return <button className="rounded px-4 py-2">{children}</button>;
}`;

const arabicHero = `export function HeroLuxury() {
  return (
    <section>
      <h1>حلول احترافية لمطعمكم</h1>
      <p>نقدم تجربة طعام فاخرة في قلب المدينة.</p>
      <a href="#contact">احجز طاولتك</a>
    </section>
  );
}`;

const englishHero = `export function HeroLuxury() {
  return <section><h1>Professional solutions</h1><a>Get started</a></section>;
}`;

assert.equal(isCopyBearing("components/ui/button.tsx"), false);
assert.equal(isCopyBearing("components/sections/HeroLuxury.tsx"), true);
assert.equal(countArabic(extractCopy(buttonPrimitive)), 0);
assert.ok(countArabic(extractCopy(arabicHero)) >= 12);
assert.ok(countArabic(extractCopy(englishHero)) < 12);

const llmLanguage = read("lib/ai-core/website-builder/llm-language.ts");
assert.match(llmLanguage, /isCopyBearingWebsiteFile/);
assert.match(llmLanguage, /extractUserFacingCopyFromSource/);
assert.match(llmLanguage, /normalizeWebsiteCopyText/);
assert.doesNotMatch(llmLanguage, /SKIP_LANGUAGE_VALIDATION\.add\("file-generation"\)/);

const websitePrompt = read("lib/ai/prompts/website.ts");
assert.match(websitePrompt, /summarizeStrategyForFilePrompt/);
assert.match(websitePrompt, /isCopyBearingWebsiteFile/);

const llmCalls = read("lib/ai-core/website-builder/llm-calls.ts");
assert.match(llmCalls, /transformRetryPrompt/);
assert.match(llmCalls, /buildWebsiteLanguageDirective/);

const generator = read("lib/ai/generator.ts");
assert.match(generator, /transformRetryPrompt/);

const languageDirective = read("lib/ai-core/website-builder/language-directive.ts");
assert.match(languageDirective, /Do NOT output English headings/);

const industries = [
  "restaurant",
  "clinic",
  "law",
  "education",
  "agency",
  "landing-page",
  "technology",
  "business",
];

for (const industry of industries) {
  const sample = `export default function Page() {
    return <main><h1>خدمات ${industry} المتميزة</h1><p>تواصل معنا اليوم</p></main>;
  }`;
  assert.ok(
    countArabic(extractCopy(sample)) >= 12,
    `Arabic sample failed for ${industry}`,
  );
}

console.log("verify-website-builder-language: PASS");
