"use client";

import dynamic from "next/dynamic";
import type { ProductId } from "@/lib/products/types";
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
  productId,
  initialGenerations,
}: {
  productId: ProductId;
  initialGenerations: WebsiteGeneration[];
}) {
  return (
    <WebsiteBuilderTool
      productId={productId}
      initialGenerations={initialGenerations}
    />
  );
}
