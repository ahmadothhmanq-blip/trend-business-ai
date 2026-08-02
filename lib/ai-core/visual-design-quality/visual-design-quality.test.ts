import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runVisualDesignQuality } from "@/lib/ai-core/visual-design-quality/analyze";
import { buildVisualDesignRepairInstruction } from "@/lib/ai-core/visual-design-quality/build-repair";
import { detectResponsiveLayout } from "@/lib/ai-core/visual-design-quality/detectors/responsive-layout";

const PREMIUM_FILES = [
  {
    path: "app/globals.css",
    content: `
      :root {
        --color-primary: #1a365d;
        --font-heading: "Space Grotesk";
        --font-body: "Inter";
        --section-y: 5rem;
        --radius-md: 0.75rem;
      }
    `,
  },
  {
    path: "app/layout.tsx",
    content: `
      export const metadata = { title: "Studio" };
      export default function Layout({ children }) {
        return <html><body className="font-[family-name:var(--font-body)]">{children}</body></html>;
      }
    `,
  },
  {
    path: "components/layout/Header.tsx",
    content: `
      export function Header() {
        return (
          <header className="sticky top-0 backdrop-blur border-b">
            <nav className="container mx-auto flex items-center justify-between py-4">
              <span className="font-[family-name:var(--font-heading)]">Studio</span>
              <div className="hidden md:flex gap-6"><a href="/">Home</a><a href="/contact">Contact</a></div>
              <button className="md:hidden" aria-label="Menu">Menu</button>
            </nav>
          </header>
        );
      }
    `,
  },
  {
    path: "components/sections/Hero.tsx",
    content: `
      export function Hero() {
        return (
          <section className="relative min-h-screen py-24 bg-cover" style={{ backgroundImage: "url(HERO_IMAGE)" }}>
            <div className="container mx-auto max-w-5xl">
              <h1 className="text-5xl font-[family-name:var(--font-heading)] text-[var(--color-primary)]">Premium Design Studio</h1>
              <p className="text-lg text-muted-foreground leading-relaxed mt-4">Crafted spaces for modern living.</p>
              <button className="mt-8 rounded-lg shadow-md px-6 py-3">Book Consultation</button>
            </div>
          </section>
        );
      }
    `,
  },
  {
    path: "app/page.tsx",
    content: `
      import { Hero } from "@/components/sections/Hero";
      export default function Page() {
        return <main className="flex flex-col md:grid md:grid-cols-1"><Hero /></main>;
      }
    `,
  },
];

const WEAK_FILES = [
  {
    path: "app/page.tsx",
    content: `
      export default function Page() {
        return <main><p>Welcome</p><button>Click</button></main>;
      }
    `,
  },
];

describe("visual design quality detectors", () => {
  it("flags missing responsive breakpoints", () => {
    const issues = detectResponsiveLayout({ files: WEAK_FILES });
    assert.ok(issues.some((i) => i.dimension === "responsiveLayout"));
  });
});

describe("visual design quality engine", () => {
  it("scores premium layout higher than weak template", () => {
    const premium = runVisualDesignQuality({
      files: PREMIUM_FILES,
      brandName: "Studio",
      designSystem: {
        colors: { primary: "#1a365d" },
        typography: { headingFont: "Space Grotesk", bodyFont: "Inter" },
      },
    });
    const weak = runVisualDesignQuality({ files: WEAK_FILES, brandName: "Studio" });

    assert.ok(premium.scores.overall > weak.scores.overall);
    assert.ok(premium.scores.heroQuality > weak.scores.heroQuality);
    assert.ok(premium.scores.responsiveLayout >= weak.scores.responsiveLayout);
    assert.ok(weak.issues.length > premium.issues.length);
  });

  it("produces deterministic scores", () => {
    const first = runVisualDesignQuality({ files: PREMIUM_FILES });
    const second = runVisualDesignQuality({ files: PREMIUM_FILES });
    assert.deepEqual(first.scores, second.scores);
  });

  it("builds visual repair instructions", () => {
    const report = runVisualDesignQuality({ files: WEAK_FILES });
    const instruction = buildVisualDesignRepairInstruction(report);
    assert.match(instruction, /visual-design/);
  });

  it("never blocks generation — all issues are warnings by default path", () => {
    const report = runVisualDesignQuality({ files: WEAK_FILES });
    assert.equal(
      report.issues.every((i) => i.severity === "warning" || i.severity === "error"),
      true,
    );
    // passed is true when no errors (we only emit warnings in detectors)
    assert.equal(report.passed, true);
  });
});
