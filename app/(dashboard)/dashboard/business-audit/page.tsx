import { redirect } from "next/navigation";

/** @deprecated Use /dashboard/feasibility-study (M03). */
export default function BusinessAuditPage() {
  redirect("/dashboard/feasibility-study");
}
