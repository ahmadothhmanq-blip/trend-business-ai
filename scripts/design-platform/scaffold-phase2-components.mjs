/**
 * Scaffolds TBDP Phase 2 component modules with required file structure.
 * Run once: node scripts/design-platform/scaffold-phase2-components.mjs
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const componentsRoot = join(root, "lib/design-platform/components");

const CATALOG = {
  navigation: [
    { id: "navbar", name: "Navbar", element: "nav", role: "navigation" },
    { id: "mega-menu", name: "MegaMenu", element: "nav", role: "navigation" },
    { id: "sidebar", name: "Sidebar", element: "aside", role: "navigation" },
    { id: "breadcrumb", name: "Breadcrumb", element: "nav", role: "navigation" },
    { id: "tabs", name: "Tabs", element: "div", role: "tablist", client: true },
    { id: "pagination", name: "Pagination", element: "nav", role: "navigation" },
  ],
  buttons: [
    { id: "primary", name: "PrimaryButton", variant: "primary", element: "button" },
    { id: "secondary", name: "SecondaryButton", variant: "secondary", element: "button" },
    { id: "ghost", name: "GhostButton", variant: "ghost", element: "button" },
    { id: "outline", name: "OutlineButton", variant: "outline", element: "button" },
    { id: "icon", name: "IconButton", variant: "ghost", element: "button", icon: true },
    { id: "floating", name: "FloatingButton", variant: "primary", element: "button", floating: true },
    { id: "split-button", name: "SplitButton", variant: "primary", element: "div", client: true },
  ],
  forms: [
    { id: "input", name: "Input", input: true },
    { id: "textarea", name: "Textarea", textarea: true },
    { id: "select", name: "Select", select: true },
    { id: "multi-select", name: "MultiSelect", client: true },
    { id: "checkbox", name: "Checkbox", checkbox: true },
    { id: "radio", name: "Radio", radio: true },
    { id: "switch", name: "Switch", client: true },
    { id: "slider", name: "Slider", client: true },
    { id: "date-picker", name: "DatePicker", client: true },
    { id: "otp", name: "OtpInput", client: true },
    { id: "search", name: "SearchInput", search: true },
    { id: "file-upload", name: "FileUpload", client: true },
  ],
  feedback: [
    { id: "alert", name: "Alert", feedback: "info" },
    { id: "toast", name: "Toast", feedback: "info", client: true },
    { id: "notification", name: "Notification", feedback: "info" },
    { id: "banner", name: "Banner", feedback: "info" },
    { id: "empty-state", name: "EmptyState", feedback: "empty" },
    { id: "error-state", name: "ErrorState", feedback: "danger" },
    { id: "success-state", name: "SuccessState", feedback: "success" },
    { id: "loading-state", name: "LoadingState", feedback: "loading" },
    { id: "skeleton", name: "Skeleton", feedback: "skeleton" },
  ],
  cards: [
    { id: "feature-card", name: "FeatureCard", card: true },
    { id: "product-card", name: "ProductCard", card: true },
    { id: "pricing-card", name: "PricingCard", card: true },
    { id: "team-card", name: "TeamCard", card: true },
    { id: "testimonial-card", name: "TestimonialCard", card: true },
    { id: "dashboard-card", name: "DashboardCard", card: true },
    { id: "media-card", name: "MediaCard", card: true },
  ],
  marketing: [
    { id: "hero", name: "Hero", marketing: true },
    { id: "cta", name: "Cta", marketing: true },
    { id: "faq", name: "Faq", marketing: true },
    { id: "logo-cloud", name: "LogoCloud", marketing: true },
    { id: "stats", name: "Stats", marketing: true },
    { id: "timeline", name: "Timeline", marketing: true },
    { id: "feature-grid", name: "FeatureGrid", marketing: true },
    { id: "pricing-table", name: "PricingTable", marketing: true },
    { id: "comparison-table", name: "ComparisonTable", marketing: true },
  ],
  commerce: [
    { id: "product-grid", name: "ProductGrid", commerce: true },
    { id: "product-details", name: "ProductDetails", commerce: true },
    { id: "checkout-summary", name: "CheckoutSummary", commerce: true },
    { id: "order-status", name: "OrderStatus", commerce: true },
  ],
  dashboard: [
    { id: "kpi-cards", name: "KpiCards", dashboard: true },
    { id: "tables", name: "Tables", dashboard: true },
    { id: "charts-wrapper", name: "ChartsWrapper", dashboard: true },
    { id: "activity-feed", name: "ActivityFeed", dashboard: true },
    { id: "metric-blocks", name: "MetricBlocks", dashboard: true },
  ],
  dialogs: [
    { id: "modal", name: "Modal", dialog: true, client: true },
    { id: "drawer", name: "Drawer", dialog: true, client: true },
    { id: "popover", name: "Popover", dialog: true, client: true },
    { id: "tooltip", name: "Tooltip", dialog: true, client: true },
    { id: "context-menu", name: "ContextMenu", dialog: true, client: true },
  ],
  media: [
    { id: "avatar", name: "Avatar", media: true },
    { id: "image", name: "Image", media: true },
    { id: "gallery", name: "Gallery", media: true },
    { id: "carousel", name: "Carousel", media: true, client: true },
    { id: "video-player", name: "VideoPlayer", media: true },
  ],
  layout: [
    { id: "section", name: "Section", layout: true },
    { id: "container", name: "Container", layout: true },
    { id: "stack", name: "Stack", layout: true },
    { id: "grid", name: "Grid", layout: true },
    { id: "divider", name: "Divider", layout: true },
    { id: "spacer", name: "Spacer", layout: true },
  ],
};

function blockId(category, id) {
  return id;
}

function typesTs(category, comp) {
  return `import type { TbdpComponentBaseProps, TbdpComponentSize, TbdpDirection } from "@/lib/design-platform/components/core";

export type ${comp.name}Props = TbdpComponentBaseProps & {
  size?: TbdpComponentSize;
  dir?: TbdpDirection;
  children?: import("react").ReactNode;
  title?: string;
  description?: string;
  label?: string;
};
`;
}

function tokensTs(category, comp) {
  const block = blockId(category, comp.id);
  return `import { v } from "@/lib/design-platform/components/core";

/** ${comp.name} component tokens — references Phase 1 TBDP variables only. */
export const ${comp.name.toUpperCase().replace(/([A-Z])/g, "_$1").replace(/^_/, "")}_TOKENS = {
  color: v.color.text.primary,
  background: v.color.surface.base,
  border: v.color.border.default,
  radius: v.radius.md,
  padding: v.spacing.md,
  gap: v.spacing.sm,
  shadow: v.shadow["1"],
  font: v.font.body,
} as const;
`;
}

function variantsTs(category, comp) {
  const block = blockId(category, comp.id);
  return `import { v } from "@/lib/design-platform/components/core";
import type { TbdpComponentSize } from "@/lib/design-platform/components/core";

export const ${comp.name.toUpperCase().replace(/([A-Z])/g, "_$1").replace(/^_/, "")}_VARIANTS = {
  default: {
    color: v.color.text.primary,
    background: v.color.surface.base,
  },
  emphasis: {
    color: v.color.text.inverse,
    background: v.color.primary,
  },
} as const;

export const ${comp.name.toUpperCase().replace(/([A-Z])/g, "_$1").replace(/^_/, "")}_SIZES: Record<TbdpComponentSize, { padding: string; fontSize: string }> = {
  xs: { padding: v.spacing.xs, fontSize: "0.75rem" },
  sm: { padding: v.spacing.sm, fontSize: "0.8125rem" },
  md: { padding: v.spacing.md, fontSize: "0.875rem" },
  lg: { padding: v.spacing.lg, fontSize: "1rem" },
  xl: { padding: v.spacing.xl, fontSize: "1.0625rem" },
};
`;
}

function a11yTs(category, comp) {
  const role = comp.role ?? (comp.element === "button" ? "button" : undefined);
  return `import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const ${comp.name.toUpperCase().replace(/([A-Z])/g, "_$1").replace(/^_/, "")}_A11Y = {
  componentId: "${comp.id}",
  ${role ? `defaultRole: "${role}" as const,` : ""}
  wcagLevel: "AA" as const,
};

export function ${comp.name.charAt(0).toLowerCase() + comp.name.slice(1)}A11yProps(props: {
  label?: string;
  describedBy?: string;
  disabled?: boolean;
}): TbdpA11yProps {
  return {
    ${role ? `role: "${role}",` : ""}
    ...(props.label ? { "aria-label": props.label } : {}),
    ...(props.describedBy ? { "aria-describedby": props.describedBy } : {}),
    ...(props.disabled ? { "aria-disabled": true, tabIndex: -1 } : {}),
  };
}
`;
}

function indexTsx(category, comp) {
  const block = blockId(category, comp.id);
  const client = comp.client ? '"use client";\n\n' : "";
  const isButton = category === "buttons";
  const isFormInput = comp.input || comp.textarea || comp.select || comp.checkbox || comp.radio || comp.search;
  const isCard = comp.card;
  const isFeedback = comp.feedback;
  const isLayout = comp.layout;
  const isDialog = comp.dialog;

  let body = "";
  if (isButton) {
    const extra = comp.floating ? ', "floating"' : "";
    body = `
  return (
    <button
      type="button"
      data-tbdp-ui
      data-tbdp-component="${block}"
      dir={dir}
      disabled={disabled || loading}
      aria-busy={loading}
      className={tbdpClass("btn", { [size]: true, ["${comp.variant}"]: true${extra} }, className)}
      {...${comp.name.charAt(0).toLowerCase() + comp.name.slice(1)}A11yProps({ label, disabled })}
      {...rest}
    >
      {loading ? <span aria-hidden="true">…</span> : null}
      {children ?? label}
    </button>
  );`;
  } else if (isFormInput) {
    const tag = comp.textarea ? "textarea" : comp.select ? "select" : "input";
    const typeAttr = comp.checkbox ? 'type="checkbox"' : comp.radio ? 'type="radio"' : comp.search ? 'type="search"' : 'type="text"';
    body = `
  return (
    <${tag}
      data-tbdp-ui
      data-tbdp-component="${block}"
      dir={dir}
      disabled={disabled}
      className={tbdpClass("${tag === "textarea" ? "textarea" : tag === "select" ? "select" : "input"}", { [size]: true }, className)}
      ${tag === "input" ? typeAttr : ""}
      aria-label={label}
      placeholder={description}
      {...rest}
    />
  );`;
  } else if (isCard) {
    body = `
  return (
    <article data-tbdp-ui data-tbdp-component="${block}" dir={dir} className={tbdpClass("card", {}, className)} {...rest}>
      {title ? <header className="tbdp-card__body"><h3>{title}</h3></header> : null}
      <div className="tbdp-card__body">{children ?? description}</div>
    </article>
  );`;
  } else if (isFeedback) {
    if (comp.feedback === "skeleton") {
      body = `
  return (
    <div data-tbdp-ui data-tbdp-component="${block}" className={tbdpClass("skeleton", {}, className)} style={{ height: "1rem", width: "100%" }} aria-hidden="true" {...rest} />
  );`;
    } else if (comp.feedback === "loading") {
      body = `
  return (
    <div data-tbdp-ui data-tbdp-component="${block}" role="status" aria-live="polite" className={className} {...rest}>
      {children ?? "Loading…"}
    </div>
  );`;
    } else if (comp.feedback === "empty") {
      body = `
  return (
    <div data-tbdp-ui data-tbdp-component="${block}" role="status" className={className} {...rest}>
      <p>{title ?? "No data"}</p>
      {description ? <p>{description}</p> : null}
      {children}
    </div>
  );`;
    } else {
      const tone = comp.feedback === "danger" ? "danger" : comp.feedback === "success" ? "success" : comp.feedback === "warning" ? "warning" : "info";
      body = `
  return (
    <div data-tbdp-ui data-tbdp-component="${block}" role="alert" className={tbdpClass("alert", { "${tone}": true }, className)} {...rest}>
      {title ? <strong>{title}</strong> : null}
      {children ?? description}
    </div>
  );`;
    }
  } else if (isLayout) {
    if (comp.id === "divider") {
      body = `return <hr data-tbdp-ui data-tbdp-component="${block}" className={tbdpClass("divider", {}, className)} {...rest} />;`;
    } else if (comp.id === "spacer") {
      body = `return <div data-tbdp-ui data-tbdp-component="${block}" aria-hidden="true" style={{ blockSize: v.spacing.lg }} className={className} {...rest} />;`;
    } else if (comp.id === "container") {
      body = `return <div data-tbdp-ui data-tbdp-component="${block}" className={tbdpClass("container", {}, className)} dir={dir} {...rest}>{children}</div>;`;
    } else if (comp.id === "section") {
      body = `return <section data-tbdp-ui data-tbdp-component="${block}" className={tbdpClass("section", {}, className)} dir={dir} {...rest}>{children}</section>;`;
    } else if (comp.id === "stack") {
      body = `return <div data-tbdp-ui data-tbdp-component="${block}" className={tbdpClass("stack", { md: true }, className)} dir={dir} {...rest}>{children}</div>;`;
    } else if (comp.id === "grid") {
      body = `return <div data-tbdp-ui data-tbdp-component="${block}" className={tbdpClass("grid", { responsive: true }, className)} dir={dir} {...rest}>{children}</div>;`;
    }
  } else if (isDialog && comp.id === "modal") {
    body = `
  if (!open) return null;
  return (
    <div data-tbdp-ui data-tbdp-component="${block}" className="tbdp-modal-overlay" role="presentation" onClick={onClose} onKeyDown={(e) => e.key === "Escape" && onClose?.()}>
      <div role="dialog" aria-modal="true" aria-label={label ?? title} className={tbdpClass("modal", {}, className)} onClick={(e) => e.stopPropagation()} {...rest}>
        {title ? <header style={{ padding: v.spacing.lg }}><h2>{title}</h2></header> : null}
        <div style={{ padding: v.spacing.lg }}>{children}</div>
      </div>
    </div>
  );`;
  } else if (isDialog && comp.id === "drawer") {
    body = `
  if (!open) return null;
  return (
    <div data-tbdp-ui data-tbdp-component="${block}" className="tbdp-modal-overlay" role="presentation" onClick={onClose}>
      <aside role="dialog" aria-modal="true" aria-label={label ?? title} className={tbdpClass("drawer", {}, className)} onClick={(e) => e.stopPropagation()} {...rest}>
        {children}
      </aside>
    </div>
  );`;
  } else if (comp.id === "avatar") {
    body = `
  return (
    <span data-tbdp-ui data-tbdp-component="${block}" role="img" aria-label={label ?? "Avatar"} className={className} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: v.radius.circle, background: v.color.surface.raised, width: "2.5rem", height: "2.5rem", overflow: "hidden" }} {...rest}>
      {children ?? label?.charAt(0)}
    </span>
  );`;
  } else if (comp.id === "image") {
    body = `
  return (
    <img data-tbdp-ui data-tbdp-component="${block}" alt={label ?? ""} className={className} style={{ maxWidth: "100%", borderRadius: v.radius.md }} {...rest} />
  );`;
  } else if (comp.id === "breadcrumb") {
    body = `
  return (
    <nav data-tbdp-ui data-tbdp-component="${block}" aria-label={label ?? "Breadcrumb"} dir={dir} className={className} {...rest}>
      <ol style={{ display: "flex", gap: v.spacing.sm, listStyle: "none", margin: 0, padding: 0 }}>{children}</ol>
    </nav>
  );`;
  } else if (comp.id === "tabs") {
    body = `
  return (
    <div data-tbdp-ui data-tbdp-component="${block}" role="tablist" aria-label={label ?? "Tabs"} dir={dir} className={tbdpClass("tabs", {}, className)} {...rest}>
      {children}
    </div>
  );`;
  } else if (comp.id === "navbar") {
    body = `
  return (
    <header data-tbdp-ui data-tbdp-component="${block}" dir={dir} className={tbdpClass("navbar", {}, className)} {...rest}>
      {children}
    </header>
  );`;
  } else {
    body = `
  return (
    <div data-tbdp-ui data-tbdp-component="${block}" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );`;
  }

  const extraProps = isDialog && (comp.id === "modal" || comp.id === "drawer")
    ? "open?: boolean; onClose?: () => void;"
    : "";
  const vImport = comp.id === "spacer" ? '\nimport { v } from "@/lib/design-platform/components/core";' : "";

  return `${client}import type { ${comp.name}Props } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { ${comp.name.charAt(0).toLowerCase() + comp.name.slice(1)}A11yProps } from "./accessibility";${vImport}

export type { ${comp.name}Props } from "./types";

export function ${comp.name}({
  size = "md",
  dir,
  className,
  children,
  title,
  description,
  label,
  disabled,
  loading,
  ${isDialog && (comp.id === "modal" || comp.id === "drawer") ? "open, onClose," : ""}
  ...rest
}: ${comp.name}Props${extraProps ? ` & { ${extraProps} }` : ""}) {${body}
}
`;
}

function indexTs(category, item) {
  return `export { ${item.name}, type ${item.name}Props } from "./component";
export * from "./tokens";
export * from "./variants";
export * from "./accessibility";
`;
}

function docsMd(category, comp) {
  return `# ${comp.name}

TBDP Phase 2 enterprise component — **${category}** category.

## Usage

\`\`\`tsx
import { ${comp.name} } from "@/lib/design-platform/components/${category}/${comp.id}";

<${comp.name} size="md" dir="ltr">
  Content
</${comp.name}>
\`\`\`

## Props

| Prop | Type | Default |
|------|------|---------|
| size | xs \\| sm \\| md \\| lg \\| xl | md |
| dir | ltr \\| rtl | — |
| disabled | boolean | false |
| loading | boolean | false |

## Accessibility

- WCAG AA compliant
- RTL/LTR via \`dir\` prop
- See \`accessibility.ts\` for ARIA configuration

## Tokens

All styles reference Phase 1 TBDP CSS variables via \`tokens.ts\`.
`;
}

function testTs(category, comp) {
  return `import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ${comp.name} } from "../component";

describe("${comp.name}", () => {
  it("renders with data-tbdp-component marker", () => {
    const html = renderToStaticMarkup(
      <${comp.name}${comp.id === "modal" || comp.id === "drawer" ? " open" : ""}>Test</${comp.name}>,
    );
    assert.ok(html.includes('data-tbdp-component="${comp.id}"'));
    assert.ok(html.includes("data-tbdp-ui"));
  });

  it("exports token and variant modules", async () => {
    const tokens = await import("../tokens");
    const variants = await import("../variants");
    assert.ok(tokens);
    assert.ok(variants);
  });
});
`;
}

let total = 0;
for (const [category, items] of Object.entries(CATALOG)) {
  for (const comp of items) {
    const dir = join(componentsRoot, category, comp.id);
    if (existsSync(join(dir, "index.ts"))) {
      continue;
    }
    mkdirSync(join(dir, "tests"), { recursive: true });
    writeFileSync(join(dir, "types.ts"), typesTs(category, comp));
    writeFileSync(join(dir, "tokens.ts"), tokensTs(category, comp));
    writeFileSync(join(dir, "variants.ts"), variantsTs(category, comp));
    writeFileSync(join(dir, "accessibility.ts"), a11yTs(category, comp));
    writeFileSync(join(dir, "component.tsx"), indexTsx(category, comp));
    writeFileSync(join(dir, "index.ts"), indexTs(category, comp));
    writeFileSync(join(dir, "documentation.md"), docsMd(category, comp));
    writeFileSync(join(dir, "tests", `${comp.id}.test.tsx`), testTs(category, comp));
    total++;
  }
}

console.log(`Scaffolded ${total} TBDP components`);
