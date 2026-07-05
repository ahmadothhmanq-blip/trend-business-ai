"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  variant?: "default" | "dashboard";
  title?: string;
  description?: string;
};

export function RouteError({
  error,
  reset,
  variant = "default",
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again or return to a safe page.",
}: RouteErrorProps) {
  useEffect(() => {
    console.error("[RouteError]", error);
  }, [error]);

  const isDashboard = variant === "dashboard";

  const content = (
    <Card
      className={
        isDashboard
          ? "w-full max-w-lg border-white/[0.08] bg-card/80 backdrop-blur-xl"
          : "w-full max-w-md border-border/60 bg-card/80 backdrop-blur-xl"
      }
      role="alert"
      aria-live="assertive"
    >
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-destructive/10 ring-1 ring-destructive/25">
          <AlertTriangle className="size-6 text-destructive" aria-hidden="true" />
        </div>
        <div className="mx-auto mb-2 flex justify-center">
          <BrandLogo size="md" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-center">
        {process.env.NODE_ENV === "development" && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-left font-mono text-xs text-destructive/90 break-all">
            {error.message}
            {error.digest ? `\nDigest: ${error.digest}` : null}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 border-t-0 bg-transparent sm:flex-row sm:justify-center">
        <Button
          type="button"
          onClick={reset}
          className="w-full btn-gold text-luxury-black sm:w-auto"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Try again
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full btn-ghost-gold sm:w-auto"
          asChild
        >
          <Link href={isDashboard ? "/dashboard" : "/"}>
            {isDashboard ? "Back to dashboard" : "Back to home"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );

  if (isDashboard) {
    return (
      <div className="flex flex-1 flex-col">
        <header className="dashboard-header border-b border-white/[0.08] px-4 py-5 sm:px-6 lg:px-8">
          <div className="pl-12 lg:pl-0">
            <h1 className="text-xl font-bold tracking-[-0.02em] text-white sm:text-2xl">
              Error
            </h1>
            <p className="mt-1 text-[14px] text-white/45">
              We couldn&apos;t load this page
            </p>
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
          {content}
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-30" aria-hidden="true" />
      {content}
    </div>
  );
}
