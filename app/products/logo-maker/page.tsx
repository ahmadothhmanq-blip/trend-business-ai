import { ProductRoutePage, productMetadata } from "@/lib/routes/product-page";

export const metadata = productMetadata("logo-maker");

export default function Page() {
  return <ProductRoutePage slug="logo-maker" />;
}
