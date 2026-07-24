"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signUp } from "@/lib/actions/auth";
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

export function SignUpForm() {
  const { t } = useTranslation();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return signUp(formData);
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
        <CardTitle className="text-xl text-white">{t("auth.signUpTitle")}</CardTitle>
        <CardDescription className="text-[#B5B5B5]">
          {t("auth.signUpSubtitle")}
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="fullName">{t("auth.fullName")}</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder={t("auth.fullNamePlaceholder")}
              required
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t("auth.emailPlaceholder")}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t("auth.passwordMinPlaceholder")}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t-0 bg-transparent">
          <Button type="submit" className="w-full btn-gold text-luxury-black" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t("auth.creatingAccount")}
              </>
            ) : (
              t("auth.createAccountButton")
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t("auth.haveAccount")}{" "}
            <Link
              href="/login"
              className="font-medium text-premium-gold hover:underline"
            >
              {t("auth.signInLink")}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
