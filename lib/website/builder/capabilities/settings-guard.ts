import { WB_WEBSITE_CAPABILITY_MANIFEST_SETTING } from "@/lib/website/builder/capabilities/constants";
import { ManifestWriteViolationError } from "@/lib/website/builder/capabilities/immutable";

function isManifestKey(prop: string | symbol): boolean {
  return (
    prop === WB_WEBSITE_CAPABILITY_MANIFEST_SETTING ||
    prop === "websiteCapabilityManifest"
  );
}

function guardSettingsObject(
  settings: Record<string, unknown>,
): Record<string, unknown> {
  return new Proxy(settings, {
    set(target, prop, value) {
      if (isManifestKey(prop)) {
        throw new ManifestWriteViolationError(
          `Blocked direct assignment to settings.${String(prop)}.`,
        );
      }
      return Reflect.set(target, prop, value);
    },
    defineProperty(target, prop, attributes) {
      if (isManifestKey(prop)) {
        throw new ManifestWriteViolationError(
          `Blocked direct defineProperty on settings.${String(prop)}.`,
        );
      }
      return Reflect.defineProperty(target, prop, attributes);
    },
    deleteProperty(target, prop) {
      if (isManifestKey(prop)) {
        throw new ManifestWriteViolationError(
          `Blocked direct delete of settings.${String(prop)}.`,
        );
      }
      return Reflect.deleteProperty(target, prop);
    },
  });
}

/** Wrap project settings to block direct manifest writes outside the service. */
export function guardProjectSettings<T extends { settings?: Record<string, unknown> }>(
  project: T,
): T {
  if (!project.settings) return project;
  return {
    ...project,
    settings: guardSettingsObject({ ...project.settings }),
  };
}
