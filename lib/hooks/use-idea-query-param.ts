"use client";

import { useEffect, useRef } from "react";

/**
 * Prefill a prompt from ?idea= (One Prompt marketing → dashboard handoff).
 * Uses window.location to avoid Suspense boundaries around useSearchParams.
 */
export function useIdeaQueryParam(onIdea: (idea: string) => void) {
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current || typeof window === "undefined") return;
    const idea = new URLSearchParams(window.location.search).get("idea")?.trim();
    if (!idea) return;
    applied.current = true;
    onIdea(idea);
  }, [onIdea]);
}
