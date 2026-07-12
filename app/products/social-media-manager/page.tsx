import { ProductRoutePage, productMetadata } from "@/lib/routes/product-page";

export const metadata = productMetadata("social-media-manager");

export default function Page() {
  return <ProductRoutePage slug="social-media-manager" />;
}
