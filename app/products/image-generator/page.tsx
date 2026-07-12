import { ProductRoutePage, productMetadata } from "@/lib/routes/product-page";

export const metadata = productMetadata("image-generator");

export default function Page() {
  return <ProductRoutePage slug="image-generator" />;
}
