import { redirect } from "next/navigation";

/** @deprecated Use /dashboard/business-intelligence (M03). */
export default function BusinessManagerPage() {
  redirect("/dashboard/business-intelligence");
}
