import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { WorkspaceTool } from "@/components/dashboard/workspace/workspace-tool";
import { getProductDefinition } from "@/lib/products/registry";
import type { ProductId } from "@/lib/products/types";
import { getWorkspaceDefinition } from "@/lib/workspace/registry";
import type { WorkspaceGeneration } from "@/types/database";

export async function ProductEnginePage({ productId }: { productId: ProductId }) {
  const product = getProductDefinition(productId);
  if (product.kind !== "workspace" || !product.workspaceType) {
    throw new Error(`Product ${productId} is not a workspace engine product.`);
  }

  const definition = getWorkspaceDefinition(product.workspaceType);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const metadata = user?.user_metadata ?? {};

  const { data, count } = user
    ? await supabase
        .from("workspace_generations")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .eq("workspace_type", product.workspaceType)
        .order("created_at", { ascending: false })
        .range(0, 19)
    : { data: [], count: 0 };

  return (
    <>
      <DashboardHeader
        title={product.title}
        description={product.description}
        userEmail={user?.email}
        userName={metadata.full_name as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <WorkspaceTool
          definition={definition}
          product={product}
          initialGenerations={(data ?? []) as WorkspaceGeneration[]}
          initialTotal={count ?? 0}
        />
      </main>
    </>
  );
}
