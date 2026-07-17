import { redirect } from "next/navigation";

/** @deprecated Use /dashboard/brand-studio (M03). */
export default function BrandDesignerPage() {
  redirect("/dashboard/brand-studio");
}
