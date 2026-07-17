import { redirect } from "next/navigation";

/** @deprecated Use /dashboard/image-generator (M03). */
export default function CreativeStudioPage() {
  redirect("/dashboard/image-generator");
}
