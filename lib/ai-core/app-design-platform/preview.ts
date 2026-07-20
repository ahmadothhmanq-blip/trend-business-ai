/**
 * Live app preview payloads — device frames for management UI.
 */

import type {
  AppPreviewDevice,
  AppPreviewPayload,
  StructuredAppModel,
} from "@/lib/ai-core/app-design-platform/types";

export const PREVIEW_DEVICE_FRAMES: Record<
  AppPreviewDevice,
  { label: string; width: number; height: number }
> = {
  mobile: { label: "Mobile", width: 390, height: 844 },
  tablet: { label: "Tablet", width: 768, height: 1024 },
  desktop: { label: "Desktop", width: 1280, height: 800 },
};

export function buildAppPreviewPayload(
  model: StructuredAppModel,
  device: AppPreviewDevice = "desktop",
  activeScreenId?: string | null,
): AppPreviewPayload {
  const active =
    activeScreenId ||
    model.screens.find((s) => s.path !== "/login")?.id ||
    model.screens[0]?.id ||
    null;

  return {
    appName: model.settings.appName,
    device,
    screens: model.screens.map((s) => ({
      id: s.id,
      name: s.name,
      path: s.path,
    })),
    navigation: model.navigation,
    brand: model.brand,
    activeScreenId: active,
  };
}

export function previewScreenSummary(
  model: StructuredAppModel,
  screenId: string | null,
): {
  name: string;
  path: string;
  components: string[];
  roles: string[];
} | null {
  if (!screenId) return null;
  const screen = model.screens.find((s) => s.id === screenId);
  if (!screen) return null;
  return {
    name: screen.name,
    path: screen.path,
    components: screen.components,
    roles: screen.roles,
  };
}
