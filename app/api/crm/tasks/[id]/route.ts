import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { databaseErrorResponse } from "@/lib/api/errors";
import { updateTask } from "@/lib/crm/tasks";
import { NextResponse } from "next/server";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["todo", "in_progress", "done", "cancelled"]).optional(),
  title: z.string().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }
  const { data, error } = await updateTask(auth.supabase, auth.user!.id, id, parsed.data);
  if (error) return databaseErrorResponse("crm.tasks.update", error);
  return NextResponse.json({ task: data });
}
