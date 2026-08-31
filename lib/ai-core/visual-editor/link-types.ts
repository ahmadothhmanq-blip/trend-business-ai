/**
 * Visual editor — unified link model for all clickable elements.
 */

export type VisualLinkType =
  | "internal"
  | "external"
  | "email"
  | "phone"
  | "whatsapp"
  | "telegram"
  | "anchor"
  | "download";

export type LinkTarget = "same" | "new";

export type LinkRelFlag =
  | "noopener"
  | "nofollow"
  | "noreferrer"
  | "sponsored"
  | "ugc";

export type LinkElementKind =
  | "button"
  | "cta"
  | "text"
  | "nav"
  | "footer"
  | "image"
  | "icon"
  | "logo";

export type LinkSourceKind =
  | "inline"
  | "prop"
  | "array-const"
  | "array-prop"
  | "logo"
  | "anchor";

export type LinkValidationStatus = "valid" | "warning" | "error";

export type LinkValidation = {
  status: LinkValidationStatus;
  message?: string;
};

export type VisualLink = {
  id: string;
  kind: LinkElementKind;
  label: string;
  linkType: VisualLinkType;
  href: string;
  target: LinkTarget;
  rel: LinkRelFlag[];
  sourceKind: LinkSourceKind;
  sourceIndex: number;
  /** Section export name this link belongs to. */
  sectionExportName: string;
  propName?: string;
  hrefPropName?: string;
  arrayPropName?: string;
  /** For image/icon links — alt text. */
  alt?: string;
  /** Associated button id when kind is button/cta (style edited separately). */
  buttonId?: string;
};

export const LINK_REL_OPTIONS: Array<{ id: LinkRelFlag; label: string }> = [
  { id: "noopener", label: "noopener" },
  { id: "nofollow", label: "nofollow" },
  { id: "noreferrer", label: "noreferrer" },
  { id: "sponsored", label: "sponsored" },
  { id: "ugc", label: "ugc" },
];

export function defaultLinkRel(target: LinkTarget): LinkRelFlag[] {
  return target === "new" ? ["noopener", "noreferrer"] : [];
}

export function createDefaultLink(
  partial: Pick<VisualLink, "id" | "label" | "kind" | "sourceKind" | "sourceIndex" | "sectionExportName"> &
    Partial<VisualLink>,
): VisualLink {
  const {
    id,
    label,
    kind,
    sourceKind,
    sourceIndex,
    sectionExportName,
    linkType,
    href,
    target,
    rel,
    propName,
    hrefPropName,
    arrayPropName,
    alt,
    buttonId,
  } = partial;

  const resolvedTarget = target ?? "same";
  return {
    id,
    label,
    kind,
    sourceKind,
    sourceIndex,
    sectionExportName,
    linkType: linkType ?? "internal",
    href: href ?? "/",
    target: resolvedTarget,
    rel: rel ?? defaultLinkRel(resolvedTarget),
    propName,
    hrefPropName,
    arrayPropName,
    alt,
    buttonId,
  };
}
