import Link from "next/link";
import type { RelatedLink } from "@/lib/seo/internal-links";

const KIND_LABEL: Record<RelatedLink["kind"], string> = {
  tool: "Related tools",
  service: "Related services",
  template: "Related templates",
  blog: "Related articles",
  resource: "Business resources",
};

export function RelatedLinksSection({
  title = "Explore more",
  links,
  className,
}: {
  title?: string;
  links: RelatedLink[];
  className?: string;
}) {
  if (!links.length) return null;

  return (
    <section className={className} aria-label={title}>
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
        {title}
      </h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <li key={`${link.kind}:${link.href}:${link.title}`}>
            <Link
              href={link.href}
              className="block rounded-2xl border border-[rgba(212,175,55,0.16)] bg-[#111111] px-4 py-4 transition-colors hover:border-[rgba(212,175,55,0.36)]"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8A8A8A]">
                {KIND_LABEL[link.kind]}
              </p>
              <p className="mt-2 text-[15px] font-semibold text-white">{link.title}</p>
              <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[#A8A8A8]">
                {link.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RelatedLinksGroups({
  groups,
}: {
  groups: Array<{ title: string; links: RelatedLink[] }>;
}) {
  const visible = groups.filter((group) => group.links.length > 0);
  if (!visible.length) return null;

  return (
    <div className="space-y-12">
      {visible.map((group) => (
        <RelatedLinksSection key={group.title} title={group.title} links={group.links} />
      ))}
    </div>
  );
}
