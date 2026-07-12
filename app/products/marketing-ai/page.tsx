import { ProductRoutePage, productMetadata } from "@/lib/routes/product-page";

export const metadata = productMetadata("marketing-ai");

export default function Page() {
  return <ProductRoutePage slug="marketing-ai" />;
}
