"use client";

import type { CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Download,
  ExternalLink,
  Mail,
  Phone,
  Play,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import type {
  ButtonLinkType,
  ButtonPreviewState,
  ButtonRadiusPreset,
  ButtonSize,
  ButtonStyleVariant,
  ButtonTarget,
  ButtonWidth,
  VisualButton,
} from "@/lib/ai-core/visual-editor/button-types";
import {
  BUTTON_FONT_OPTIONS,
  BUTTON_ICON_OPTIONS,
  BUTTON_SIZE_PX,
  BUTTON_WEIGHT_OPTIONS,
  formatHref,
  stripHrefForEditor,
} from "@/lib/ai-core/visual-editor/button-types";
import { resolveButtonPreviewStyle } from "@/lib/ai-core/visual-editor/button-styles";

const ICON_MAP = {
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Mail,
  Phone,
  ExternalLink,
  Download,
  Play,
  Sparkles,
} as const;

type ButtonPropertiesPanelProps = {
  button: VisualButton;
  internalRoutes: Array<{ path: string; label: string }>;
  disabled?: boolean;
  previewState: ButtonPreviewState;
  onPreviewStateChange: (state: ButtonPreviewState) => void;
  onChange: (patch: Partial<VisualButton>) => void;
  /** When true, link fields are edited in LinkPropertiesPanel instead. */
  hideLinkFields?: boolean;
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
      onChange={(e) => props.onChange(e.target.value as T)}
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

function ColorField(props: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const normalized = props.value.startsWith("var(")
    ? "#d4af37"
    : props.value.startsWith("#")
      ? props.value
      : "#d4af37";
  return (
    <label className="flex items-center justify-between gap-2 text-[11px] text-white/55">
      {props.label}
      <input
        type="color"
        value={normalized}
        disabled={props.disabled}
        onChange={(e) => props.onChange(e.target.value)}
        className="h-8 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
      />
    </label>
  );
}

function renderIcon(name: string, className?: string) {
  const Icon = ICON_MAP[name as keyof typeof ICON_MAP];
  if (!Icon) return null;
  return <Icon className={className} aria-hidden />;
}

export function ButtonPropertiesPanel({
  button,
  internalRoutes,
  disabled,
  previewState,
  onPreviewStateChange,
  onChange,
  hideLinkFields = false,
}: ButtonPropertiesPanelProps) {
  const pt = useProductT("visualEditor");
  const bt = (key: string): string =>
    pt(`buttonEditor.${key}` as "buttonEditor.title");

  const previewStyle = resolveButtonPreviewStyle(button, previewState);

  const linkEditorValue = stripHrefForEditor(button.linkType, button.href);

  const patchColors = (patch: Partial<VisualButton["colors"]>) =>
    onChange({ colors: { ...button.colors, ...patch } });

  const patchTypography = (patch: Partial<VisualButton["typography"]>) =>
    onChange({ typography: { ...button.typography, ...patch } });

  const patchSpacing = (patch: Partial<VisualButton["spacing"]>) =>
    onChange({ spacing: { ...button.spacing, ...patch } });

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>{bt("preview")}</FieldLabel>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <button type="button" style={previewStyle as CSSProperties} disabled={button.disabled}>
            {button.icon === "left" && button.iconName
              ? renderIcon(button.iconName, "size-3.5")
              : null}
            {button.label || bt("labelPlaceholder")}
            {button.icon === "right" && button.iconName
              ? renderIcon(button.iconName, "size-3.5")
              : null}
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {(["normal", "hover", "disabled"] as ButtonPreviewState[]).map((state) => (
            <button
              key={state}
              type="button"
              onClick={() => onPreviewStateChange(state)}
              className={cn(
                "rounded-full px-2 py-1 text-[10px] font-medium capitalize",
                previewState === state
                  ? "bg-premium-gold/20 text-premium-gold-light"
                  : "text-white/45 hover:text-white/70",
              )}
            >
              {bt(`states.${state}`)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>{bt("text")}</FieldLabel>
        <Input
          value={button.label}
          disabled={disabled}
          onChange={(e) => onChange({ label: e.target.value })}
          className="border-white/10 bg-white/5 text-white"
          placeholder={bt("labelPlaceholder")}
        />
      </div>

      {!hideLinkFields ? (
        <>
      <div>
        <FieldLabel>{bt("link.type")}</FieldLabel>
        <SelectField<ButtonLinkType>
          value={button.linkType}
          disabled={disabled}
          onChange={(linkType) =>
            onChange({
              linkType,
              href: formatHref(linkType, linkEditorValue || button.href),
            })
          }
          options={[
            { value: "internal", label: bt("link.internal") },
            { value: "external", label: bt("link.external") },
            { value: "email", label: bt("link.email") },
            { value: "phone", label: bt("link.phone") },
            { value: "anchor", label: bt("link.anchor") },
          ]}
        />
        {button.linkType === "internal" ? (
          <SelectField
            value={
              internalRoutes.some((r) => r.path === button.href)
                ? button.href
                : button.href.startsWith("/")
                  ? button.href
                  : `/${button.href}`
            }
            disabled={disabled}
            onChange={(href) => onChange({ href })}
            options={[
              ...internalRoutes,
              ...(internalRoutes.some((r) => r.path === button.href)
                ? []
                : [{ path: button.href, label: button.href }]),
            ].map((r) => ({
              value: r.path,
              label: `${r.label} (${r.path})`,
            }))}
          />
        ) : (
          <Input
            value={linkEditorValue}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                href: formatHref(button.linkType, e.target.value),
              })
            }
            className="mt-2 border-white/10 bg-white/5 text-white"
            placeholder={bt("link.placeholder")}
          />
        )}
      </div>

      <div>
        <FieldLabel>{bt("target")}</FieldLabel>
        <SelectField<ButtonTarget>
          value={button.target}
          disabled={disabled}
          onChange={(target) => onChange({ target })}
          options={[
            { value: "same", label: bt("targetSame") },
            { value: "new", label: bt("targetNew") },
          ]}
        />
      </div>
        </>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <FieldLabel>{bt("style")}</FieldLabel>
          <SelectField<ButtonStyleVariant>
            value={button.style}
            disabled={disabled}
            onChange={(style) => onChange({ style })}
            options={[
              { value: "primary", label: bt("styles.primary") },
              { value: "secondary", label: bt("styles.secondary") },
              { value: "outline", label: bt("styles.outline") },
              { value: "ghost", label: bt("styles.ghost") },
              { value: "text", label: bt("styles.text") },
            ]}
          />
        </div>
        <div>
          <FieldLabel>{bt("size")}</FieldLabel>
          <SelectField<ButtonSize>
            value={button.size}
            disabled={disabled}
            onChange={(size) =>
              onChange({
                size,
                typography: {
                  ...button.typography,
                  fontSize: BUTTON_SIZE_PX[size],
                },
              })
            }
            options={[
              { value: "xs", label: "XS" },
              { value: "sm", label: bt("sizes.sm") },
              { value: "md", label: bt("sizes.md") },
              { value: "lg", label: bt("sizes.lg") },
              { value: "xl", label: "XL" },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <FieldLabel>{bt("width")}</FieldLabel>
          <SelectField<ButtonWidth>
            value={button.width}
            disabled={disabled}
            onChange={(width) => onChange({ width })}
            options={[
              { value: "auto", label: bt("widthAuto") },
              { value: "full", label: bt("widthFull") },
            ]}
          />
        </div>
        <div>
          <FieldLabel>{bt("radius")}</FieldLabel>
          <SelectField<ButtonRadiusPreset>
            value={button.radius}
            disabled={disabled}
            onChange={(radius) => onChange({ radius })}
            options={[
              { value: "square", label: bt("radiusSquare") },
              { value: "rounded", label: bt("radiusRounded") },
              { value: "pill", label: bt("radiusPill") },
              { value: "custom", label: bt("radiusCustom") },
            ]}
          />
        </div>
      </div>

      {button.radius === "custom" ? (
        <div>
          <FieldLabel>{bt("radiusCustomPx")}</FieldLabel>
          <Input
            type="number"
            min={0}
            max={48}
            value={button.customRadiusPx}
            disabled={disabled}
            onChange={(e) =>
              onChange({ customRadiusPx: Number(e.target.value) || 0 })
            }
            className="border-white/10 bg-white/5 text-white"
          />
        </div>
      ) : null}

      <div>
        <FieldLabel>{bt("colors")}</FieldLabel>
        <div className="space-y-2 rounded-lg border border-white/10 bg-white/[0.02] p-2">
          <ColorField
            label={bt("colorBackground")}
            value={button.colors.background}
            disabled={disabled}
            onChange={(background) => patchColors({ background })}
          />
          <ColorField
            label={bt("colorText")}
            value={button.colors.text}
            disabled={disabled}
            onChange={(text) => patchColors({ text })}
          />
          <ColorField
            label={bt("colorBorder")}
            value={button.colors.border}
            disabled={disabled}
            onChange={(border) => patchColors({ border })}
          />
          <ColorField
            label={bt("colorHoverBackground")}
            value={button.colors.hoverBackground}
            disabled={disabled}
            onChange={(hoverBackground) => patchColors({ hoverBackground })}
          />
          <ColorField
            label={bt("colorHoverText")}
            value={button.colors.hoverText}
            disabled={disabled}
            onChange={(hoverText) => patchColors({ hoverText })}
          />
        </div>
      </div>

      <div>
        <FieldLabel>{bt("typography")}</FieldLabel>
        <div className="space-y-2">
          <SelectField
            value={button.typography.fontFamily}
            disabled={disabled}
            onChange={(fontFamily) => patchTypography({ fontFamily })}
            options={BUTTON_FONT_OPTIONS.map((font) => ({
              value: font,
              label: font,
            }))}
          />
          <SelectField
            value={button.typography.fontWeight}
            disabled={disabled}
            onChange={(fontWeight) => patchTypography({ fontWeight })}
            options={BUTTON_WEIGHT_OPTIONS.map((weight) => ({
              value: weight,
              label: weight,
            }))}
          />
          <Input
            value={button.typography.fontSize}
            disabled={disabled}
            onChange={(e) => patchTypography({ fontSize: e.target.value })}
            className="border-white/10 bg-white/5 text-white"
            placeholder={bt("fontSize")}
          />
          <Input
            value={button.typography.letterSpacing}
            disabled={disabled}
            onChange={(e) => patchTypography({ letterSpacing: e.target.value })}
            className="border-white/10 bg-white/5 text-white"
            placeholder={bt("letterSpacing")}
          />
        </div>
      </div>

      <div>
        <FieldLabel>{bt("spacing")}</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={button.spacing.padding}
            disabled={disabled}
            onChange={(e) => patchSpacing({ padding: e.target.value })}
            className="border-white/10 bg-white/5 text-white"
            placeholder={bt("padding")}
          />
          <Input
            value={button.spacing.margin}
            disabled={disabled}
            onChange={(e) => patchSpacing({ margin: e.target.value })}
            className="border-white/10 bg-white/5 text-white"
            placeholder={bt("margin")}
          />
        </div>
      </div>

      <div>
        <FieldLabel>{bt("icon")}</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          <SelectField
            value={button.icon}
            disabled={disabled}
            onChange={(icon) =>
              onChange({
                icon,
                iconName: icon === "none" ? "" : button.iconName,
              })
            }
            options={[
              { value: "none", label: bt("iconNone") },
              { value: "left", label: bt("iconLeft") },
              { value: "right", label: bt("iconRight") },
            ]}
          />
          {button.icon !== "none" ? (
            <SelectField
              value={button.iconName}
              disabled={disabled}
              onChange={(iconName) => onChange({ iconName })}
              options={BUTTON_ICON_OPTIONS.filter((o) => o.id).map((o) => ({
                value: o.id,
                label: o.label,
              }))}
            />
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              className="border-white/15 text-white"
              onClick={() => onChange({ icon: "none", iconName: "" })}
            >
              {bt("iconRemove")}
            </Button>
          )}
        </div>
      </div>

      <div>
        <FieldLabel>{bt("accessibility")}</FieldLabel>
        <div className="space-y-2">
          <Input
            value={button.ariaLabel}
            disabled={disabled}
            onChange={(e) => onChange({ ariaLabel: e.target.value })}
            className="border-white/10 bg-white/5 text-white"
            placeholder="aria-label"
          />
          <Input
            value={button.title}
            disabled={disabled}
            onChange={(e) => onChange({ title: e.target.value })}
            className="border-white/10 bg-white/5 text-white"
            placeholder="title"
          />
          <label className="flex items-center gap-2 text-[11px] text-white/55">
            <input
              type="checkbox"
              checked={button.disabled}
              disabled={disabled}
              onChange={(e) => onChange({ disabled: e.target.checked })}
            />
            {bt("disabledState")}
          </label>
        </div>
      </div>
    </div>
  );
}
