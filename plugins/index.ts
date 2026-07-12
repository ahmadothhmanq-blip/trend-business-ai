import { websitePlugin } from "@/plugins/website";
import {
  auditPlugin,
  brandPlugin,
  businessPlugin,
  contentPlugin,
  creativePlugin,
  managerPlugin,
  marketingPlugin,
  socialPlugin,
} from "@/plugins/workspace";

export const aiPlugins = {
  website: websitePlugin,
  brand: brandPlugin,
  content: contentPlugin,
  creative: creativePlugin,
  marketing: marketingPlugin,
  business: businessPlugin,
  manager: managerPlugin,
  audit: auditPlugin,
  social: socialPlugin,
} as const;

export type AIPluginId = keyof typeof aiPlugins;

export function getPlugin(id: AIPluginId) {
  return aiPlugins[id];
}

export { websitePlugin } from "@/plugins/website";
export * from "@/plugins/workspace";
export * from "@/plugins/types";
