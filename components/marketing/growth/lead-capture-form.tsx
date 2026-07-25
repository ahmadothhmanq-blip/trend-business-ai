"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useScopedT } from "@/lib/i18n/use-scoped-t";
import { cn } from "@/lib/utils";

type LeadCaptureFormProps = {
  source?: "contact" | "cta" | "website" | "exit_intent";
  className?: string;
  compact?: boolean;
  onSuccess?: () => void;
};

export function LeadCaptureForm({
  source = "contact",
  className,
  compact = false,
  onSuccess,
}: LeadCaptureFormProps) {
  const t = useScopedT("marketing.growth.leadCapture");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/growth/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company: company || null,
          message: message || null,
          source,
          pagePath: typeof window !== "undefined" ? window.location.pathname : null,
          affiliateCode:
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("aff")
              : null,
          referralCode:
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("ref")
              : null,
          honeypot,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? t("submitFailed"));
      toast.success(t("successToast"));
      setName("");
      setEmail("");
      setCompany("");
      setMessage("");
      onSuccess?.();
      void fetch("/api/growth/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: "lead_submit",
          eventCategory: "conversion",
          pagePath: window.location.pathname,
        }),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("submitFailed"));
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "w-full rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#111111] px-4 py-3 text-sm text-white outline-none placeholder:text-[#5A5A5A] focus:border-[rgba(212,175,55,0.45)]";

  return (
    <form onSubmit={onSubmit} className={cn("space-y-3", className)}>
      <input
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
      />
      {!compact && (
        <input
          className={fieldClass}
          placeholder={t("namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      )}
      <input
        required
        type="email"
        className={fieldClass}
        placeholder={t("emailPlaceholder")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {!compact && (
        <>
          <input
            className={fieldClass}
            placeholder={t("companyPlaceholder")}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <textarea
            className={cn(fieldClass, "min-h-[110px] resize-y")}
            placeholder={t("messagePlaceholder")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </>
      )}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#FFD700,#D4AF37)] px-5 py-3 text-sm font-semibold text-[#111111] hover:brightness-110 disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
        {compact ? t("getEarlyAccess") : t("sendMessage")}
      </button>
    </form>
  );
}
