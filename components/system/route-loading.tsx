import { Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";

type RouteLoadingProps = {
  label?: string;
  description?: string;
};

export function RouteLoading({
  label = "Loading",
  description = "Please wait while we prepare your experience.",
}: RouteLoadingProps) {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-30" aria-hidden="true" />

      <div className="relative flex w-full max-w-md flex-col items-center rounded-xl border border-border/60 bg-card/80 p-8 text-center backdrop-blur-xl">
        <BrandLogo size="md" className="mb-6" />
        <Loader2
          className="mb-4 size-8 animate-spin text-premium-gold"
          aria-hidden="true"
        />
        <p className="text-base font-semibold text-foreground">{label}</p>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}
