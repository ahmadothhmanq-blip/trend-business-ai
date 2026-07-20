/**
 * Image editing pipeline — orchestrates edit operations for the design editor.
 */

import type { ImageEditOperation } from "@/lib/ai-core/image-design-platform/editing/types";
import { runImageEdit } from "@/lib/ai-core/image-design-platform/editing/provider";
import { createId } from "@/lib/ai-core/image-design-platform/ids";
import type { ImageRasterAsset } from "@/lib/ai-core/image-design-platform/types";

export async function runDesignImageEdit(params: {
  operation: ImageEditOperation;
  sourceAsset: ImageRasterAsset;
  prompt?: string;
  scale?: number;
}): Promise<{ asset: ImageRasterAsset; message: string }> {
  const result = await runImageEdit({
    operation: params.operation,
    imageDataUrl: params.sourceAsset.dataUrl ?? undefined,
    imageUrl: params.sourceAsset.publicUrl ?? undefined,
    prompt: params.prompt,
    scale: params.scale,
  });

  const outputUrl = result.outputDataUrl ?? result.outputUrl;
  const asset: ImageRasterAsset = {
    id: createId("edit"),
    name: `${params.operation.replace(/_/g, " ")} result`,
    format: params.sourceAsset.format,
    mimeType: params.sourceAsset.mimeType,
    width: params.sourceAsset.width,
    height: params.sourceAsset.height,
    provider: result.provider,
    dataUrl: outputUrl?.startsWith("data:") ? outputUrl : undefined,
    publicUrl: outputUrl && !outputUrl.startsWith("data:") ? outputUrl : params.sourceAsset.publicUrl,
    status: result.status === "completed" ? "completed" : result.status === "fallback" ? "fallback" : "failed",
    prompt: params.prompt ?? params.sourceAsset.prompt,
    negativePrompt: params.sourceAsset.negativePrompt,
  };

  return { asset, message: result.message ?? "Edit complete." };
}

export function listSupportedEditOperations(): ImageEditOperation[] {
  return ["background_removal", "enhance", "upscale", "variation", "object_replace"];
}
