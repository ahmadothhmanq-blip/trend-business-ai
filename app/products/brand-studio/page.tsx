import { ProductRoutePage, productMetadata } from "@/lib/routes/product-page";

export const metadata = productMetadata("brand-studio");

export default function Page() {
  return <ProductRoutePage slug="brand-studio" />;
}
