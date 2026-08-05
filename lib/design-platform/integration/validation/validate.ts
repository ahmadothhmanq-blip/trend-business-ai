import {
  tbdpAiBridgeInputSchema,
  tbdpBuilderBridgeInputSchema,
  tbdpDesignResolverInputSchema,
  tbdpTemplateResolverInputSchema,
} from "@/lib/design-platform/integration/schema/integration";

export function validateDesignResolverInput(input: unknown) {
  return tbdpDesignResolverInputSchema.safeParse(input);
}

export function validateTemplateResolverInput(input: unknown) {
  return tbdpTemplateResolverInputSchema.safeParse(input);
}

export function validateBuilderBridgeInput(input: unknown) {
  return tbdpBuilderBridgeInputSchema.safeParse(input);
}

export function validateAiBridgeInput(input: unknown) {
  return tbdpAiBridgeInputSchema.safeParse(input);
}
