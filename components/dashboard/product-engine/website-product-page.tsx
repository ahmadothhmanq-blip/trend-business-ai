import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { WebsiteBuilderToolLazy } from "@/components/dashboard/product-engine/website-builder-tool-lazy";
import { getProductDefinition } from "@/lib/products/registry";
import { WEBSITE_LIST_COLUMNS } from "@/lib/api/list-selects";
import { logger } from "@/lib/logger";
import type { ProductId } from "@/lib/products/types";
import type { WebsiteGeneration } from "@/types/database";

/** Core columns without blueprint — used if Phase 5 list columns fail. */
const WEBSITE_LIST_COLUMNS_CORE =
  "id,user_id,project_name,website_type,business_description,target_audience,language,color_style,design_style,page_count,features,is_favorite,created_at,updated_at";

function toListStub(
  row: Omit<WebsiteGeneration, "blueprint"> | Record<string, unknown>,
): WebsiteGeneration {
  return { ...row, blueprint: { files: [] } } as unknown as WebsiteGeneration;
}

/**
 * SSR loads a slim project list only — never blueprint JSONB.
 * Full blueprints hydrate on the client via GET /api/website-builder/[id].
 */
export async function WebsiteProductPage({ productId }: { productId: ProductId }) {
  const product = getProductDefinition(productId);
  if (product.kind !== "website") {
    throw new Error(`Product ${productId} is not a website engine product.`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const metadata = user?.user_metadata ?? {};

  let initialGenerations: WebsiteGeneration[] = [];

  if (user) {
    const { data: rows, error: listError } = await supabase
      .from("website_generations")
      .select(WEBSITE_LIST_COLUMNS)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(0, 19);

    if (listError) {
      logger.error("Website list load failed", "website-product-page", {}, listError);
      const { data: fallback, error: fallbackError } = await supabase
        .from("website_generations")
        .select(WEBSITE_LIST_COLUMNS_CORE)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(0, 19);

      if (fallbackError) {
        logger.error(
          "Website list core fallback failed",
          "website-product-page",
          {},
          fallbackError,
        );
      }

      initialGenerations = (fallback ?? []).map((row) => toListStub(row));
    } else {
      initialGenerations = (rows ?? []).map((row) =>
        toListStub(row as Omit<WebsiteGeneration, "blueprint">),
      );
    }
  }

  return (
    <>
      <DashboardHeader
        title={product.title}
        description={product.description}
        userEmail={user?.email}
        userName={metadata.full_name as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <WebsiteBuilderToolLazy
          product={product}
          initialGenerations={initialGenerations}
        />
      </main>
    </>
  );
}
