import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { WorkspaceTool } from "@/components/dashboard/workspace/workspace-tool";
import { getWorkspaceDefinition } from "@/lib/workspace/registry";
import type { WorkspaceType } from "@/lib/workspace/types";
import type { WorkspaceGeneration } from "@/types/database";

export async function WorkspaceDashboardPage({
  workspaceType,
}: {
  workspaceType: WorkspaceType;
}) {
  const definition = getWorkspaceDefinition(workspaceType);
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
        .eq("workspace_type", workspaceType)
        .order("created_at", { ascending: false })
        .range(0, 9)
    : { data: [], count: 0 };

  return (
    <>
      <DashboardHeader
        title={definition.metadata.title}
        description={definition.metadata.description}
        userEmail={user?.email}
        userName={metadata.full_name as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <WorkspaceTool
          definition={definition}
          initialGenerations={(data ?? []) as WorkspaceGeneration[]}
          initialTotal={count ?? 0}
        />
      </main>
    </>
  );
}
