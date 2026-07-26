"use client";

import Link from "next/link";
import { FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BuilderPageView } from "@/lib/website/builder/types";
import { useBuilderLocale } from "@/lib/website/builder/use-builder-locale";

type BuilderPagesSidebarProps = {
  pages: BuilderPageView[];
  selectedRoute: string;
  managementHref?: string;
  onSelectPage: (route: string) => void;
};

export function BuilderPagesSidebar({
  pages,
  selectedRoute,
  managementHref,
  onSelectPage,
}: BuilderPagesSidebarProps) {
  const { wb } = useBuilderLocale();

  return (
    <aside className="flex h-full flex-col border-e border-white/[0.08] bg-black/35 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
          {wb("builder.pages.title")}
        </p>
        {managementHref ? (
          <Link
            href={managementHref}
            className="inline-flex items-center gap-1 text-[10px] text-premium-gold/80 hover:text-premium-gold"
          >
            {wb("builder.pages.manage")}
            <ExternalLink className="size-3" aria-hidden />
          </Link>
        ) : null}
      </div>
      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {pages.map((page) => {
          const selected = page.route === selectedRoute;
          return (
            <li key={page.route}>
              <button
                type="button"
                onClick={() => onSelectPage(page.route)}
                className={cn(
                  "flex w-full items-start gap-2 rounded-xl border px-2.5 py-2 text-start text-xs transition",
                  selected
                    ? "border-premium-gold/35 bg-premium-gold/10 text-white"
                    : "border-transparent text-white/65 hover:border-white/10 hover:bg-white/[0.03]",
                )}
              >
                <FileText className="mt-0.5 size-3.5 shrink-0 text-white/40" aria-hidden />
                <span>
                  <span className="block font-medium">{page.label}</span>
                  <span className="mt-0.5 block text-[10px] text-white/40">
                    {page.route}
                  </span>
                  {!page.editableInCanvas ? (
                    <span className="mt-1 block text-[10px] text-amber-300/80">
                      {wb("builder.pages.editInManagement")}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
