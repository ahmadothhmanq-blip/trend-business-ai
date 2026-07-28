"use client";

import dynamic from "next/dynamic";
import { useTranslation } from "@/lib/i18n/client";
import type { ProductId } from "@/lib/products/types";
import type { WebsiteGeneration } from "@/types/database";

function WebsiteBuilderLoadingState() {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-sm text-white/50">
      {t("common.loading")}
    </div>
  );
}

const WebsiteBuilderTool = dynamic(
  () =>
    import(
      /* webpackChunkName: "website-builder-tool" */
      "@/components/dashboard/website-builder-tool"
    ).then((m) => m.WebsiteBuilderTool),
  {
    ssr: false,
    loading: () => <WebsiteBuilderLoadingState />,
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
