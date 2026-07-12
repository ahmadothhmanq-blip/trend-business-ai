import { ProductRoutePage, productMetadata } from "@/lib/routes/product-page";

export const metadata = productMetadata("website-builder");

export default function Page() {
  return <ProductRoutePage slug="website-builder" />;
}
