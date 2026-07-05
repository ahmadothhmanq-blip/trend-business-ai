"use client";

import { RouteError } from "@/components/system/route-error";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return <RouteError error={error} reset={reset} />;
}
