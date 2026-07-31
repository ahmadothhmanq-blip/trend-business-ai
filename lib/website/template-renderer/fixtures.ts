import type { WbTemplateRendererPackageInput } from "@/lib/website/template-renderer-contract/types";

const basePlacement = {
  allowedComponentTypes: ["hero", "custom"],
  ordering: "vertical" as const,
  allowNesting: false,
  maxComponents: 4,
};

export const FIXTURE_LOADED_AT = "2026-07-30T12:00:00.000Z";

export function createValidPackageFixture(): WbTemplateRendererPackageInput {
  return {
    manifest: {
      specVersion: "2.0.0",
      id: "fixture-template",
      version: "1.0.0",
      name: "Fixture Template",
      description: "Deterministic renderer fixture package.",
      metadata: {
        category: "business",
        tags: ["fixture", "test"],
        author: { name: "Template Tests" },
        license: "MIT",
        keywords: ["fixture"],
      },
      media: {
        thumbnail: "assets/thumbnail.png",
        preview: "assets/preview.png",
        gallery: ["assets/gallery-a.png"],
      },
      compatibility: {
        engineVersion: ">=1.0.0",
        specVersion: "2.0.0",
      },
      responsive: {
        breakpoints: [
          { name: "md", minWidth: 768 },
          { name: "sm", minWidth: 640 },
        ],
        containerMaxWidth: "72rem",
        fluidTypography: true,
      },
    },
    entry: {
      defaultPageId: "home",
      defaultLayoutId: "default",
    },
    canvas: {
      id: "canvas",
      grid: {
        columns: 12,
        gutter: "1.5rem",
        margin: "1rem",
        maxWidth: "72rem",
      },
      spacing: {
        unit: "rem",
        scale: ["0.25", "0.5", "1"],
      },
      visualIdentity: {
        colors: {
          primary: "#111111",
          background: "#ffffff",
        },
        typography: {
          display: "Inter",
          body: "Inter",
        },
        radius: {
          md: "8px",
        },
      },
    },
    placementRules: {
      global: {
        maxComponentsPerPage: 8,
        allowDuplicateTypes: true,
        defaultOrdering: "vertical",
      },
      regionOverrides: {
        header: {
          ordering: "horizontal",
          maxComponents: 2,
        },
      },
      constraints: [
        {
          id: "no-hero-header",
          when: { region: "header" },
          deny: { componentTypes: ["hero"] },
        },
      ],
    },
    componentTypes: {
      types: [
        { id: "hero", category: "content" },
        { id: "custom", category: "custom" },
      ],
    },
    layouts: {
      default: {
        id: "default",
        kind: "single-column",
        label: "Default",
        regionOrder: ["header", "main"],
      },
    },
    regions: {
      header: {
        id: "header",
        role: "header",
        label: "Header",
        layout: {
          width: "full",
          alignment: "stretch",
        },
        placement: {
          allowedComponentTypes: ["navigation", "logo"],
          ordering: "horizontal",
          allowNesting: false,
          maxComponents: 4,
        },
      },
      main: {
        id: "main",
        role: "main",
        layout: {
          width: "contained",
          alignment: "center",
        },
        placement: basePlacement,
      },
    },
    pages: {
      home: {
        id: "home",
        title: "Home",
        path: "/",
        layoutId: "default",
        regionIds: ["header", "main"],
      },
    },
    mediaPaths: {
      thumbnail: "/abs/thumbnail.png",
      preview: "/abs/preview.png",
      gallery: ["assets/gallery-a.png"],
    },
    loadedAt: FIXTURE_LOADED_AT,
  };
}

export function createPackageWithBrokenLayoutReference(): WbTemplateRendererPackageInput {
  const pkg = createValidPackageFixture();
  pkg.layouts.default = {
    ...pkg.layouts.default,
    regionOrder: ["header", "missing-region"],
  };
  return pkg;
}

export function createPackageWithBrokenPageLayout(): WbTemplateRendererPackageInput {
  const pkg = createValidPackageFixture();
  pkg.pages.home = {
    ...pkg.pages.home,
    layoutId: "missing-layout",
  };
  return pkg;
}

export function createPackageWithBrokenPageRegion(): WbTemplateRendererPackageInput {
  const pkg = createValidPackageFixture();
  pkg.pages.home = {
    ...pkg.pages.home,
    regionIds: ["header", "unknown-region"],
  };
  return pkg;
}

export function createPackageWithBrokenPlacementOverride(): WbTemplateRendererPackageInput {
  const pkg = createValidPackageFixture();
  pkg.placementRules = {
    ...pkg.placementRules,
    regionOverrides: {
      ghost: {
        maxComponents: 1,
      },
    },
  };
  return pkg;
}

export function createPackageWithBrokenConstraint(): WbTemplateRendererPackageInput {
  const pkg = createValidPackageFixture();
  pkg.placementRules = {
    ...pkg.placementRules,
    constraints: [
      {
        id: "bad-page",
        when: { page: "missing-page" },
        deny: { componentTypes: ["hero"] },
      },
    ],
  };
  return pkg;
}

export function createPackageWithUnsupportedSpec(): WbTemplateRendererPackageInput {
  const pkg = createValidPackageFixture();
  pkg.manifest.specVersion = "1.0.0";
  return pkg;
}
