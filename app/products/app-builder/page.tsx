import { ProductRoutePage, productMetadata } from "@/lib/routes/product-page";

export const metadata = productMetadata("app-builder");

export default function Page() {
  return <ProductRoutePage slug="app-builder" />;
}
