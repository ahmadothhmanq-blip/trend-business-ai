/**
 * Serialize / deserialize link editor state for durable source persistence.
 */

import {
  defaultLinkRel,
  type LinkRelFlag,
  type LinkTarget,
  type VisualLink,
  type VisualLinkType,
} from "@/lib/ai-core/visual-editor/link-types";

export const WB_LINK_CONFIG_ATTR = "data-wb-link-config";
export const WB_LINK_ID_ATTR = "data-wb-link-id";

export type PersistedLinkConfigV1 = {
  v: 1;
  linkType: VisualLinkType;
  target: LinkTarget;
  rel: LinkRelFlag[];
  kind: VisualLink["kind"];
  alt?: string;
};

export function linkConfigPropName(propName: string): string {
  return `${propName}LinkConfig`;
}

export function serializeLinkConfig(
  link: Pick<VisualLink, "linkType" | "target" | "rel" | "kind" | "alt">,
): string {
  const payload: PersistedLinkConfigV1 = {
    v: 1,
    linkType: link.linkType,
    target: link.target,
    rel: [...link.rel],
    kind: link.kind,
    alt: link.alt,
  };
  return JSON.stringify(payload);
}

export function parseLinkConfig(raw: string | undefined | null): Partial<VisualLink> | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as PersistedLinkConfigV1;
    if (parsed.v !== 1) return null;
    return {
      linkType: parsed.linkType,
      target: parsed.target,
      rel: parsed.rel ?? defaultLinkRel(parsed.target),
      kind: parsed.kind,
      alt: parsed.alt,
    };
  } catch {
    return null;
  }
}

export function mergeLinkConfig(
  base: VisualLink,
  config: Partial<VisualLink> | null | undefined,
): VisualLink {
  if (!config) return base;
  return {
    ...base,
    ...config,
    rel: config.rel ?? base.rel,
  };
}

export type PersistedNavLink = {
  href: string;
  label: string;
  linkType?: VisualLinkType;
  target?: LinkTarget;
  rel?: string;
  linkConfig?: string;
};

export function navLinkToPersisted(link: VisualLink, href: string): PersistedNavLink {
  return {
    href,
    label: link.label,
    linkType: link.linkType,
    target: link.target,
    rel: link.rel.length ? link.rel.join(" ") : undefined,
    linkConfig: serializeLinkConfig(link),
  };
}

export function linksArrayLiteral(links: PersistedNavLink[]): string {
  return `[${links
    .map((l) => {
      const parts = [
        `href: ${JSON.stringify(l.href)}`,
        `label: ${JSON.stringify(l.label)}`,
      ];
      if (l.linkConfig) parts.push(`linkConfig: ${JSON.stringify(l.linkConfig)}`);
      if (l.target && l.target !== "same") parts.push(`target: ${JSON.stringify(l.target)}`);
      if (l.rel) parts.push(`rel: ${JSON.stringify(l.rel)}`);
      return `{ ${parts.join(", ")} }`;
    })
    .join(", ")}]`;
}
