import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { WebsiteBuilderTool } from "@/components/dashboard/website-builder-tool";
import { getProductDefinition } from "@/lib/products/registry";
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

  const { data } = user
    ? await supabase
        .from("website_generations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(0, 19)
    : { data: [] };

  return (
    <>
      <DashboardHeader
        title={product.title}
        description={product.description}
        userEmail={user?.email}
        userName={metadata.full_name as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <WebsiteBuilderTool
          product={product}
          initialGenerations={(data ?? []) as WebsiteGeneration[]}
        />
      </main>
    </>
  );
}
