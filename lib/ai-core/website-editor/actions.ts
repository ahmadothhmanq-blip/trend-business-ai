/**
 * Apply structured WebsiteEditAction[] to generated project files.
 */

import { composeHomePage } from "@/lib/ai-core/components/compose";
import {
  getProfessionalScaffoldById,
  getProfessionalScaffoldByPath,
  listProfessionalScaffoldPaths,
} from "@/lib/ai-core/components/scaffolds";
import { DESIGN_RENDERER_COMPONENTS } from "@/lib/ai-core/design-renderer/components";
import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";
import { getBrandPreset, normalizeBrandPresetId } from "@/lib/ai-core/brand-identity/presets";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type {
  WebsiteEditAction,
  WebsiteUnderstanding,
} from "@/lib/ai-core/website-editor/types";

function isComponentId(id: string): id is DesignRendererComponentId {
  return id in DESIGN_RENDERER_COMPONENTS;
}

function upsertFile(
  files: GeneratedProjectFile[],
  path: string,
  content: string,
  language = "typescript",
): GeneratedProjectFile[] {
  const normalized = path.replace(/\\/g, "/");
  const idx = files.findIndex((f) => f.path.replace(/\\/g, "/") === normalized);
  if (idx >= 0) {
    const next = [...files];
    next[idx] = { ...next[idx]!, content, language: next[idx]!.language || language };
    return next;
  }
  return [...files, { path: normalized, content, language }];
}

function setCssVar(css: string, name: string, value: string): string {
  const re = new RegExp(`(--${name}\\s*:\\s*)([^;]+)(;)`, "i");
  if (re.test(css)) return css.replace(re, `$1${value}$3`);
  // Inject into :root if present
  if (/:root\s*\{/.test(css)) {
    return css.replace(/:root\s*\{/, `:root {\n  --${name}: ${value};`);
  }
  return `${css}\n:root { --${name}: ${value}; }\n`;
}

function findGlobals(files: GeneratedProjectFile[]): GeneratedProjectFile | undefined {
  return files.find((f) =>
    /globals\.css$/i.test(f.path.replace(/\\/g, "/")),
  );
}

function findHome(files: GeneratedProjectFile[]): GeneratedProjectFile | undefined {
  return (
    files.find((f) => f.path.replace(/\\/g, "/") === "app/page.tsx") ||
    files.find((f) => /app\/page\.tsx$/i.test(f.path.replace(/\\/g, "/")))
  );
}

function ensureScaffold(
  files: GeneratedProjectFile[],
  componentId: string,
): GeneratedProjectFile[] {
  if (!isComponentId(componentId)) return files;
  const spec = DESIGN_RENDERER_COMPONENTS[componentId];
  const scaffold = getProfessionalScaffoldById(componentId);
  if (!scaffold || !spec) return files;
  let next = upsertFile(files, spec.path, scaffold, "typescript");
  for (const path of listProfessionalScaffoldPaths([componentId])) {
    if (path === spec.path) continue;
    const helper = getProfessionalScaffoldByPath(path);
    if (helper) {
      next = upsertFile(next, path, helper, "typescript");
    }
  }
  return next;
}

function rebuildHomePage(
  files: GeneratedProjectFile[],
  componentIds: string[],
  understanding: WebsiteUnderstanding,
): GeneratedProjectFile[] {
  const content = composeHomePage({
    componentIds,
    brandName: understanding.brandName,
    title: `${understanding.brandName} — Professional website`,
    description: understanding.summary,
  });
  return upsertFile(files, "app/page.tsx", content, "typescript");
}

function applyLuxuryTokens(files: GeneratedProjectFile[]): {
  files: GeneratedProjectFile[];
  note: string;
} {
  const globals = findGlobals(files);
  if (!globals) return { files, note: "No globals.css to apply luxury tokens" };
  let css = globals.content;
  const luxury = getBrandPreset("luxury-brand");
  css = setCssVar(css, "color-primary", luxury.colors.primary);
  css = setCssVar(css, "color-secondary", luxury.colors.secondary);
  css = setCssVar(css, "color-accent", luxury.colors.accent);
  css = setCssVar(css, "color-background", luxury.colors.background);
  css = setCssVar(css, "color-foreground", luxury.colors.foreground);
  css = setCssVar(css, "font-heading", `"${luxury.typography.headingFont}", Georgia, serif`);
  css = setCssVar(css, "font-display", `"${luxury.typography.displayFont}", Georgia, serif`);
  css = setCssVar(css, "section-y", luxury.spacing.sectionY);
  css = setCssVar(css, "duration-slow", "1100ms");
  return {
    files: upsertFile(files, globals.path, css, "css"),
    note: "Applied Luxury Brand color, type, and spacing tokens",
  };
}

function applyStylePreset(
  files: GeneratedProjectFile[],
  style: string,
): { files: GeneratedProjectFile[]; note: string } {
  const presetId =
    normalizeBrandPresetId(style) ||
    normalizeBrandPresetId(`${style}-brand`) ||
    (style.includes("saas") ? "premium-saas-brand" : null);
  if (!presetId) {
    return { files, note: `Unknown style “${style}” — skipped token restyle` };
  }
  const preset = getBrandPreset(presetId);
  const globals = findGlobals(files);
  if (!globals) return { files, note: "No globals.css for style preset" };
  let css = globals.content;
  css = setCssVar(css, "color-primary", preset.colors.primary);
  css = setCssVar(css, "color-secondary", preset.colors.secondary);
  css = setCssVar(css, "color-accent", preset.colors.accent);
  css = setCssVar(css, "color-background", preset.colors.background);
  css = setCssVar(css, "color-foreground", preset.colors.foreground);
  css = setCssVar(css, "font-heading", `"${preset.typography.headingFont}", sans-serif`);
  css = setCssVar(css, "font-body", `"${preset.typography.bodyFont}", sans-serif`);
  css = setCssVar(css, "section-y", preset.spacing.sectionY);
  return {
    files: upsertFile(files, globals.path, css, "css"),
    note: `Applied ${preset.label} design tokens`,
  };
}

/**
 * Apply editor actions that can be done structurally / via design tokens.
 */
export function applyWebsiteEditActions(params: {
  files: GeneratedProjectFile[];
  actions: WebsiteEditAction[];
  understanding: WebsiteUnderstanding;
}): {
  files: GeneratedProjectFile[];
  applied: WebsiteEditAction[];
  notes: string[];
  pendingAiActions: WebsiteEditAction[];
} {
  let files = [...params.files];
  const applied: WebsiteEditAction[] = [];
  const notes: string[] = [];
  const pendingAiActions: WebsiteEditAction[] = [];
  let order = [...params.understanding.homeComponentOrder];

  // Ensure header/footer anchors
  if (!order.some((n) => /header|nav/i.test(n))) order.unshift("SiteHeader");
  if (!order.some((n) => /footer/i.test(n))) order.push("SiteFooter");

  for (const action of params.actions) {
    switch (action.type) {
      case "add-section": {
        const id = action.componentId || action.target;
        if (!id || !isComponentId(id)) {
          notes.push(`Skip add-section: unknown component ${id}`);
          break;
        }
        files = ensureScaffold(files, id);
        // Skip structural insert if already on home once (NL editor path).
        // Marketplace "additional" notes or explicit toIndex force another insert.
        const forceInsert =
          typeof action.toIndex === "number" ||
          Boolean(action.notes?.toLowerCase().includes("additional"));
        if (order.includes(id) && !forceInsert) {
          applied.push(action);
          notes.push(`${id} already on home`);
          break;
        }
        const footerIdx = order.findIndex((n) => /footer/i.test(n));
        const ctaIdx = order.findIndex((n) => /^Cta/i.test(n));
        const insertAt =
          typeof action.toIndex === "number"
            ? Math.max(0, Math.min(action.toIndex, order.length))
            : ctaIdx >= 0
              ? ctaIdx
              : footerIdx >= 0
                ? footerIdx
                : order.length;
        order = [...order.slice(0, insertAt), id, ...order.slice(insertAt)];
        files = rebuildHomePage(files, order, params.understanding);
        applied.push(action);
        notes.push(`Added section ${id}`);
        break;
      }
      case "remove-section": {
        const target = action.target;
        if (!target) {
          notes.push("Skip remove-section: no target");
          break;
        }
        if (/hero|header|footer/i.test(target) && !/testimonial|trust/i.test(target)) {
          // Allow removing non-hero; block removing sole hero/header/footer lightly
          if (/^Hero|^SiteHeader|^SiteFooter|^Nav/i.test(target)) {
            notes.push(`Protected component not removed: ${target}`);
            break;
          }
        }
        const before = order.length;
        order = order.filter((n) => n !== target);
        if (order.length === before) {
          notes.push(`Section not on home: ${target}`);
          break;
        }
        files = rebuildHomePage(files, order, params.understanding);
        applied.push(action);
        notes.push(`Removed section ${target}`);
        break;
      }
      case "replace-section": {
        const from = action.target;
        const to = action.replaceWith || action.componentId;
        if (!to || !isComponentId(to)) {
          notes.push(`Skip replace: invalid target ${to}`);
          break;
        }
        files = ensureScaffold(files, to);
        if (from && order.includes(from)) {
          order = order.map((n) => (n === from ? to : n));
        } else if (/hero/i.test(to)) {
          const heroIdx = order.findIndex((n) => /hero/i.test(n));
          if (heroIdx >= 0) order[heroIdx] = to;
          else order.splice(1, 0, to);
        } else {
          order.push(to);
        }
        // Deduplicate while preserving order
        order = order.filter((n, i) => order.indexOf(n) === i);
        files = rebuildHomePage(files, order, params.understanding);
        applied.push(action);
        notes.push(`Replaced ${from || "section"} with ${to}`);
        break;
      }
      case "duplicate-section": {
        const target = action.target || action.componentId;
        if (!target) {
          notes.push("Skip duplicate-section: no target");
          break;
        }
        const idx = order.findIndex((n) => n === target);
        if (idx < 0) {
          notes.push(`Section not on home: ${target}`);
          break;
        }
        if (isComponentId(target)) files = ensureScaffold(files, target);
        order = [
          ...order.slice(0, idx + 1),
          target,
          ...order.slice(idx + 1),
        ];
        files = rebuildHomePage(files, order, params.understanding);
        applied.push(action);
        notes.push(`Duplicated section ${target}`);
        break;
      }
      case "reorder-sections": {
        let nextOrder: string[] | null = null;
        if (action.value?.trim()) {
          try {
            const parsed = JSON.parse(action.value) as unknown;
            if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
              nextOrder = parsed as string[];
            } else {
              nextOrder = action.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            }
          } catch {
            nextOrder = action.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          }
        } else if (
          typeof action.fromIndex === "number" &&
          typeof action.toIndex === "number"
        ) {
          const from = action.fromIndex;
          const to = action.toIndex;
          if (
            from >= 0 &&
            from < order.length &&
            to >= 0 &&
            to < order.length &&
            from !== to
          ) {
            const copy = [...order];
            const [item] = copy.splice(from, 1);
            if (item) copy.splice(to, 0, item);
            nextOrder = copy;
          }
        }
        if (!nextOrder?.length) {
          notes.push("Skip reorder-sections: invalid order");
          break;
        }
        // Keep only known home components; append missing anchors
        const known = new Set(order);
        nextOrder = nextOrder.filter((n) => known.has(n));
        for (const n of order) {
          if (!nextOrder.includes(n)) nextOrder.push(n);
        }
        order = nextOrder;
        files = rebuildHomePage(files, order, params.understanding);
        applied.push(action);
        notes.push(`Reordered ${order.length} sections`);
        break;
      }
      case "update-text": {
        const target = action.target;
        const text = action.value?.trim();
        if (!target || !text) {
          notes.push("Skip update-text: need target + value");
          break;
        }
        const section = params.understanding.sections.find(
          (s) => s.exportName === target,
        );
        const file = section
          ? files.find(
              (f) => f.path.replace(/\\/g, "/") === section.path.replace(/\\/g, "/"),
            )
          : undefined;
        if (!file) {
          pendingAiActions.push({
            type: "rewrite-content",
            target,
            notes: `Update copy for ${target}: ${text}`,
          });
          notes.push(`Queued text update for AI: ${target}`);
          break;
        }
        let content = file.content;
        const escaped = text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        if (/<h1\b[^>]*>[\s\S]*?<\/h1>/i.test(content)) {
          content = content.replace(
            /(<h1\b[^>]*>)([\s\S]*?)(<\/h1>)/i,
            `$1${escaped}$3`,
          );
        } else if (/<h2\b[^>]*>[\s\S]*?<\/h2>/i.test(content)) {
          content = content.replace(
            /(<h2\b[^>]*>)([\s\S]*?)(<\/h2>)/i,
            `$1${escaped}$3`,
          );
        } else if (/title:\s*["'`][^"'`]+["'`]/i.test(content)) {
          content = content.replace(
            /(title:\s*["'`])([^"'`]+)(["'`])/i,
            `$1${text.replace(/['"`]/g, "")}$3`,
          );
        } else {
          pendingAiActions.push({
            type: "rewrite-content",
            target,
            notes: `Update copy for ${target}: ${text}`,
          });
          notes.push(`No editable heading found in ${target}`);
          break;
        }
        files = upsertFile(files, file.path, content, file.language || "tsx");
        applied.push(action);
        notes.push(`Updated text in ${target}`);
        break;
      }
      case "update-image": {
        const target = action.target;
        const url = action.value?.trim();
        if (!target || !url) {
          notes.push("Skip update-image: need target + value");
          break;
        }
        const section = params.understanding.sections.find(
          (s) => s.exportName === target,
        );
        const file = section
          ? files.find(
              (f) =>
                f.path.replace(/\\/g, "/") ===
                section.path.replace(/\\/g, "/"),
            )
          : undefined;
        if (!file) {
          pendingAiActions.push({
            type: "rewrite-content",
            target,
            notes: `Replace image in ${target} with ${url}`,
          });
          notes.push(`Queued image update for AI: ${target}`);
          break;
        }
        let content = file.content;
        if (/src=\{?["'][^"']+["']\}?/.test(content)) {
          content = content.replace(
            /src=\{?["'][^"']+["']\}?/,
            `src=${JSON.stringify(url)}`,
          );
        } else if (/imageUrl[=:]\s*["'][^"']+["']/.test(content)) {
          content = content.replace(
            /imageUrl[=:]\s*["'][^"']+["']/,
            `imageUrl=${JSON.stringify(url)}`,
          );
        } else {
          pendingAiActions.push({
            type: "rewrite-content",
            target,
            notes: `Replace image in ${target} with ${url}`,
          });
          notes.push(`No image src found in ${target}`);
          break;
        }
        files = upsertFile(files, file.path, content, file.language || "tsx");
        applied.push(action);
        notes.push(`Updated image in ${target}`);
        break;
      }
      case "improve-luxury": {
        const result = applyLuxuryTokens(files);
        files = result.files;
        // Prefer cinematic hero when improving luxury
        const heroIdx = order.findIndex((n) => /hero/i.test(n));
        if (heroIdx >= 0 && order[heroIdx] !== "HeroCinematic" && order[heroIdx] !== "HeroLuxury") {
          files = ensureScaffold(files, "HeroCinematic");
          order[heroIdx] = "HeroCinematic";
          files = rebuildHomePage(files, order, params.understanding);
          notes.push("Swapped hero to HeroCinematic for luxury presence");
        }
        applied.push(action);
        notes.push(result.note);
        pendingAiActions.push({
          type: "rewrite-content",
          notes: "Polish copy for luxury voice",
        });
        break;
      }
      case "change-design-style": {
        const result = applyStylePreset(files, action.value || "modern");
        files = result.files;
        applied.push(action);
        notes.push(result.note);
        pendingAiActions.push({
          type: "restyle-section",
          notes: `Continue AI restyle toward ${action.value}`,
        });
        break;
      }
      case "update-colors": {
        const globals = findGlobals(files);
        if (!globals) {
          notes.push("No globals.css for color update");
          break;
        }
        let css = globals.content;
        if (action.value) {
          const slot =
            action.target === "secondary"
              ? "color-secondary"
              : action.target === "accent"
                ? "color-accent"
                : action.target === "background"
                  ? "color-background"
                  : action.target === "foreground"
                    ? "color-foreground"
                    : "color-primary";
          css = setCssVar(css, slot, action.value);
          if (slot === "color-primary" && !action.target) {
            css = setCssVar(css, "color-accent", action.value);
          }
        } else if (params.understanding.brandIdentity) {
          const c = params.understanding.brandIdentity.colors;
          css = setCssVar(css, "color-primary", c.primary);
          css = setCssVar(css, "color-secondary", c.secondary);
          css = setCssVar(css, "color-accent", c.accent);
        } else {
          pendingAiActions.push(action);
          notes.push("Color update deferred to AI optimize (no hex / brand package)");
          break;
        }
        files = upsertFile(files, globals.path, css, "css");
        applied.push(action);
        notes.push(action.value ? `Primary set to ${action.value}` : "Re-applied brand colors");
        break;
      }
      case "update-typography": {
        const globals = findGlobals(files);
        if (!globals) {
          notes.push("No globals.css for typography update");
          break;
        }
        let css = globals.content;
        if (action.value?.trim()) {
          const font = action.value.trim().replace(/["']/g, "");
          const slot = action.target === "body" ? "font-body" : action.target === "display" ? "font-display" : "font-heading";
          css = setCssVar(css, slot, `"${font}", system-ui, sans-serif`);
          files = upsertFile(files, globals.path, css, "css");
          applied.push(action);
          notes.push(`Set ${slot} to ${font}`);
          break;
        }
        const brand = params.understanding.brandIdentity;
        if (!brand) {
          pendingAiActions.push(action);
          notes.push("Typography update deferred to AI (needs brand identity)");
          break;
        }
        css = setCssVar(
          css,
          "font-heading",
          `"${brand.typography.headingFont}", Georgia, serif`,
        );
        css = setCssVar(
          css,
          "font-display",
          `"${brand.typography.displayFont}", Georgia, serif`,
        );
        css = setCssVar(
          css,
          "font-body",
          `"${brand.typography.bodyFont}", system-ui, sans-serif`,
        );
        files = upsertFile(files, globals.path, css, "css");
        applied.push(action);
        notes.push(`Typography set to ${brand.typography.pairing}`);
        break;
      }
      case "update-spacing": {
        const globals = findGlobals(files);
        if (!globals) {
          notes.push("No globals.css for spacing update");
          break;
        }
        const density = action.value || "airy";
        const sectionY =
          density === "compact"
            ? "4.5rem"
            : density === "balanced"
              ? "5.75rem"
              : "7.5rem";
        const css = setCssVar(globals.content, "section-y", sectionY);
        files = upsertFile(files, globals.path, css, "css");
        applied.push(action);
        notes.push(`Section spacing set to ${density} (${sectionY})`);
        break;
      }
      case "update-animations": {
        const globals = findGlobals(files);
        if (!globals) {
          notes.push("No globals.css for animation update");
          break;
        }
        let css = globals.content;
        css = setCssVar(css, "ease-premium", "cubic-bezier(0.22, 1, 0.36, 1)");
        css = setCssVar(css, "duration", "700ms");
        css = setCssVar(css, "duration-slow", "1100ms");
        files = upsertFile(files, globals.path, css, "css");
        applied.push(action);
        notes.push("Updated motion tokens for smoother transitions");
        break;
      }
      case "rewrite-content":
      case "improve-layout":
      case "improve-conversion":
      case "restyle-section":
        pendingAiActions.push(action);
        notes.push(`Queued for AI continue: ${action.type}`);
        break;
      default:
        pendingAiActions.push(action);
        break;
    }
  }

  // Touch home if order changed but file missing rebuild — ensure home exists
  if (!findHome(files) && order.length) {
    files = rebuildHomePage(files, order, params.understanding);
  }

  return { files, applied, notes, pendingAiActions };
}

export function buildContinueInstructionFromActions(
  command: string,
  pending: WebsiteEditAction[],
  appliedNotes: string[],
): string | undefined {
  if (!pending.length && !command.trim()) return undefined;
  if (!pending.length) return undefined;
  return [
    "[website-editor]",
    command.trim(),
    "",
    "Already applied structurally:",
    ...appliedNotes.slice(0, 8).map((n) => `- ${n}`),
    "",
    "Still apply with AI:",
    ...pending.map((a) => `- ${a.type}: ${a.notes || a.target || a.componentId || ""}`),
    "",
    "Keep brand colors, fonts, and component architecture. Prefer Professional Components Library scaffolds.",
  ].join("\n");
}
