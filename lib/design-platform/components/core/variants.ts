import type { TbdpComponentSize, TbdpSizeMap, TbdpVariantMap } from "@/lib/design-platform/components/core/types";

/** Merges class names, filtering falsy values. */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Builds TBDP BEM class list: tbdp-{block} tbdp-{block}--{modifier} */
export function tbdpClass(
  block: string,
  modifiers?: Record<string, boolean | string | undefined>,
  className?: string,
): string {
  const base = `tbdp-${block}`;
  if (!modifiers) return cx(base, className);
  const mods = Object.entries(modifiers)
    .filter(([, active]) => Boolean(active))
    .map(([key]) => `${base}--${key}`);
  return cx(base, ...mods, className);
}

/** Resolves variant styles from a variant map. */
export function resolveVariant<T extends string>(
  variants: TbdpVariantMap<T>,
  variant: T,
): Record<string, string> {
  return variants[variant] ?? variants[Object.keys(variants)[0] as T];
}

/** Resolves size styles from a size map. */
export function resolveSize(sizes: TbdpSizeMap, size: TbdpComponentSize): Record<string, string> {
  return sizes[size] ?? sizes.md;
}

/** Merges token style objects into inline style (token refs only). */
export function mergeStyles(
  ...layers: Array<Record<string, string> | undefined>
): Record<string, string> {
  return Object.assign({}, ...layers.filter(Boolean));
}
