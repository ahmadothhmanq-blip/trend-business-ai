import { CategoryRoutePage, categoryMetadata } from "@/lib/routes/category-page";

export const metadata = categoryMetadata("business");

export default function BusinessProductCategoryPage() {
  return <CategoryRoutePage id="business" />;
}
