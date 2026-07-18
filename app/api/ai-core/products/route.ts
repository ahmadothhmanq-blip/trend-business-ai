import { requireUser } from "@/lib/api/helpers";
import { listAiCoreProducts } from "@/lib/ai-core/products";
import { NextResponse } from "next/server";

/** GET /api/ai-core/products — unified AI Core product registry. */
export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  return NextResponse.json({
    products: listAiCoreProducts().map((product) => ({
      id: product.id,
      aliases: product.aliases,
      label: product.label,
      description: product.description,
    })),
    pipeline: [
      "idea",
      "strategy",
      "design",
      "assets",
      "generation",
      "quality",
      "finalize",
    ],
  });
}
