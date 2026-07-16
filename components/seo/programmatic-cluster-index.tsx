import Link from "next/link";
import { SiteShell } from "@/components/marketing/site/shell";
import {
  SiteBody,
  SiteEyebrow,
  SitePageHero,
} from "@/components/marketing/site/ui";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { collectionPageJsonLd, webPageJsonLd } from "@/lib/seo/json-ld";

export type ClusterIndexItem = {
  href: string;
  title: string;
  description: string;
};

export function ProgrammaticClusterIndex({
  path,
  eyebrow,
  title,
  description,
  items,
}: {
  path: string;
  eyebrow: string;
  title: string;
  description: string;
  items: ClusterIndexItem[];
}) {
  return (
    <>
      <JsonLdScript
        id={`${path.replace(/\//g, "")}-index-jsonld`}
        data={[
          webPageJsonLd({
            name: title,
            description,
            path,
            type: "CollectionPage",
          }),
          collectionPageJsonLd({
            name: title,
            description,
            path,
            items: items.map((item) => ({
              name: item.title,
              path: item.href,
              description: item.description,
            })),
          }),
        ]}
      />
      <SiteShell>
        <SitePageHero
          eyebrow={eyebrow}
          title={title}
          description={description}
          primary={{ label: "Explore products", href: "/features" }}
          secondary={{ label: "Contact sales", href: "/contact" }}
        />
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <SiteEyebrow>Browse</SiteEyebrow>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[#D4AF37]/40 hover:bg-white/[0.05]"
                >
                  <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                  <SiteBody className="mt-2 text-[15px] text-[#A8A8A8]">
                    {item.description}
                  </SiteBody>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </SiteShell>
    </>
  );
}
