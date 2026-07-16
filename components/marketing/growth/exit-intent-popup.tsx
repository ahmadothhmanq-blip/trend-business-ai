"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { LeadCaptureForm } from "@/components/marketing/growth/lead-capture-form";

/**
 * Exit-intent popup — desktop mouseleave top, mobile after dwell time.
 */
export function ExitIntentPopup() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    if (typeof window === "undefined") return;

    const key = "tba_exit_intent_dismissed";
    if (sessionStorage.getItem(key) === "1") {
      setDismissed(true);
      return;
    }

    const onMouseLeave = (event: MouseEvent) => {
      if (event.clientY <= 0) setOpen(true);
    };

    const mobileTimer = window.setTimeout(() => {
      if (window.matchMedia("(max-width: 768px)").matches) setOpen(true);
    }, 45000);

    document.addEventListener("mouseout", onMouseLeave);
    return () => {
      document.removeEventListener("mouseout", onMouseLeave);
      window.clearTimeout(mobileTimer);
    };
  }, [dismissed]);

  function close() {
    setOpen(false);
    setDismissed(true);
    try {
      sessionStorage.setItem("tba_exit_intent_dismissed", "1");
    } catch {
      /* ignore */
    }
  }

  if (!open || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal
        aria-label="Stay connected"
        className="relative w-full max-w-md rounded-3xl border border-[rgba(212,175,55,0.25)] bg-[#0B0B0B] p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 text-[#7A7A7A] hover:text-white"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
          Before you go
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Get the AI growth playbook</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#A8A8A8]">
          Join the newsletter for product updates, launch templates and operator playbooks.
        </p>
        <div className="mt-5">
          <LeadCaptureForm source="exit_intent" compact onSuccess={close} />
        </div>
      </div>
    </div>
  );
}
