import type {
  CapabilityDetectionDefinition,
  CapabilityMatchContext,
  WebsiteCapabilityId,
} from "@/lib/website/builder/capabilities/types";
import {
  blueprintIncludesSection,
  componentMatchesAny,
  includesAny,
  pathMatchesAny,
  projectSignalsHaystack,
  routeMatchesAny,
  settingTruthy,
  strategySectionMatches,
} from "@/lib/website/builder/capabilities/signals";

const INITIAL_SOURCES = new Set<CapabilityDetectionDefinition["matchers"][number]["source"]>([
  "blueprint",
  "strategy",
]);

function haystack(ctx: CapabilityMatchContext): string {
  return projectSignalsHaystack(ctx);
}

function matcher(
  source: CapabilityDetectionDefinition["matchers"][number]["source"],
  weight: number,
  ref: string,
  test: (ctx: CapabilityMatchContext) => boolean,
): CapabilityDetectionDefinition["matchers"][number] {
  return { source, weight, ref, test };
}

function defineCapability(
  id: WebsiteCapabilityId,
  matchers: CapabilityDetectionDefinition["matchers"],
): CapabilityDetectionDefinition {
  return { id, matchers };
}

/** Extensible weighted detection rules — append new capabilities here. */
export const CAPABILITY_DETECTION_DEFINITIONS: CapabilityDetectionDefinition[] = [
  defineCapability("blog", [
    matcher("strategy", 0.35, "strategy.page.blog", (ctx) =>
      routeMatchesAny(ctx.routes, ["/blog"]) ||
      (ctx.strategy?.pages.some((p) => /blog/i.test(p.path)) ?? false),
    ),
    matcher("strategy", 0.25, "strategy.section.blog", (ctx) =>
      strategySectionMatches(ctx, /blog|article|post/i),
    ),
    matcher("route", 0.35, "route.blog", (ctx) => routeMatchesAny(ctx.routes, ["/blog"])),
    matcher("file", 0.3, "file.blog", (ctx) =>
      pathMatchesAny(ctx.filePaths, [/^app\/blog\//, /^content\/posts\//, /blog\.tsx$/i]),
    ),
    matcher("content", 0.15, "content.blog", (ctx) =>
      includesAny(haystack(ctx), ["blog post", "latest articles", "read more"]),
    ),
  ]),
  defineCapability("products", [
    matcher("blueprint", 0.2, "blueprint.portfolio", (ctx) =>
      blueprintIncludesSection(ctx, "portfolio"),
    ),
    matcher("strategy", 0.3, "strategy.products", (ctx) =>
      strategySectionMatches(ctx, /product|catalog|shop|store|e-?commerce/i),
    ),
    matcher("setting", 0.35, "setting.ecommerce", (ctx) =>
      settingTruthy(ctx.settings, "isEcommerce"),
    ),
    matcher("route", 0.3, "route.products", (ctx) =>
      routeMatchesAny(ctx.routes, ["/products", "/shop", "/store"]),
    ),
    matcher("component", 0.25, "component.product", (ctx) =>
      componentMatchesAny(ctx.componentIds, ["product", "catalog", "shop"]),
    ),
    matcher("file", 0.25, "file.products", (ctx) =>
      pathMatchesAny(ctx.filePaths, [/^app\/products\//, /^app\/shop\//, /product-card/i]),
    ),
    matcher("dependency", 0.2, "dependency.commerce", (ctx) =>
      includesAny(ctx.dependencies.join(" "), ["stripe", "@shopify", "snipcart"]),
    ),
  ]),
  defineCapability("booking", [
    matcher("strategy", 0.35, "strategy.booking", (ctx) =>
      strategySectionMatches(ctx, /book(ing)?|reservation|reserve/i),
    ),
    matcher("route", 0.3, "route.booking", (ctx) =>
      routeMatchesAny(ctx.routes, ["/booking", "/reserve", "/reservations"]),
    ),
    matcher("component", 0.25, "component.booking", (ctx) =>
      componentMatchesAny(ctx.componentIds, ["booking", "reservation"]),
    ),
    matcher("file", 0.25, "file.booking", (ctx) =>
      pathMatchesAny(ctx.filePaths, [/booking/i, /reservation/i]),
    ),
    matcher("dependency", 0.2, "dependency.calendly", (ctx) =>
      includesAny(ctx.dependencies.join(" "), ["cal.com", "calendly"]),
    ),
  ]),
  defineCapability("appointments", [
    matcher("strategy", 0.35, "strategy.appointments", (ctx) =>
      strategySectionMatches(ctx, /appointment|schedule|scheduling/i),
    ),
    matcher("route", 0.35, "route.appointments", (ctx) =>
      routeMatchesAny(ctx.routes, ["/appointments", "/schedule"]),
    ),
    matcher("file", 0.25, "file.appointments", (ctx) =>
      pathMatchesAny(ctx.filePaths, [/appointments/i, /scheduling/i]),
    ),
  ]),
  defineCapability("team", [
    matcher("strategy", 0.35, "strategy.team", (ctx) =>
      strategySectionMatches(ctx, /team|staff|physician|advisor|crew/i),
    ),
    matcher("route", 0.3, "route.team", (ctx) =>
      routeMatchesAny(ctx.routes, ["/team", "/about/team"]),
    ),
    matcher("component", 0.3, "component.team", (ctx) =>
      componentMatchesAny(ctx.componentIds, ["team", "physicians", "advisors", "staff"]),
    ),
  ]),
  defineCapability("gallery", [
    matcher("blueprint", 0.25, "blueprint.portfolio", (ctx) =>
      blueprintIncludesSection(ctx, "portfolio"),
    ),
    matcher("blueprint", 0.4, "assetManifest.photos", (ctx) =>
      Boolean(
        ctx.project.assetManifest?.items?.some((item) => item.url?.trim()),
      ),
    ),
    matcher("strategy", 0.3, "strategy.gallery", (ctx) =>
      strategySectionMatches(ctx, /gallery|photos|media|collection/i),
    ),
    matcher("component", 0.35, "component.gallery", (ctx) =>
      componentMatchesAny(ctx.componentIds, [
        "gallery",
        "atmosphere",
        "collection",
        "architecture",
      ]),
    ),
    matcher("file", 0.35, "file.site-images", (ctx) => {
      const siteImages = ctx.files.find((file) =>
        /^lib\/site-images\.(ts|js)$/.test(file.path.replace(/\\/g, "/")),
      );
      return Boolean(
        siteImages?.content &&
          /https?:\/\//.test(siteImages.content) &&
          !/HERO_IMAGE[^=]*=\s*""/.test(siteImages.content.replace(/\s/g, "")),
      );
    }),
    matcher("content", 0.15, "content.gallery", (ctx) =>
      includesAny(haystack(ctx), ["gallery", "photo gallery"]),
    ),
  ]),
  defineCapability("portfolio", [
    matcher("blueprint", 0.35, "blueprint.portfolio", (ctx) =>
      blueprintIncludesSection(ctx, "portfolio"),
    ),
    matcher("strategy", 0.3, "strategy.portfolio", (ctx) =>
      strategySectionMatches(ctx, /portfolio|case study|selected work|projects/i),
    ),
    matcher("component", 0.3, "component.portfolio", (ctx) =>
      componentMatchesAny(ctx.componentIds, ["portfolio", "work", "collection"]),
    ),
    matcher("route", 0.2, "route.portfolio", (ctx) =>
      routeMatchesAny(ctx.routes, ["/portfolio", "/work", "/projects"]),
    ),
  ]),
  defineCapability("testimonials", [
    matcher("blueprint", 0.4, "blueprint.testimonials", (ctx) =>
      blueprintIncludesSection(ctx, "testimonials"),
    ),
    matcher("strategy", 0.3, "strategy.testimonials", (ctx) =>
      strategySectionMatches(ctx, /testimonial|review|client story|social proof/i),
    ),
    matcher("component", 0.3, "component.testimonials", (ctx) =>
      componentMatchesAny(ctx.componentIds, ["testimonial", "reviews"]),
    ),
    matcher("content", 0.15, "content.testimonials", (ctx) =>
      includesAny(haystack(ctx), ["testimonial", "what clients say"]),
    ),
  ]),
  defineCapability("faq", [
    matcher("blueprint", 0.15, "blueprint.services", (ctx) =>
      blueprintIncludesSection(ctx, "services"),
    ),
    matcher("strategy", 0.35, "strategy.faq", (ctx) =>
      strategySectionMatches(ctx, /faq|frequently asked|questions/i),
    ),
    matcher("component", 0.35, "component.faq", (ctx) =>
      componentMatchesAny(ctx.componentIds, ["faq", "accordion"]),
    ),
    matcher("content", 0.2, "content.faq", (ctx) =>
      includesAny(haystack(ctx), ["faq", "frequently asked"]),
    ),
  ]),
  defineCapability("forms", [
    matcher("blueprint", 0.35, "blueprint.contact", (ctx) =>
      blueprintIncludesSection(ctx, "contact"),
    ),
    matcher("strategy", 0.25, "strategy.contact", (ctx) =>
      strategySectionMatches(ctx, /contact|form|inquiry|lead/i),
    ),
    matcher("component", 0.3, "component.contact", (ctx) =>
      componentMatchesAny(ctx.componentIds, ["contact", "form"]),
    ),
    matcher("route", 0.2, "route.contact", (ctx) =>
      routeMatchesAny(ctx.routes, ["/contact"]),
    ),
    matcher("file", 0.25, "file.forms", (ctx) =>
      pathMatchesAny(ctx.filePaths, [/\/api\/contact/i, /contact-form/i, /form-layout/i]),
    ),
    matcher("setting", 0.15, "setting.formWebhook", (ctx) =>
      Boolean(ctx.settings.formWebhookUrl || ctx.settings.formEmailTo),
    ),
  ]),
  defineCapability("analytics", [
    matcher("strategy", 0.25, "strategy.analytics", (ctx) =>
      strategySectionMatches(ctx, /analytics|metrics|kpi|insights/i),
    ),
    matcher("file", 0.35, "file.analytics", (ctx) =>
      pathMatchesAny(ctx.filePaths, [/analytics/i, /gtag/i, /mixpanel/i]),
    ),
    matcher("dependency", 0.35, "dependency.analytics", (ctx) =>
      includesAny(ctx.dependencies.join(" "), [
        "@vercel/analytics",
        "mixpanel",
        "posthog",
        "@plausible",
      ]),
    ),
    matcher("content", 0.15, "content.analytics", (ctx) =>
      includesAny(haystack(ctx), ["google analytics", "conversion tracking"]),
    ),
  ]),
  defineCapability("seo", [
    matcher("strategy", 0.2, "strategy.seo", (ctx) =>
      Boolean(ctx.strategy?.seoFocus?.length),
    ),
    matcher("file", 0.35, "file.seo", (ctx) =>
      pathMatchesAny(ctx.filePaths, [/sitemap/i, /robots\.txt/i, /metadata/i, /seo/i]),
    ),
    matcher("content", 0.25, "content.seoPackage", (ctx) => ctx.hasSeoPackage),
    matcher("component", 0.15, "component.seo", (ctx) =>
      includesAny((ctx.project.seo ?? []).join(" ").toLowerCase(), ["meta", "sitemap", "schema"]),
    ),
  ]),
  defineCapability("authentication", [
    matcher("setting", 0.4, "setting.requiresAuth", (ctx) =>
      settingTruthy(ctx.settings, "requiresAuth"),
    ),
    matcher("route", 0.35, "route.auth", (ctx) =>
      routeMatchesAny(ctx.routes, ["/login", "/register", "/sign-in", "/auth"]),
    ),
    matcher("file", 0.35, "file.auth", (ctx) =>
      pathMatchesAny(ctx.filePaths, [/^middleware\.ts$/, /\/auth\//i, /next-auth/i, /session\.ts/i]),
    ),
    matcher("dependency", 0.25, "dependency.auth", (ctx) =>
      includesAny(ctx.dependencies.join(" "), ["next-auth", "@clerk", "@auth/"]),
    ),
  ]),
  defineCapability("dashboard", [
    matcher("setting", 0.4, "setting.requiresDashboard", (ctx) =>
      settingTruthy(ctx.settings, "requiresDashboard"),
    ),
    matcher("route", 0.4, "route.dashboard", (ctx) =>
      routeMatchesAny(ctx.routes, ["/dashboard", "/admin"]),
    ),
    matcher("file", 0.3, "file.dashboard", (ctx) =>
      pathMatchesAny(ctx.filePaths, [/^app\/dashboard\//, /^app\/admin\//]),
    ),
  ]),
  defineCapability("multi-language", [
    matcher("strategy", 0.25, "strategy.localization", (ctx) =>
      includesAny(
        (ctx.strategy?.contentStrategy.messagingPillars ?? []).join(" "),
        ["bilingual", "multilingual", "localization"],
      ),
    ),
    matcher("route", 0.35, "route.locale", (ctx) =>
      pathMatchesAny(ctx.filePaths, [/\[locale\]/, /\/i18n\//, /\/locales\//]),
    ),
    matcher("file", 0.3, "file.i18n", (ctx) =>
      pathMatchesAny(ctx.filePaths, [/i18n\.ts/i, /next-intl/i, /messages\//]),
    ),
    matcher("setting", 0.2, "setting.language", (ctx) => {
      const lang = String(ctx.language ?? ctx.settings.language ?? "").toLowerCase();
      return lang.includes("bilingual") || lang.includes("multi");
    }),
    matcher("dependency", 0.2, "dependency.i18n", (ctx) =>
      includesAny(ctx.dependencies.join(" "), ["next-intl", "react-i18next"]),
    ),
  ]),
  defineCapability("search", [
    matcher("strategy", 0.3, "strategy.search", (ctx) =>
      strategySectionMatches(ctx, /search|find/i),
    ),
    matcher("route", 0.35, "route.search", (ctx) =>
      routeMatchesAny(ctx.routes, ["/search"]),
    ),
    matcher("file", 0.35, "file.search", (ctx) =>
      pathMatchesAny(ctx.filePaths, [/\/api\/search/i, /search\.tsx/i]),
    ),
    matcher("component", 0.2, "component.search", (ctx) =>
      componentMatchesAny(ctx.componentIds, ["search"]),
    ),
  ]),
  defineCapability("payments", [
    matcher("strategy", 0.25, "strategy.payments", (ctx) =>
      strategySectionMatches(ctx, /payment|checkout|billing|stripe/i),
    ),
    matcher("route", 0.3, "route.checkout", (ctx) =>
      routeMatchesAny(ctx.routes, ["/checkout", "/billing", "/payments"]),
    ),
    matcher("component", 0.25, "component.checkout", (ctx) =>
      componentMatchesAny(ctx.componentIds, ["checkout", "pricing", "payment"]),
    ),
    matcher("file", 0.3, "file.payments", (ctx) =>
      pathMatchesAny(ctx.filePaths, [/stripe/i, /checkout/i, /payment/i]),
    ),
    matcher("dependency", 0.35, "dependency.stripe", (ctx) =>
      includesAny(ctx.dependencies.join(" "), ["stripe", "@stripe"]),
    ),
  ]),
  defineCapability("inventory", [
    matcher("strategy", 0.3, "strategy.inventory", (ctx) =>
      strategySectionMatches(ctx, /inventory|stock|warehouse/i),
    ),
    matcher("file", 0.4, "file.inventory", (ctx) =>
      pathMatchesAny(ctx.filePaths, [/inventory/i, /stock/i]),
    ),
    matcher("route", 0.25, "route.inventory", (ctx) =>
      routeMatchesAny(ctx.routes, ["/inventory"]),
    ),
  ]),
  defineCapability("orders", [
    matcher("strategy", 0.3, "strategy.orders", (ctx) =>
      strategySectionMatches(ctx, /orders|order management/i),
    ),
    matcher("route", 0.35, "route.orders", (ctx) =>
      routeMatchesAny(ctx.routes, ["/orders"]),
    ),
    matcher("file", 0.35, "file.orders", (ctx) =>
      pathMatchesAny(ctx.filePaths, [/\/api\/orders/i, /orders\//i]),
    ),
  ]),
  defineCapability("reviews", [
    matcher("strategy", 0.3, "strategy.reviews", (ctx) =>
      strategySectionMatches(ctx, /reviews?|ratings?/i),
    ),
    matcher("component", 0.3, "component.reviews", (ctx) =>
      componentMatchesAny(ctx.componentIds, ["review", "rating"]),
    ),
    matcher("content", 0.2, "content.reviews", (ctx) =>
      includesAny(haystack(ctx), ["customer reviews", "star rating"]),
    ),
  ]),
  defineCapability("maps", [
    matcher("strategy", 0.3, "strategy.maps", (ctx) =>
      strategySectionMatches(ctx, /map|location|directions/i),
    ),
    matcher("component", 0.25, "component.maps", (ctx) =>
      componentMatchesAny(ctx.componentIds, ["map", "location"]),
    ),
    matcher("file", 0.35, "file.maps", (ctx) =>
      pathMatchesAny(ctx.filePaths, [/google.*maps/i, /mapbox/i, /leaflet/i]),
    ),
    matcher("dependency", 0.3, "dependency.maps", (ctx) =>
      includesAny(ctx.dependencies.join(" "), ["@react-google-maps", "mapbox", "leaflet"]),
    ),
  ]),
  defineCapability("chat", [
    matcher("strategy", 0.25, "strategy.chat", (ctx) =>
      strategySectionMatches(ctx, /chat|live support|messaging/i),
    ),
    matcher("file", 0.35, "file.chat", (ctx) =>
      pathMatchesAny(ctx.filePaths, [/chat/i, /intercom/i, /crisp/i]),
    ),
    matcher("dependency", 0.35, "dependency.chat", (ctx) =>
      includesAny(ctx.dependencies.join(" "), ["intercom", "crisp-sdk", "tawk"]),
    ),
    matcher("component", 0.2, "component.chat", (ctx) =>
      componentMatchesAny(ctx.componentIds, ["chat", "messenger"]),
    ),
  ]),
  defineCapability("newsletter", [
    matcher("blueprint", 0.35, "blueprint.footer.newsletter", (ctx) =>
      Boolean(ctx.blueprint?.footerStyle?.newsletter),
    ),
    matcher("strategy", 0.25, "strategy.newsletter", (ctx) =>
      strategySectionMatches(ctx, /newsletter|subscribe|mailing list/i),
    ),
    matcher("file", 0.3, "file.newsletter", (ctx) =>
      pathMatchesAny(ctx.filePaths, [/newsletter/i, /subscribe/i, /mailchimp/i]),
    ),
    matcher("dependency", 0.25, "dependency.newsletter", (ctx) =>
      includesAny(ctx.dependencies.join(" "), ["mailchimp", "convertkit", "resend"]),
    ),
  ]),
  defineCapability("pricing", [
    matcher("blueprint", 0.45, "blueprint.pricing", (ctx) =>
      blueprintIncludesSection(ctx, "pricing"),
    ),
    matcher("strategy", 0.3, "strategy.pricing", (ctx) =>
      strategySectionMatches(ctx, /pricing|plans|packages|tiers/i),
    ),
    matcher("component", 0.3, "component.pricing", (ctx) =>
      componentMatchesAny(ctx.componentIds, ["pricing"]),
    ),
  ]),
];

export function getCapabilityDetectionDefinition(
  id: WebsiteCapabilityId,
): CapabilityDetectionDefinition | undefined {
  return CAPABILITY_DETECTION_DEFINITIONS.find((definition) => definition.id === id);
}

export function matchersForPhase(
  definition: CapabilityDetectionDefinition,
  phase: CapabilityMatchContext["phase"],
): CapabilityDetectionDefinition["matchers"] {
  if (phase === "initial") {
    return definition.matchers.filter((item) => INITIAL_SOURCES.has(item.source));
  }
  return definition.matchers;
}
