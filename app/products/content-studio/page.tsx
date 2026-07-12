import { ProductRoutePage, productMetadata } from "@/lib/routes/product-page";

export const metadata = productMetadata("content-studio");

export default function Page() {
  return <ProductRoutePage slug="content-studio" />;
}
