"use client";

import {
  ArrowDown,
  ArrowUp,
  Copy,
  Layers,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import { BackgroundPropertiesPanel } from "@/components/dashboard/visual-editor/background-properties-panel";
import {
  resolveSectionPreviewStyle,
  sectionIsVisible,
} from "@/lib/ai-core/visual-editor/section-styles";
import {
  SECTION_TYPE_LABELS,
  type SectionAlignment,
  type SectionAnimation,
  type SectionLayoutWidth,
  type SectionOverflow,
  type SectionVisibility,
  type VisualSectionConfig,
} from "@/lib/ai-core/visual-editor/section-types";
import type { VisualSectionBackground } from "@/lib/ai-core/visual-editor/section-bg-types";
import type { VisualViewport } from "@/lib/ai-core/visual-editor/types";

type SectionPropertiesPanelProps = {
  config: VisualSectionConfig;
  viewport: VisualViewport;
  nodeIndex: number;
  nodeCount: number;
  locked?: boolean;
  disabled?: boolean;
  uploadingBackground?: boolean;
  sectionBackground?: VisualSectionBackground;
  onChange: (patch: Partial<VisualSectionConfig>) => void;
  onBackgroundChange?: (patch: Partial<VisualSectionBackground>) => void;
  onUploadBackground?: () => void;
  onMediaLibraryBackground?: () => void;
  onInsertBefore: () => void;
  onInsertAfter: () => void;
  onInsertAtEnd: () => void;
  onOpenTemplates: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveToPosition: (index: number) => void;
  onAiImprove: () => void;
  onAiRegenerate: () => void;
  onAiRewrite: () => void;
  onAiGenerateMore: () => void;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
      {children}
    </p>
  );
}

function SelectField<T extends string | number>(props: {
  value: T;
  options: Array<{ value: T; label: string }>;
  disabled?: boolean;
  onChange: (value: T) => void;
}) {
  return (
    <select
      value={String(props.value)}
      disabled={props.disabled}
      onChange={(e) => {
        const match = props.options.find((o) => String(o.value) === e.target.value);
        if (match) props.onChange(match.value);
      }}
      className="h-9 w-full rounded-md border border-white/10 bg-[#121212] px-2 text-[11px] text-white"
    >
      {props.options.map((opt) => (
        <option key={String(opt.value)} value={String(opt.value)}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function SectionPropertiesPanel({
  config,
  viewport,
  nodeIndex,
  nodeCount,
  locked,
  disabled,
  uploadingBackground,
  sectionBackground,
  onChange,
  onBackgroundChange,
  onUploadBackground,
  onMediaLibraryBackground,
  onInsertBefore,
  onInsertAfter,
  onInsertAtEnd,
  onOpenTemplates,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onMoveToPosition,
  onAiImprove,
  onAiRegenerate,
  onAiRewrite,
  onAiGenerateMore,
}: SectionPropertiesPanelProps) {
  const pt = useProductT("visualEditor");
  const st = (key: string): string =>
    pt(`sectionEditor.${key}` as "sectionEditor.title");

  const previewStyle = resolveSectionPreviewStyle(config, viewport);
  const visible = sectionIsVisible(config, viewport);

  const patchLayout = (patch: Partial<VisualSectionConfig["layout"]>) =>
    onChange({ layout: { ...config.layout, ...patch } });
  const patchSettings = (patch: Partial<VisualSectionConfig["settings"]>) =>
    onChange({ settings: { ...config.settings, ...patch } });
  const patchStyling = (patch: Partial<VisualSectionConfig["styling"]>) =>
    onChange({ styling: { ...config.styling, ...patch } });
  const patchAnimation = (patch: Partial<VisualSectionConfig["animation"]>) =>
    onChange({ animation: { ...config.animation, ...patch } });

  return (
    <div className="space-y-4">
      <div
        className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
        style={visible ? previewStyle : { display: "none" }}
      >
        <p className="text-[10px] uppercase tracking-wider text-white/40">
          {st("preview")}
        </p>
        <p className="mt-1 text-sm font-medium text-white">
          {SECTION_TYPE_LABELS[config.sectionType]} · {config.sectionExportName}
        </p>
        <p className="text-[11px] text-white/45">
          {st("position")} {nodeIndex + 1} / {nodeCount}
        </p>
      </div>
      {!visible ? (
        <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-200">
          {st("hiddenOnViewport")}
        </p>
      ) : null}

      <div>
        <FieldLabel>{st("operations")}</FieldLabel>
        <div className="grid grid-cols-2 gap-1.5">
          <Button type="button" size="sm" variant="outline" className="border-white/15 text-white" disabled={disabled} onClick={onInsertBefore}>
            <Plus className="size-3" /> {st("insertBefore")}
          </Button>
          <Button type="button" size="sm" variant="outline" className="border-white/15 text-white" disabled={disabled} onClick={onInsertAfter}>
            <Plus className="size-3" /> {st("insertAfter")}
          </Button>
          <Button type="button" size="sm" variant="outline" className="border-white/15 text-white" disabled={disabled} onClick={onInsertAtEnd}>
            <Layers className="size-3" /> {st("insertAtEnd")}
          </Button>
          <Button type="button" size="sm" variant="outline" className="border-white/15 text-white" disabled={disabled} onClick={onOpenTemplates}>
            <Layers className="size-3" /> {st("fromTemplates")}
          </Button>
          <Button type="button" size="sm" variant="outline" className="border-white/15 text-white" disabled={disabled || locked} onClick={onDuplicate}>
            <Copy className="size-3" /> {st("duplicate")}
          </Button>
          <Button type="button" size="sm" variant="outline" className="border-red-500/30 text-red-300" disabled={disabled || locked} onClick={onDelete}>
            <Trash2 className="size-3" /> {st("delete")}
          </Button>
        </div>
      </div>

      <div>
        <FieldLabel>{st("move")}</FieldLabel>
        <div className="flex flex-wrap gap-1.5">
          <Button type="button" size="sm" variant="outline" className="border-white/15 text-white" disabled={disabled || locked || nodeIndex <= 0} onClick={onMoveUp}>
            <ArrowUp className="size-3" /> {st("moveUp")}
          </Button>
          <Button type="button" size="sm" variant="outline" className="border-white/15 text-white" disabled={disabled || locked || nodeIndex >= nodeCount - 1} onClick={onMoveDown}>
            <ArrowDown className="size-3" /> {st("moveDown")}
          </Button>
          <select
            value={nodeIndex}
            disabled={disabled || locked}
            onChange={(e) => onMoveToPosition(Number(e.target.value))}
            className="h-8 rounded-md border border-white/10 bg-[#121212] px-2 text-[11px] text-white"
          >
            {Array.from({ length: nodeCount }, (_, i) => (
              <option key={i} value={i}>
                {st("position")} {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <FieldLabel>{st("visibility")}</FieldLabel>
        <SelectField<SectionVisibility>
          value={config.visibility}
          disabled={disabled}
          onChange={(visibility) => onChange({ visibility })}
          options={[
            { value: "show", label: st("visibilityShow") },
            { value: "hide", label: st("visibilityHide") },
            { value: "desktop", label: st("visibilityDesktop") },
            { value: "tablet", label: st("visibilityTablet") },
            { value: "mobile", label: st("visibilityMobile") },
          ]}
        />
      </div>

      <div>
        <FieldLabel>{st("layout")}</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          <SelectField<SectionLayoutWidth>
            value={config.layout.width}
            disabled={disabled}
            onChange={(width) => patchLayout({ width })}
            options={[
              { value: "full", label: st("widthFull") },
              { value: "boxed", label: st("widthBoxed") },
              { value: "container", label: st("widthContainer") },
            ]}
          />
          <SelectField<SectionAlignment>
            value={config.layout.alignment}
            disabled={disabled}
            onChange={(alignment) => patchLayout({ alignment })}
            options={[
              { value: "left", label: st("alignLeft") },
              { value: "center", label: st("alignCenter") },
              { value: "right", label: st("alignRight") },
              { value: "stretch", label: st("alignStretch") },
            ]}
          />
          <Input
            type="number"
            min={1}
            max={6}
            value={config.layout.columns}
            disabled={disabled}
            onChange={(e) => patchLayout({ columns: Number(e.target.value) || 1 })}
            className="border-white/10 bg-white/5 text-white"
            placeholder={st("columns")}
          />
          <Input
            value={config.layout.gap}
            disabled={disabled}
            onChange={(e) => patchLayout({ gap: e.target.value })}
            className="border-white/10 bg-white/5 text-white"
            placeholder={st("gap")}
          />
        </div>
      </div>

      <div>
        <FieldLabel>{st("settings")}</FieldLabel>
        <div className="space-y-2">
          <Input value={config.settings.htmlId} disabled={disabled} onChange={(e) => patchSettings({ htmlId: e.target.value, anchor: e.target.value.replace(/^#/, "") })} className="border-white/10 bg-white/5 text-white" placeholder={st("htmlId")} />
          <Input value={config.settings.anchor} disabled={disabled} onChange={(e) => patchSettings({ anchor: e.target.value.replace(/^#/, "") })} className="border-white/10 bg-white/5 text-white" placeholder={st("anchor")} />
          <Input value={config.settings.cssClasses} disabled={disabled} onChange={(e) => patchSettings({ cssClasses: e.target.value })} className="border-white/10 bg-white/5 text-white" placeholder={st("cssClasses")} />
          <Input value={config.settings.customAttributes} disabled={disabled} onChange={(e) => patchSettings({ customAttributes: e.target.value })} className="border-white/10 bg-white/5 text-white" placeholder={st("customAttributes")} />
        </div>
      </div>

      <div>
        <FieldLabel>{st("styling")}</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          <Input value={config.styling.padding} disabled={disabled} onChange={(e) => patchStyling({ padding: e.target.value })} className="border-white/10 bg-white/5 text-white" placeholder={st("padding")} />
          <Input value={config.styling.margin} disabled={disabled} onChange={(e) => patchStyling({ margin: e.target.value })} className="border-white/10 bg-white/5 text-white" placeholder={st("margin")} />
          <Input value={config.styling.borderWidth} disabled={disabled} onChange={(e) => patchStyling({ borderWidth: e.target.value })} className="border-white/10 bg-white/5 text-white" placeholder={st("borderWidth")} />
          <Input value={config.styling.borderColor} disabled={disabled} onChange={(e) => patchStyling({ borderColor: e.target.value })} className="border-white/10 bg-white/5 text-white" placeholder={st("borderColor")} />
          <Input value={config.styling.radius} disabled={disabled} onChange={(e) => patchStyling({ radius: e.target.value })} className="border-white/10 bg-white/5 text-white" placeholder={st("radius")} />
          <Input value={config.styling.shadow} disabled={disabled} onChange={(e) => patchStyling({ shadow: e.target.value })} className="border-white/10 bg-white/5 text-white" placeholder={st("shadow")} />
          <Input type="number" min={0} max={100} value={config.styling.opacity} disabled={disabled} onChange={(e) => patchStyling({ opacity: Number(e.target.value) || 100 })} className="border-white/10 bg-white/5 text-white" placeholder={st("opacity")} />
          <Input type="number" value={config.styling.zIndex} disabled={disabled} onChange={(e) => patchStyling({ zIndex: Number(e.target.value) || 0 })} className="border-white/10 bg-white/5 text-white" placeholder={st("zIndex")} />
          <SelectField<SectionOverflow>
            value={config.styling.overflow}
            disabled={disabled}
            onChange={(overflow) => patchStyling({ overflow })}
            options={[
              { value: "visible", label: st("overflowVisible") },
              { value: "hidden", label: st("overflowHidden") },
              { value: "auto", label: st("overflowAuto") },
              { value: "scroll", label: st("overflowScroll") },
            ]}
          />
        </div>
      </div>

      <div>
        <FieldLabel>{st("animation")}</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          <SelectField<SectionAnimation>
            value={config.animation.type}
            disabled={disabled}
            onChange={(type) => patchAnimation({ type })}
            options={[
              { value: "none", label: st("animNone") },
              { value: "fade", label: st("animFade") },
              { value: "slide", label: st("animSlide") },
              { value: "zoom", label: st("animZoom") },
            ]}
          />
          <Input type="number" min={0} value={config.animation.durationMs} disabled={disabled} onChange={(e) => patchAnimation({ durationMs: Number(e.target.value) || 0 })} className="border-white/10 bg-white/5 text-white" placeholder={st("duration")} />
          <Input type="number" min={0} value={config.animation.delayMs} disabled={disabled} onChange={(e) => patchAnimation({ delayMs: Number(e.target.value) || 0 })} className="col-span-2 border-white/10 bg-white/5 text-white" placeholder={st("delay")} />
        </div>
      </div>

      {sectionBackground && onBackgroundChange && onUploadBackground && onMediaLibraryBackground ? (
        <div>
          <FieldLabel>{st("background")}</FieldLabel>
          <BackgroundPropertiesPanel
            background={sectionBackground}
            viewport={viewport}
            disabled={disabled || locked}
            uploading={uploadingBackground}
            onChange={onBackgroundChange}
            onUploadClick={onUploadBackground}
            onMediaLibraryClick={onMediaLibraryBackground}
            onAiGenerateClick={() => onMediaLibraryBackground()}
          />
        </div>
      ) : null}

      <div>
        <FieldLabel>{st("ai")}</FieldLabel>
        <div className="grid grid-cols-2 gap-1.5">
          <Button type="button" size="sm" variant="outline" className="border-white/15 text-white" disabled={disabled} onClick={onAiImprove}>
            <Sparkles className="size-3" /> {st("aiImprove")}
          </Button>
          <Button type="button" size="sm" variant="outline" className="border-white/15 text-white" disabled={disabled} onClick={onAiRegenerate}>
            <Sparkles className="size-3" /> {st("aiRegenerate")}
          </Button>
          <Button type="button" size="sm" variant="outline" className="border-white/15 text-white" disabled={disabled} onClick={onAiRewrite}>
            <Sparkles className="size-3" /> {st("aiRewrite")}
          </Button>
          <Button type="button" size="sm" variant="outline" className="border-white/15 text-white" disabled={disabled} onClick={onAiGenerateMore}>
            <Sparkles className="size-3" /> {st("aiMoreItems")}
          </Button>
        </div>
      </div>
    </div>
  );
}
