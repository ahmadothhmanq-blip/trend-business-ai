import type {
  GlsDirection,
  GlsTbdpTypographyProfileId,
  GlsTypographyProfileId,
  GlsTypographyScriptFamily,
} from "@/lib/language-platform/core/types";

export type GlsTypographyProfile = {
  id: GlsTypographyProfileId;
  scriptFamily: GlsTypographyScriptFamily;
  direction: GlsDirection;
  label: string;
  display: { fontFamily: string; fallback: string };
  body: { fontFamily: string; fallback: string };
  mono?: { fontFamily: string; fallback: string };
  tbdpProfileId: GlsTbdpTypographyProfileId;
};

export const GLS_TYPOGRAPHY_PROFILES: Record<GlsTypographyProfileId, GlsTypographyProfile> = {
  "latin-ltr": {
    id: "latin-ltr",
    scriptFamily: "latin",
    direction: "ltr",
    label: "Latin LTR",
    display: { fontFamily: "Inter", fallback: "system-ui, sans-serif" },
    body: { fontFamily: "Inter", fallback: "system-ui, sans-serif" },
    mono: { fontFamily: "IBM Plex Mono", fallback: "ui-monospace, monospace" },
    tbdpProfileId: "latin-ltr",
  },
  "latin-rtl": {
    id: "latin-rtl",
    scriptFamily: "latin",
    direction: "rtl",
    label: "Latin RTL",
    display: { fontFamily: "Inter", fallback: "system-ui, sans-serif" },
    body: { fontFamily: "Inter", fallback: "system-ui, sans-serif" },
    tbdpProfileId: "latin-rtl",
  },
  "arabic-ltr": {
    id: "arabic-ltr",
    scriptFamily: "arabic",
    direction: "ltr",
    label: "Arabic LTR",
    display: { fontFamily: "Noto Sans Arabic", fallback: "system-ui, sans-serif" },
    body: { fontFamily: "Noto Sans Arabic", fallback: "system-ui, sans-serif" },
    tbdpProfileId: "arabic-ltr",
  },
  "arabic-rtl": {
    id: "arabic-rtl",
    scriptFamily: "arabic",
    direction: "rtl",
    label: "Arabic RTL",
    display: { fontFamily: "Noto Naskh Arabic", fallback: "system-ui, sans-serif" },
    body: { fontFamily: "Noto Sans Arabic", fallback: "system-ui, sans-serif" },
    tbdpProfileId: "arabic-rtl",
  },
  "hebrew-rtl": {
    id: "hebrew-rtl",
    scriptFamily: "hebrew",
    direction: "rtl",
    label: "Hebrew RTL",
    display: { fontFamily: "Noto Sans Hebrew", fallback: "system-ui, sans-serif" },
    body: { fontFamily: "Noto Sans Hebrew", fallback: "system-ui, sans-serif" },
    tbdpProfileId: "latin-rtl",
  },
  "cjk-ltr": {
    id: "cjk-ltr",
    scriptFamily: "cjk",
    direction: "ltr",
    label: "CJK",
    display: { fontFamily: "Noto Sans SC", fallback: "system-ui, sans-serif" },
    body: { fontFamily: "Noto Sans SC", fallback: "system-ui, sans-serif" },
    tbdpProfileId: "latin-ltr",
  },
  "cyrillic-ltr": {
    id: "cyrillic-ltr",
    scriptFamily: "cyrillic",
    direction: "ltr",
    label: "Cyrillic",
    display: { fontFamily: "Noto Sans", fallback: "system-ui, sans-serif" },
    body: { fontFamily: "Noto Sans", fallback: "system-ui, sans-serif" },
    tbdpProfileId: "latin-ltr",
  },
  "indic-ltr": {
    id: "indic-ltr",
    scriptFamily: "indic",
    direction: "ltr",
    label: "Indic",
    display: { fontFamily: "Noto Sans Devanagari", fallback: "system-ui, sans-serif" },
    body: { fontFamily: "Noto Sans Devanagari", fallback: "system-ui, sans-serif" },
    tbdpProfileId: "latin-ltr",
  },
  "thai-ltr": {
    id: "thai-ltr",
    scriptFamily: "thai",
    direction: "ltr",
    label: "Thai",
    display: { fontFamily: "Noto Sans Thai", fallback: "system-ui, sans-serif" },
    body: { fontFamily: "Noto Sans Thai", fallback: "system-ui, sans-serif" },
    tbdpProfileId: "latin-ltr",
  },
  "greek-ltr": {
    id: "greek-ltr",
    scriptFamily: "greek",
    direction: "ltr",
    label: "Greek",
    display: { fontFamily: "Noto Sans", fallback: "system-ui, sans-serif" },
    body: { fontFamily: "Noto Sans", fallback: "system-ui, sans-serif" },
    tbdpProfileId: "latin-ltr",
  },
  "vietnamese-ltr": {
    id: "vietnamese-ltr",
    scriptFamily: "vietnamese",
    direction: "ltr",
    label: "Vietnamese",
    display: { fontFamily: "Noto Sans", fallback: "system-ui, sans-serif" },
    body: { fontFamily: "Noto Sans", fallback: "system-ui, sans-serif" },
    tbdpProfileId: "latin-ltr",
  },
};
