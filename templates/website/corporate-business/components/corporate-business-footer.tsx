"use client";


import { FlagshipRevealInit } from "@/lib/website/template-v2/motion/flagship-reveal-init";
export function CorporateBusinessFooter() {
  const year = new Date().getFullYear();
  return (
    <>
      <FlagshipRevealInit />
      <footer data-v2-component="corporate-business-footer" role="contentinfo" className="border-t border-[var(--border-default)] bg-[var(--color-background)] py-16">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="cb-font-display text-xl font-semibold">Atlas</p>
            <p className="mt-3 text-sm text-[var(--color-muted)]">Management consulting for global enterprise.</p>
          </div>
          <nav aria-label="Capabilities">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">Firm</p>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">
              <li><a href="#features" className="hover:text-[var(--color-foreground)]">Capabilities</a></li>
              <li><a href="#portfolio" className="hover:text-[var(--color-foreground)]">Case studies</a></li>
              <li><a href="#about" className="hover:text-[var(--color-foreground)]">About</a></li>
            </ul>
          </nav>
          <nav aria-label="Connect">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">Connect</p>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">
              <li><a href="#contact" className="hover:text-[var(--color-foreground)]">Contact</a></li>
              <li><a href="#stats" className="hover:text-[var(--color-foreground)]">Impact</a></li>
            </ul>
          </nav>
          <nav aria-label="Legal">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">Legal</p>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Terms</a></li>
            </ul>
          </nav>
        </div>
        <p className="mt-12 text-xs text-[var(--color-muted)]">© {year} Atlas Advisory. All rights reserved.</p>
      </div>
    </footer>
    </>
  );
}
