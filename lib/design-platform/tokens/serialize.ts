import type { TbdpDesignTokens } from "@/lib/design-platform/tokens/types";

/** Serializes TBDP tokens to a portable JSON document. */
export function serializeTbdpTokens(tokens: TbdpDesignTokens): string {
  return JSON.stringify(tokens, null, 2);
}

/** Parses a TBDP token JSON document. */
export function parseTbdpTokens(json: string): TbdpDesignTokens {
  return JSON.parse(json) as TbdpDesignTokens;
}
