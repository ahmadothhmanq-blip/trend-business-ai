"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { requestPasswordReset } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OfficialLogo } from "@/components/marketing/official-logo";
import { LanguageSelector } from "@/components/i18n/language-selector";
import { useTranslation } from "@/lib/i18n/client";

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean; message?: string } | null, formData: FormData) => {
      return requestPasswordReset(formData);
    },
    null,
  );

  return (
    <Card className="w-full max-w-md border-[rgb(212_175_55/0.2)] bg-[#111111] text-white shadow-[0_24px_80px_rgb(0_0_0/0.45)] backdrop-blur-xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex w-full items-center justify-between gap-2">
          <div className="flex-1" />
          <OfficialLogo size="md" />
          <div className="flex flex-1 justify-end">
            <LanguageSelector variant="compact" />
          </div>
        </div>
        <CardTitle className="text-xl">{t("auth.forgotPasswordTitle")}</CardTitle>
        <CardDescription>{t("auth.forgotPasswordSubtitle")}</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}
          {state?.success && (
            <div role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
              {state.message}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t-0 bg-transparent">
          <Button type="submit" className="w-full btn-gold text-luxury-black" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t("auth.sendingResetLink")}
              </>
            ) : (
              t("auth.sendResetLink")
            )}
          </Button>
          <Link href="/login" className="text-center text-sm text-muted-foreground hover:text-foreground">
            {t("auth.backToSignIn")}
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
