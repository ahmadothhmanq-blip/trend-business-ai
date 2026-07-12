import { CategoryRoutePage, categoryMetadata } from "@/lib/routes/category-page";

export const metadata = categoryMetadata("create");

export default function CreateProductCategoryPage() {
  return <CategoryRoutePage id="create" />;
}
