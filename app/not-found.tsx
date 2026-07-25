import { createPageMetadata } from "@/lib/seo/metadata";
import { NotFoundContent } from "@/components/marketing/not-found-content";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata() {
  const { t } = await getServerTranslator();
  return createPageMetadata({
    title: t("errors.notFound"),
    description: t("marketing.publicPages.notFound.description"),
    path: "/404",
    noIndex: true,
  });
}

export default function NotFound() {
  return <NotFoundContent />;
}
