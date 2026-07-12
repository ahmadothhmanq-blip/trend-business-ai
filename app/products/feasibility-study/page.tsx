import { ProductRoutePage, productMetadata } from "@/lib/routes/product-page";

export const metadata = productMetadata("feasibility-study");

export default function Page() {
  return <ProductRoutePage slug="feasibility-study" />;
}
