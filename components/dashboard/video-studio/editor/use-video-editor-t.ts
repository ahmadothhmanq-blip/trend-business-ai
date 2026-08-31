"use client";

import { useProductT } from "@/lib/i18n/use-scoped-t";

/** Scoped translator for Video Studio scene editor (`products.videoStudio.editor.*`). */
export function useVideoEditorT() {
  const p = useProductT("videoStudio");
  const et = (key: string, values?: Record<string, string | number>) => p(`editor.${key}`, values);
  return { p, et };
}
