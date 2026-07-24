"use client";

import { Globe } from "lucide-react";
import { useMemo } from "react";
import {
  SUPPORTED_LOCALES,
  getLocaleDefinition,
  type SupportedLocale,
} from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type LanguageSelectorProps = {
  variant?: "default" | "compact" | "ghost";
  className?: string;
};

export function LanguageSelector({
  variant = "default",
  className,
}: LanguageSelectorProps) {
  const { locale, setLocale, t, isPending } = useI18n();
  const current = useMemo(() => getLocaleDefinition(locale), [locale]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={variant === "ghost" ? "ghost" : "outline"}
          size={variant === "compact" ? "icon" : "sm"}
          className={cn(
            variant === "default" &&
              "h-9 gap-2 rounded-full border-white/10 bg-white/5 text-white/80 hover:border-premium-gold/25 hover:bg-premium-gold/10 hover:text-premium-gold-light",
            variant === "ghost" &&
              "h-9 gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/60 hover:border-premium-gold/25 hover:bg-premium-gold/10 hover:text-premium-gold-light",
            variant === "compact" &&
              "size-9 rounded-full border-white/10 bg-white/5 text-white/80 hover:border-premium-gold/25 hover:bg-premium-gold/10",
            className,
          )}
          disabled={isPending}
          aria-label={t("common.selectLanguage")}
        >
          <Globe className="size-4 shrink-0" aria-hidden="true" />
          {variant !== "compact" && (
            <span className="max-w-[120px] truncate text-xs font-medium">
              {current.nativeName}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[min(24rem,70vh)] w-56 overflow-y-auto border-white/10 bg-[#141414]/95 backdrop-blur-xl"
      >
        <DropdownMenuLabel className="text-white/50">
          {t("common.selectLanguage")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        {SUPPORTED_LOCALES.map((item) => (
          <DropdownMenuItem
            key={item.code}
            className={cn(
              "text-white/75 focus:bg-premium-gold/10 focus:text-premium-gold-light",
              item.code === locale && "bg-premium-gold/10 text-premium-gold-light",
            )}
            onClick={() => setLocale(item.code as SupportedLocale)}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span>{item.nativeName}</span>
              <span className="text-[10px] text-white/35 uppercase">
                {item.code}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
