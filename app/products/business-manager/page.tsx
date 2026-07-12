import { ProductRoutePage, productMetadata } from "@/lib/routes/product-page";

export const metadata = productMetadata("business-manager");

export default function Page() {
  return <ProductRoutePage slug="business-manager" />;
}
