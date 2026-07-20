/**
 * Image editing provider abstraction — background removal, enhance, upscale, variation.
 */

export type ImageEditOperation =
  | "background_removal"
  | "enhance"
  | "upscale"
  | "variation"
  | "object_replace";

export type ImageEditRequest = {
  operation: ImageEditOperation;
  imageUrl?: string;
  imageDataUrl?: string;
  prompt?: string;
  maskDataUrl?: string;
  scale?: number;
  seed?: number;
};

export type ImageEditResult = {
  operation: ImageEditOperation;
  status: "completed" | "fallback" | "failed";
  outputUrl?: string;
  outputDataUrl?: string;
  provider: string;
  message?: string;
};

export interface ImageEditingProvider {
  id: string;
  label: string;
  isConfigured(): boolean;
  supports(operation: ImageEditOperation): boolean;
  edit(request: ImageEditRequest): Promise<ImageEditResult | null>;
}
