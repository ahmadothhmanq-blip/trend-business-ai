import { CategoryRoutePage, categoryMetadata } from "@/lib/routes/category-page";

export const metadata = categoryMetadata("design");

export default function DesignProductCategoryPage() {
  return <CategoryRoutePage id="design" />;
}
