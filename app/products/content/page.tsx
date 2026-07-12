import { CategoryRoutePage, categoryMetadata } from "@/lib/routes/category-page";

export const metadata = categoryMetadata("content");

export default function ContentProductCategoryPage() {
  return <CategoryRoutePage id="content" />;
}
