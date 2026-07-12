import { ProductRoutePage, productMetadata } from "@/lib/routes/product-page";

export const metadata = productMetadata("business-intelligence");

export default function Page() {
  return <ProductRoutePage slug="business-intelligence" />;
}
