import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { WebsiteBuilderToolLazy } from "@/components/dashboard/product-engine/website-builder-tool-lazy";
import { getProductDefinition } from "@/lib/products/registry";
import { WEBSITE_LIST_COLUMNS } from "@/lib/api/list-selects";
import type { ProductId } from "@/lib/products/types";
import type { WebsiteGeneration } from "@/types/database";

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
    const { data: rows } = await supabase
      .from("website_generations")
      .select(WEBSITE_LIST_COLUMNS)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(0, 19);

    const list = (rows ?? []) as Omit<WebsiteGeneration, "blueprint">[];
    const firstId = list[0]?.id;

    if (firstId) {
      const { data: firstFull } = await supabase
        .from("website_generations")
        .select("*")
        .eq("id", firstId)
        .eq("user_id", user.id)
        .maybeSingle();

      initialGenerations = list.map((row) =>
        row.id === firstId && firstFull
          ? (firstFull as WebsiteGeneration)
          : ({ ...row, blueprint: { files: [] } } as unknown as WebsiteGeneration),
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
