"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  AI_PRODUCT_CATEGORIES,
  type AiProductCategoryId,
} from "@/lib/constants/marketing-content";

/**
 * Large cinematic AI PNG artwork for solution category cards.
 * Always loads real raster images from /public/images/ai — never SVG.
 */
export function SolutionIllustration({
  id,
  className,
  priority = false,
}: {
  id: AiProductCategoryId;
  className?: string;
  priority?: boolean;
}) {
  const category = AI_PRODUCT_CATEGORIES.find((item) => item.id === id)!;
  if (!category.image.endsWith(".png") && !category.image.endsWith(".jpg") && !category.image.endsWith(".webp")) {
    throw new Error(`SolutionIllustration requires a raster AI image, got: ${category.image}`);
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[22px] border border-[rgb(212_175_55/0.22)] bg-[#050505] shadow-[0_0_40px_rgba(212,175,55,0.08)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_30%_0%,rgb(212_175_55/0.14),transparent_45%),linear-gradient(180deg,transparent_58%,rgb(0_0_0/0.5))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
      <div className="relative aspect-[16/10] w-full">
        <Image
          src={category.image}
          alt={category.imageAlt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </div>
    </div>
  );
}

/**
 * Large cinematic AI PNG artwork for product / featured cards.
 * Always loads real raster images from /public/images/ai — never SVG.
 */
export function ProductIllustration({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  if (!src.endsWith(".png") && !src.endsWith(".jpg") && !src.endsWith(".webp")) {
    throw new Error(`ProductIllustration requires a raster AI image, got: ${src}`);
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] border border-[rgb(212_175_55/0.2)] bg-[#050505] shadow-[0_0_32px_rgba(212,175,55,0.06)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_30%_0%,rgb(212_175_55/0.12),transparent_45%),linear-gradient(180deg,transparent_58%,rgb(0_0_0/0.48))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/45 to-transparent" />
      <div className="relative aspect-[16/10] w-full">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </div>
    </div>
  );
}
