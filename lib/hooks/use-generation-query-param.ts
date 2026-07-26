"use client";

import { useEffect, useRef } from "react";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Open a website generation from ?generation=<uuid> (management → editor handoff).
 * Uses window.location to avoid Suspense boundaries around useSearchParams.
 */
export function useGenerationQueryParam(
  onGeneration: (generationId: string) => void | Promise<void>,
  onInvalid?: () => void,
) {
  const lastAppliedId = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = new URLSearchParams(window.location.search).get("generation")?.trim();
    if (!raw) {
      lastAppliedId.current = null;
      return;
    }
    if (lastAppliedId.current === raw) return;
    lastAppliedId.current = raw;
    if (!UUID_RE.test(raw)) {
      onInvalid?.();
      return;
    }
    void onGeneration(raw);
  }, [onGeneration, onInvalid]);
}
