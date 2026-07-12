import { ProductRoutePage, productMetadata } from "@/lib/routes/product-page";

export const metadata = productMetadata("landing-page-builder");

export default function Page() {
  return <ProductRoutePage slug="landing-page-builder" />;
}
