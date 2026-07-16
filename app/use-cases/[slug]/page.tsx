import type { Metadata } from "next";
import { ProgrammaticLandingPage } from "@/components/seo/programmatic-landing";
import { SeoService } from "@/lib/seo/engine";
import {
  getPublishedProgrammaticPages,
  getProgrammaticPageBySlug,
} from "@/lib/seo/programmatic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getPublishedProgrammaticPages("use-cases").map((page) => ({
    slug: page.path.split("/").pop()!,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getProgrammaticPageBySlug("use-cases", slug);
  if (!page || page.status !== "published") return {};
  return SeoService.createMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
  });
}

export default async function UseCasePage({ params }: PageProps) {
  const { slug } = await params;
  return <ProgrammaticLandingPage cluster="use-cases" slug={slug} />;
}
