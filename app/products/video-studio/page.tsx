import { ProductRoutePage, productMetadata } from "@/lib/routes/product-page";

export const metadata = productMetadata("video-studio");

export default function Page() {
  return <ProductRoutePage slug="video-studio" />;
}
