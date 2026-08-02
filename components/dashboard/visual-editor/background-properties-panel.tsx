"use client";

import { ImageIcon, Loader2, Sparkles, Trash2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import {
  resolveSectionBgImageStyle,
  resolveSectionBgOverlayStyle,
  resolveSectionContainerStyle,
  sectionBgPreviewUrl,
  sectionHeightClass,
} from "@/lib/ai-core/visual-editor/section-bg-styles";
import type {
  BgDisplayMode,
  BgOverlayMode,
  BgPosition,
  BgSectionHeight,
  VisualSectionBackground,
} from "@/lib/ai-core/visual-editor/section-bg-types";
import type { VisualViewport } from "@/lib/ai-core/visual-editor/types";

type BackgroundPropertiesPanelProps = {
  background: VisualSectionBackground;
  viewport: VisualViewport;
  disabled?: boolean;
  uploading?: boolean;
  onChange: (patch: Partial<VisualSectionBackground>) => void;
  onUploadClick: () => void;
  onMediaLibraryClick: () => void;
  onAiGenerateClick?: () => void;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
      {children}
    </p>
  );
}

function SelectField<T extends string>(props: {
  value: T;
  options: Array<{ value: T; label: string }>;
  disabled?: boolean;
  onChange: (value: T) => void;
}) {
  return (
    <select
      value={props.value}
      disabled={props.disabled}
      onChange={(e) => {
        const match = props.options.find((o) => o.value === e.target.value);
        if (match) props.onChange(match.value);
      }}
      className="h-9 w-full rounded-md border border-white/10 bg-[#121212] px-2 text-[11px] text-white"
    >
      {props.options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function BackgroundPropertiesPanel({
  background: bg,
  viewport,
  disabled,
  uploading,
  onChange,
  onUploadClick,
  onMediaLibraryClick,
  onAiGenerateClick,
}: BackgroundPropertiesPanelProps) {
  const pt = useProductT("visualEditor");
  const bt = (key: string): string =>
    pt(`backgroundEditor.${key}` as "backgroundEditor.title");

  const previewUrl = sectionBgPreviewUrl(bg, viewport);
  const containerStyle = resolveSectionContainerStyle(bg);
  const imageStyle = resolveSectionBgImageStyle(bg, viewport);
  const overlayStyle = resolveSectionBgOverlayStyle(bg);
  const heightClass = sectionHeightClass(bg);

  const patchOverlay = (patch: Partial<VisualSectionBackground["overlay"]>) =>
    onChange({ overlay: { ...bg.overlay, ...patch } });
  const patchEffects = (patch: Partial<VisualSectionBackground["effects"]>) =>
    onChange({ effects: { ...bg.effects, ...patch } });
  const patchMobile = (patch: Partial<VisualSectionBackground["mobile"]>) =>
    onChange({ mobile: { ...bg.mobile, ...patch } });

  const setUrl = (url: string, source: VisualSectionBackground["source"] = "url") => {
    onChange({ url, source: url ? source : "none" });
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border border-white/10",
          heightClass,
        )}
        style={{
          ...containerStyle,
          minHeight: bg.sectionHeight === "custom" ? bg.customHeightPx : 140,
        }}
      >
        {previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={bg.decorative ? "" : bg.alt}
              className="absolute inset-0 h-full w-full"
              style={imageStyle}
            />
            <div className="absolute inset-0" style={overlayStyle} />
          </>
        ) : (
          <div className="flex h-full min-h-[140px] items-center justify-center bg-white/[0.04] text-white/30">
            <ImageIcon className="size-8" />
          </div>
        )}
        <p className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-0.5 text-[10px] text-white/70">
          {bt("preview")}
        </p>
      </div>

      <div>
        <FieldLabel>{bt("source")}</FieldLabel>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled || uploading}
            className="border-white/15 text-white"
            onClick={onUploadClick}
          >
            {uploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            {bt("upload")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            className="border-white/15 text-white"
            onClick={onMediaLibraryClick}
          >
            <ImageIcon className="size-3.5" />
            {bt("mediaLibrary")}
          </Button>
          {onAiGenerateClick ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              className="border-white/15 text-white"
              onClick={onAiGenerateClick}
            >
              <Sparkles className="size-3.5" />
              {bt("aiGenerate")}
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled || !bg.url}
            className="border-white/15 text-white"
            onClick={() => setUrl("")}
          >
            <Trash2 className="size-3.5" />
            {bt("remove")}
          </Button>
        </div>
        <Input
          value={bg.url}
          disabled={disabled}
          onChange={(e) => setUrl(e.target.value, "url")}
          className="mt-2 border-white/10 bg-white/5 text-white"
          placeholder={bt("urlPlaceholder")}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <FieldLabel>{bt("displayMode")}</FieldLabel>
          <SelectField<BgDisplayMode>
            value={bg.displayMode}
            disabled={disabled}
            onChange={(displayMode) => onChange({ displayMode })}
            options={[
              { value: "cover", label: bt("modes.cover") },
              { value: "contain", label: bt("modes.contain") },
              { value: "fill", label: bt("modes.fill") },
              { value: "fit-width", label: bt("modes.fitWidth") },
              { value: "fit-height", label: bt("modes.fitHeight") },
              { value: "repeat", label: bt("modes.repeat") },
              { value: "no-repeat", label: bt("modes.noRepeat") },
            ]}
          />
        </div>
        <div>
          <FieldLabel>{bt("position")}</FieldLabel>
          <SelectField<BgPosition>
            value={bg.position}
            disabled={disabled}
            onChange={(position) => onChange({ position })}
            options={[
              { value: "center", label: bt("positions.center") },
              { value: "top", label: bt("positions.top") },
              { value: "bottom", label: bt("positions.bottom") },
              { value: "left", label: bt("positions.left") },
              { value: "right", label: bt("positions.right") },
              { value: "custom", label: bt("positions.custom") },
            ]}
          />
        </div>
      </div>

      {bg.position === "custom" ? (
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={bg.positionX}
            disabled={disabled}
            onChange={(e) => onChange({ positionX: e.target.value })}
            className="border-white/10 bg-white/5 text-white"
            placeholder={bt("positionX")}
          />
          <Input
            value={bg.positionY}
            disabled={disabled}
            onChange={(e) => onChange({ positionY: e.target.value })}
            className="border-white/10 bg-white/5 text-white"
            placeholder={bt("positionY")}
          />
        </div>
      ) : null}

      <div>
        <FieldLabel>{bt("overlay")}</FieldLabel>
        <label className="mb-2 flex items-center gap-2 text-[11px] text-white/55">
          <input
            type="checkbox"
            checked={bg.overlay.enabled}
            disabled={disabled}
            onChange={(e) => patchOverlay({ enabled: e.target.checked })}
          />
          {bt("overlayEnabled")}
        </label>
        {bg.overlay.enabled ? (
          <div className="grid grid-cols-2 gap-2">
            <SelectField<BgOverlayMode>
              value={bg.overlay.mode}
              disabled={disabled}
              onChange={(mode) => patchOverlay({ mode })}
              options={[
                { value: "solid", label: bt("overlaySolid") },
                { value: "gradient", label: bt("overlayGradient") },
                { value: "none", label: bt("overlayNone") },
              ]}
            />
            <Input
              type="number"
              min={0}
              max={100}
              value={bg.overlay.opacity}
              disabled={disabled}
              onChange={(e) =>
                patchOverlay({ opacity: Number(e.target.value) || 0 })
              }
              className="border-white/10 bg-white/5 text-white"
              placeholder={bt("overlayOpacity")}
            />
            <Input
              value={bg.overlay.color}
              disabled={disabled}
              onChange={(e) => patchOverlay({ color: e.target.value })}
              className="border-white/10 bg-white/5 text-white"
              placeholder={bt("overlayColor")}
            />
            <Input
              value={bg.overlay.gradient}
              disabled={disabled || bg.overlay.mode !== "gradient"}
              onChange={(e) => patchOverlay({ gradient: e.target.value })}
              className="border-white/10 bg-white/5 text-white"
              placeholder={bt("overlayGradientValue")}
            />
            <Input
              type="number"
              min={0}
              max={40}
              value={bg.overlay.blur}
              disabled={disabled}
              onChange={(e) =>
                patchOverlay({ blur: Number(e.target.value) || 0 })
              }
              className="col-span-2 border-white/10 bg-white/5 text-white"
              placeholder={bt("overlayBlur")}
            />
          </div>
        ) : null}
      </div>

      <div>
        <FieldLabel>{bt("effects")}</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["brightness", bt("brightness"), 0, 200],
              ["contrast", bt("contrast"), 0, 200],
              ["saturation", bt("saturation"), 0, 200],
              ["grayscale", bt("grayscale"), 0, 100],
              ["blur", bt("blur"), 0, 20],
            ] as const
          ).map(([key, label, min, max]) => (
            <label key={key} className="text-[10px] text-white/50">
              {label}: {bg.effects[key]}
              <input
                type="range"
                min={min}
                max={max}
                disabled={disabled}
                value={bg.effects[key]}
                onChange={(e) =>
                  patchEffects({ [key]: Number(e.target.value) } as Partial<
                    VisualSectionBackground["effects"]
                  >)
                }
                className="mt-1 w-full"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <FieldLabel>{bt("parallax")}</FieldLabel>
          <label className="flex items-center gap-2 text-[11px] text-white/55">
            <input
              type="checkbox"
              checked={bg.parallax}
              disabled={disabled}
              onChange={(e) => onChange({ parallax: e.target.checked })}
            />
            {bt("parallaxOn")}
          </label>
        </div>
        <div>
          <FieldLabel>{bt("borderRadius")}</FieldLabel>
          <Input
            value={bg.borderRadius}
            disabled={disabled}
            onChange={(e) => onChange({ borderRadius: e.target.value })}
            className="border-white/10 bg-white/5 text-white"
            placeholder="0.75rem"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <FieldLabel>{bt("sectionHeight")}</FieldLabel>
          <SelectField<BgSectionHeight>
            value={bg.sectionHeight}
            disabled={disabled}
            onChange={(sectionHeight) => onChange({ sectionHeight })}
            options={[
              { value: "auto", label: bt("heights.auto") },
              { value: "sm", label: bt("heights.sm") },
              { value: "md", label: bt("heights.md") },
              { value: "lg", label: bt("heights.lg") },
              { value: "fullscreen", label: bt("heights.fullscreen") },
              { value: "custom", label: bt("heights.custom") },
            ]}
          />
        </div>
        {bg.sectionHeight === "custom" ? (
          <div>
            <FieldLabel>{bt("customHeightPx")}</FieldLabel>
            <Input
              type="number"
              min={120}
              value={bg.customHeightPx}
              disabled={disabled}
              onChange={(e) =>
                onChange({ customHeightPx: Number(e.target.value) || 480 })
              }
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
        ) : null}
      </div>

      <div>
        <FieldLabel>{bt("mobile")}</FieldLabel>
        <label className="mb-2 flex items-center gap-2 text-[11px] text-white/55">
          <input
            type="checkbox"
            checked={bg.mobile.hideOnMobile}
            disabled={disabled}
            onChange={(e) => patchMobile({ hideOnMobile: e.target.checked })}
          />
          {bt("hideOnMobile")}
        </label>
        <Input
          value={bg.mobile.url}
          disabled={disabled}
          onChange={(e) => patchMobile({ url: e.target.value })}
          className="mb-2 border-white/10 bg-white/5 text-white"
          placeholder={bt("mobileUrlPlaceholder")}
        />
        <div className="grid grid-cols-2 gap-2">
          <SelectField<BgDisplayMode>
            value={bg.mobile.displayMode}
            disabled={disabled}
            onChange={(displayMode) => patchMobile({ displayMode })}
            options={[
              { value: "cover", label: bt("modes.cover") },
              { value: "contain", label: bt("modes.contain") },
              { value: "fill", label: bt("modes.fill") },
            ]}
          />
          <SelectField<BgPosition>
            value={bg.mobile.position}
            disabled={disabled}
            onChange={(position) => patchMobile({ position })}
            options={[
              { value: "center", label: bt("positions.center") },
              { value: "top", label: bt("positions.top") },
              { value: "bottom", label: bt("positions.bottom") },
            ]}
          />
        </div>
      </div>

      <div>
        <FieldLabel>{bt("accessibility")}</FieldLabel>
        <label className="mb-2 flex items-center gap-2 text-[11px] text-white/55">
          <input
            type="checkbox"
            checked={bg.decorative}
            disabled={disabled}
            onChange={(e) => onChange({ decorative: e.target.checked })}
          />
          {bt("decorative")}
        </label>
        {!bg.decorative ? (
          <Input
            value={bg.alt}
            disabled={disabled}
            onChange={(e) => onChange({ alt: e.target.value })}
            className="border-white/10 bg-white/5 text-white"
            placeholder={bt("altPlaceholder")}
          />
        ) : null}
      </div>
    </div>
  );
}
