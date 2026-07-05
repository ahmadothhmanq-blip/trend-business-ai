"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { updatePassword } from "@/lib/actions/auth";
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
import { BrandLogo } from "@/components/ui/brand-logo";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean; message?: string } | null, formData: FormData) => {
      return updatePassword(formData);
    },
    null,
  );

  return (
    <Card className="w-full max-w-md border-border/60 bg-card/80 backdrop-blur-xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex justify-center">
          <BrandLogo size="md" />
        </div>
        <CardTitle className="text-xl">Set a new password</CardTitle>
        <CardDescription>Choose a strong password for your account</CardDescription>
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
            <Label htmlFor="password">New password</Label>
            <Input id="password" name="password" type="password" minLength={6} required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t-0 bg-transparent">
          <Button type="submit" className="w-full btn-gold text-luxury-black" disabled={pending}>
            {pending ? <><Loader2 className="size-4 animate-spin" /> Updating...</> : "Update password"}
          </Button>
          <Link href="/login" className="text-center text-sm text-muted-foreground hover:text-foreground">
            Back to sign in
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
