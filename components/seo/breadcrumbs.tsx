import Link from "next/link";

export type BreadcrumbItem = {
  name: string;
  href?: string;
};

export function SeoBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-[13px] text-[#8A8A8A]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.name}-${index}`} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {item.href && !isLast ? (
                <Link href={item.href} className="transition-colors hover:text-[#D4AF37]">
                  {item.name}
                </Link>
              ) : (
                <span className={isLast ? "text-[#C7C7C7]" : undefined}>{item.name}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
