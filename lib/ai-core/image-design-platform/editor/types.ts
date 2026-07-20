/**
 * Design Canvas — element, layer, and document types.
 */

export type CanvasElementType =
  | "image"
  | "text"
  | "shape"
  | "logo"
  | "icon"
  | "background";

export type TextAlign = "left" | "center" | "right";

export type CanvasTransform = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  scaleX: number;
  scaleY: number;
};

export type CanvasElementBase = {
  id: string;
  type: CanvasElementType;
  name: string;
  transform: CanvasTransform;
  locked: boolean;
  visible: boolean;
  zIndex: number;
};

export type ImageElement = CanvasElementBase & {
  type: "image";
  src: string;
  assetId?: string;
  fit: "cover" | "contain" | "fill";
};

export type TextElement = CanvasElementBase & {
  type: "text";
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: TextAlign;
  lineHeight: number;
};

export type ShapeElement = CanvasElementBase & {
  type: "shape";
  shape: "rectangle" | "circle" | "line";
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
};

export type LogoElement = CanvasElementBase & {
  type: "logo";
  src: string;
  svg?: string;
  brandKitId?: string;
};

export type IconElement = CanvasElementBase & {
  type: "icon";
  iconName: string;
  color: string;
};

export type BackgroundElement = CanvasElementBase & {
  type: "background";
  fill: string;
  gradient?: string;
  imageSrc?: string;
};

export type CanvasElement =
  | ImageElement
  | TextElement
  | ShapeElement
  | LogoElement
  | IconElement
  | BackgroundElement;

export type CanvasLayer = {
  id: string;
  name: string;
  elements: CanvasElement[];
  visible: boolean;
  locked: boolean;
  zIndex: number;
};

export type CanvasBrandBinding = {
  brandKitId?: string;
  brandName?: string;
  primary?: string;
  secondary?: string;
  accent?: string;
  headingFont?: string;
  bodyFont?: string;
  logoSvg?: string;
};

export type CanvasDocumentModel = {
  id: string;
  generationId: string;
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  layers: CanvasLayer[];
  brand?: CanvasBrandBinding;
  templateId?: string;
  version: number;
  updatedAt: string;
};

export type EditorHistoryEntry = {
  id: string;
  action: string;
  document: CanvasDocumentModel;
  timestamp: string;
};

export type CanvasSizePreset = {
  id: string;
  label: string;
  width: number;
  height: number;
  category: string;
};
