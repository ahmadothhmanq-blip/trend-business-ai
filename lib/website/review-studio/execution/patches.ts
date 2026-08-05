import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { ReviewArea, StudioImprovement } from "@/lib/website/review-studio/types";

type PatchResult = { files: GeneratedProjectFile[]; change: string };

/**
 * Deterministic patches — no LLM, no full regeneration.
 */
export function applyDeterministicPatch(
  area: ReviewArea,
  files: GeneratedProjectFile[],
): PatchResult {
  switch (area) {
    case "accessibility":
      return patchAccessibility(files);
    case "seo":
      return patchSeo(files);
    case "performance":
      return patchPerformance(files);
    case "localization":
      return patchLocalization(files);
    case "navigation":
      return patchNavigation(files);
    case "footer":
      return patchFooter(files);
    default:
      return { files, change: `No deterministic patch for ${area}` };
  }
}

function patchFile(
  files: GeneratedProjectFile[],
  pathPattern: RegExp,
  transform: (content: string) => string,
): GeneratedProjectFile[] {
  return files.map((f) =>
    pathPattern.test(f.path) ? { ...f, content: transform(f.content) } : f,
  );
}

function patchAccessibility(files: GeneratedProjectFile[]): PatchResult {
  let changed = false;
  const patched = patchFile(files, /layout\.(tsx|jsx)|page\.(tsx|jsx)/i, (content) => {
    let next = content;
    if (!/\blang=/i.test(content) && /<html/i.test(content)) {
      next = next.replace(/<html/i, '<html lang="en"');
      changed = true;
    }
    if (!/<main\b/i.test(content) && /<body/i.test(content)) {
      next = next.replace(/<body([^>]*)>/i, "<body$1><main>");
      if (!/<\/main>/i.test(next)) next = next.replace(/<\/body>/i, "</main></body>");
      changed = true;
    }
    return next;
  });

  const cssPatched = patchFile(patched, /globals\.css/i, (content) => {
    if (!/:focus-visible/.test(content)) {
      changed = true;
      return `${content}\n:focus-visible { outline: 2px solid #0066ff; outline-offset: 2px; }\n`;
    }
    return content;
  });

  return {
    files: cssPatched,
    change: changed ? "Added lang, main landmark, and focus-visible styles" : "Accessibility already adequate",
  };
}

function patchSeo(files: GeneratedProjectFile[]): PatchResult {
  let changed = false;
  const patched = patchFile(files, /page\.(tsx|jsx)/i, (content) => {
    if (!/metadata|metaTitle|<title>/i.test(content)) {
      changed = true;
      return `export const metadata = { title: "Website", description: "Professional business website" };\n${content}`;
    }
    return content;
  });
  return {
    files: patched,
    change: changed ? "Added default SEO metadata export" : "SEO metadata already present",
  };
}

function patchPerformance(files: GeneratedProjectFile[]): PatchResult {
  let changed = false;
  const patched = patchFile(files, /\.(tsx|jsx|html)$/i, (content) => {
    return content.replace(/<img\b([^>]*?)(?:\s*\/)?>/gi, (match, attrs) => {
      if (/loading=/i.test(attrs)) return match;
      changed = true;
      return `<img${attrs} loading="lazy">`;
    });
  });
  return {
    files: patched,
    change: changed ? "Added lazy loading to images" : "Lazy loading already present",
  };
}

function patchLocalization(files: GeneratedProjectFile[]): PatchResult {
  let changed = false;
  const patched = patchFile(files, /layout\.(tsx|jsx)/i, (content) => {
    if (!/\blang=/i.test(content)) {
      changed = true;
      if (/<html/i.test(content)) {
        return content.replace(/<html/i, '<html lang="en"');
      }
      return `<html lang="en">\n${content}\n</html>`;
    }
    return content;
  });
  return {
    files: patched,
    change: changed ? "Set lang='en' on document" : "Language already declared",
  };
}

function patchNavigation(files: GeneratedProjectFile[]): PatchResult {
  let changed = false;
  const patched = patchFile(files, /layout\.(tsx|jsx)/i, (content) => {
    if (!/<nav\b/i.test(content)) {
      changed = true;
      const nav = '<nav aria-label="Main navigation"><a href="/">Home</a></nav>';
      if (/<body/i.test(content)) {
        return content.replace(/<body([^>]*)>/i, `<body$1>${nav}`);
      }
      return `${nav}\n${content}`;
    }
    return content;
  });
  return {
    files: patched,
    change: changed ? "Added navigation landmark" : "Navigation already present",
  };
}

function patchFooter(files: GeneratedProjectFile[]): PatchResult {
  let changed = false;
  const patched = patchFile(files, /layout\.(tsx|jsx)/i, (content) => {
    if (!/<footer\b/i.test(content)) {
      changed = true;
      const footer = "<footer><p>© 2026 Company. All rights reserved.</p></footer>";
      if (/<\/body>/i.test(content)) {
        return content.replace(/<\/body>/i, `${footer}</body>`);
      }
      return `${content}\n${footer}`;
    }
    return content;
  });
  return {
    files: patched,
    change: changed ? "Added footer section" : "Footer already present",
  };
}

export function applyImprovementToFiles(
  improvement: StudioImprovement,
  files: GeneratedProjectFile[],
): { files: GeneratedProjectFile[]; change: string } {
  if (improvement.patchType === "deterministic") {
    return applyDeterministicPatch(improvement.area, files);
  }
  return { files, change: `Targeted regen required for ${improvement.area}` };
}
