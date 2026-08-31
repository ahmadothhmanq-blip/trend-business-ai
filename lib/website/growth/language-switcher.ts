import type { VisitorLocaleConfig } from "@/lib/website/site-plan/visitor-locales";

import { buildPublishedHreflangEntries } from "@/lib/website/site-plan/visitor-locales";

import { resolveLocaleFromLanguage } from "@/lib/i18n/website-output-locale";

import { PRIMARY_SITE_LANGUAGE } from "@/lib/language-platform/generation/options";



export type LanguageSwitcherOption = {

  code: string;

  label: string;

  href: string;

  dir: "ltr" | "rtl";

};



export function buildLanguageSwitcherOptions(params: {

  publicBaseUrl: string;

  config: VisitorLocaleConfig;

}): LanguageSwitcherOption[] {

  const entries = buildPublishedHreflangEntries(params);

  const languages = [

    params.config.primaryLocale,

    ...params.config.alternates,

  ];



  return languages.map((language) => {

    const resolved = resolveLocaleFromLanguage(language);

    const code = resolved.htmlLang.slice(0, 2);

    const href =

      entries.find(

        (e) => e.locale === code && e.locale !== "x-default",

      )?.href ??

      entries.find((e) => e.locale === "x-default")?.href ??

      params.publicBaseUrl;



    return {

      code,

      label: language,

      href,

      dir: resolved.dir,

    };

  });

}



function escapeHtml(value: string): string {

  return value

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;");

}



/**

 * Inline language switcher for published static HTML (no external JS bundle).

 * Primary URL is always English (`/w/{slug}`).

 */

export function buildPublishedLanguageSwitcherHtml(params: {

  publicBaseUrl: string;

  config: VisitorLocaleConfig;

  currentLocale?: string;

}): string {

  if (!params.config.enabled) return "";



  const options = buildLanguageSwitcherOptions({

    publicBaseUrl: params.publicBaseUrl,

    config: params.config,

  });

  if (options.length < 2) return "";



  const current =

    params.currentLocale?.trim().toLowerCase().slice(0, 2) ||

    resolveLocaleFromLanguage(PRIMARY_SITE_LANGUAGE).htmlLang.slice(0, 2);



  const currentOption =

    options.find((opt) => opt.code === current) ?? options[0]!;

  const switcherDir = currentOption.dir;

  const positionStyle =

    switcherDir === "rtl"

      ? "left:16px;right:auto;"

      : "right:16px;left:auto;";



  const links = options

    .map((opt) => {

      const active = opt.code === current;

      return `<a href="${escapeHtml(opt.href)}" hreflang="${escapeHtml(opt.code)}" lang="${escapeHtml(opt.code)}" role="menuitem"${

        active ? ' aria-current="page"' : ""

      } style="color:inherit;text-decoration:none;padding:4px 8px;border-radius:6px;${

        active ? "background:rgba(255,255,255,0.2);font-weight:600;" : ""

      }">${escapeHtml(opt.label)}</a>`;

    })

    .join("");



  return `<!-- tb-language-switcher -->

<nav id="tb-language-switcher" role="navigation" aria-label="Language selection" dir="${switcherDir}" style="position:fixed;bottom:16px;${positionStyle}z-index:9999;display:flex;gap:4px;padding:6px 8px;border-radius:12px;background:rgba(15,23,42,0.92);color:#f8fafc;font:12px/1.4 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,0.25);backdrop-filter:blur(8px);">

<div role="menubar" aria-label="Available languages" style="display:flex;gap:4px;flex-wrap:wrap;">

${links}

</div>

</nav>`;

}



export function injectLanguageSwitcherIntoHtml(

  html: string,

  switcherHtml: string,

): string {

  if (!switcherHtml.trim()) return html;

  if (/<\/body>/i.test(html)) {

    return html.replace(/<\/body>/i, `${switcherHtml}\n</body>`);

  }

  return `${html}\n${switcherHtml}`;

}

