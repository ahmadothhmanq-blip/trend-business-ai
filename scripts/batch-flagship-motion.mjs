#!/usr/bin/env node
/**
 * Adds df-reveal / df-reveal-stagger / df-hero-stagger across flagship template sections.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const componentsDir = path.join(root, "templates/website");

function walkTsx(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkTsx(full, out);
    else if (entry.name.endsWith(".tsx")) out.push(full);
  }
  return out;
}

const REVEAL_EXISTS = /\b(df-reveal|hr-reveal|mp-reveal|rep-reveal|as-reveal|se-reveal|cb-reveal|fn-reveal|ct-reveal|sv-reveal|ec-reveal|ed-reveal)\b/;
const STAGGER_EXISTS = /\b(df-reveal-stagger|hr-reveal-stagger|mp-reveal-stagger|rep-reveal-stagger)\b/;
const HERO_STAGGER_EXISTS = /\bdf-hero-stagger\b/;

const SECTION_SUFFIX =
  /-(features|about|portfolio|pricing|contact|faq|testimonials|integrations|stats|utility-band|floating-cta)\.tsx$/;

function patchSectionClassNames(content, file) {
  if (file.endsWith("-hero.tsx")) {
    if (HERO_STAGGER_EXISTS.test(content)) return content;
    return content.replace(
      /(<div className=")([^"]*)(">\s*\n\s*(?:\{eyebrow|\{title|<p className="[^"]*eyebrow))/,
      (m, a, cls, c) => {
        if (cls.includes("hero-stagger") || cls.includes("hero-grid")) return m;
        if (!cls.includes("hr-hero-stagger") && !cls.includes("as-hero") && !cls.includes("df-hero-stagger")) {
          return `${a}df-hero-stagger ${cls}${c}`;
        }
        return m;
      },
    );
  }

  if (!SECTION_SUFFIX.test(file) && !file.includes("section-shell")) return content;

  let next = content.replace(
    /(<section\b[^>]*\bclassName=")([^"]*)(")/g,
    (_, open, cls, close) => {
      if (REVEAL_EXISTS.test(cls)) return `${open}${cls}${close}`;
      return `${open}df-reveal ${cls}${close}`;
    },
  );

  next = next.replace(
    /(<section\b[^>]*\bclassName=\{`)([^`]*)(`\})/g,
    (_, open, cls, close) => {
      if (REVEAL_EXISTS.test(cls)) return `${open}${cls}${close}`;
      return `${open}df-reveal ${cls}${close}`;
    },
  );

  next = next.replace(
    /className="([^"]*\bgrid\b[^"]*\bgap-[^"]*)"/g,
    (match, cls) => {
      if (STAGGER_EXISTS.test(cls) || cls.includes("hr-reveal-stagger") || cls.includes("mp-reveal-stagger")) {
        return match;
      }
      if (cls.includes("df-reveal-stagger")) return match;
      return `className="df-reveal-stagger ${cls}"`;
    },
  );

  return next;
}

function patchNav(content, file) {
  if (!file.endsWith("-nav.tsx")) return content;
  if (content.includes("df-animate-nav")) return content;
  return content.replace(
    /className=\{`([^`]*nav-bar[^`]*)`\}/,
    (m, cls) => `className={\`df-animate-nav ${cls}\`}`,
  ).replace(
    /className="([^"]*nav[^"]*bar[^"]*)"/,
    (m, cls) => {
      if (cls.includes("df-animate-nav")) return m;
      return `className="df-animate-nav ${cls}"`;
    },
  );
}

function patchFooter(content, file) {
  if (!file.endsWith("-footer.tsx")) return content;
  if (content.includes("FlagshipRevealInit")) return content;

  let next = content;
  if (!next.includes("flagship-reveal-init")) {
    next = next.replace(
      /("use client";\s*\n)/,
      `$1\nimport { FlagshipRevealInit } from "@/lib/website/template-v2/motion/flagship-reveal-init";\n`,
    );
  }

  if (next.includes("useFlagshipReveal") || next.includes("IntersectionObserver")) {
    next = next.replace(/\nimport \{ useEffect[^}]+\} from "react";\n/, "\n");
    next = next.replace(
      /\n  useEffect\(\(\) => \{[\s\S]*?IntersectionObserver[\s\S]*?\}, \[\]\);\n/,
      "\n",
    );
  }

  if (next.includes("return (\n    <footer")) {
    next = next.replace(
      /return \(\n    <footer/,
      "return (\n    <>\n      <FlagshipRevealInit />\n      <footer",
    );
    next = next.replace(/\n    <\/footer>\n  \);\n\}/, "\n    </footer>\n    </>\n  );\n}");
  } else if (next.includes("return (\n    <>\n")) {
    // already fragment
  }

  return next;
}

let changed = 0;
const files = walkTsx(componentsDir);

const unique = [...new Set(files)];
for (const file of unique) {
  const base = path.basename(file);
  let content = fs.readFileSync(file, "utf8");
  const original = content;
  content = patchSectionClassNames(content, base);
  content = patchNav(content, base);
  content = patchFooter(content, base);
  if (content !== original) {
    fs.writeFileSync(file, content);
    changed++;
    console.log("patched", path.relative(root, file));
  }
}

console.log(`Done. ${changed} files updated.`);
