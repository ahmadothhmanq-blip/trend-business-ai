"use client";

import dynamic from "next/dynamic";
import type { ProductDefinition } from "@/lib/products/types";
import type { WebsiteGeneration } from "@/types/database";

const WebsiteBuilderTool = dynamic(
  () =>
    import("@/components/dashboard/website-builder-tool").then((m) => m.WebsiteBuilderTool),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-sm text-white/50">
        Loading website builder…
      </div>
    ),
  },
);

export function WebsiteBuilderToolLazy({
  product,
  initialGenerations,
}: {
  product: ProductDefinition;
  initialGenerations: WebsiteGeneration[];
}) {
  return (
    <WebsiteBuilderTool product={product} initialGenerations={initialGenerations} />
  );
}
