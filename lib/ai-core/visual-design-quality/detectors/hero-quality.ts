import type {
  VisualDesignQualityContext,
  VisualQualityIssue,
} from "@/lib/ai-core/visual-design-quality/types";

function heroFiles(context: VisualDesignQualityContext) {
  return context.files.filter(
    (f) =>
      /Hero|hero/i.test(f.path) ||
      f.path.endsWith("app/page.tsx") ||
      /components\/sections\/.*hero/i.test(f.path),
  );
}

export function detectHeroQuality(
  context: VisualDesignQualityContext,
): VisualQualityIssue[] {
  const issues: VisualQualityIssue[] = [];
  const heroes = heroFiles(context);
  const blob = heroes.map((f) => f.content).join("\n");

  if (!heroes.length) {
    issues.push({
      id: "hero-missing-component",
      dimension: "heroQuality",
      severity: "warning",
      message: "No hero section component detected.",
      repairHint: "Add a dedicated hero section with headline, subcopy, and CTA.",
    });
    return issues;
  }

  if (!/<h1\b/i.test(blob)) {
    issues.push({
      id: "hero-no-h1",
      dimension: "heroQuality",
      severity: "warning",
      message: "Hero section lacks a primary H1 headline.",
      filePath: heroes[0]?.path,
      repairHint: "Place the main value proposition in a single H1 inside the hero.",
    });
  }

  const hasVisual =
    /<Image\b|<img\b|SlotImage\b|slot="hero"|HERO_IMAGE|background-image|bg-cover|bg-gradient/i.test(blob);
  if (!hasVisual) {
    issues.push({
      id: "hero-no-visual",
      dimension: "heroQuality",
      severity: "warning",
      message: "Hero section lacks strong visual imagery or background treatment.",
      filePath: heroes[0]?.path,
      repairHint: "Add hero imagery via SlotImage, Image, or premium gradient overlay.",
    });
  }

  const hasMinHeight = /min-h-\[|min-h-screen|min-h-\[70vh\]|py-20|py-24/i.test(blob);
  if (!hasMinHeight) {
    issues.push({
      id: "hero-shallow",
      dimension: "heroQuality",
      severity: "warning",
      message: "Hero vertical presence is shallow — may feel cramped.",
      filePath: heroes[0]?.path,
      repairHint: "Use min-h-screen or generous py-20+ padding for hero band.",
    });
  }

  return issues;
}
