"use client";

import { useActionState, useRef } from "react";
import { Loader2, Upload, User, LockKeyhole, Settings2 } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import {
  updateProfile,
  updatePassword,
  updatePreferences,
  uploadAvatar,
} from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/dashboard/ui/dashboard-card";
import {
  dashboardInputClass,
  dashboardSelectClass,
} from "@/components/dashboard/ui/dashboard-styles";
import { DashboardIconBox } from "@/components/dashboard/ui/icon-box";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

type ProfileFormProps = {
  email: string;
  fullName?: string;
  company?: string;
  role?: string;
  avatarUrl?: string;
  theme?: "light" | "dark" | "system";
  emailNotifications?: boolean;
};

export function ProfileForm({
  email,
  fullName = "",
  company = "",
  role = "",
  avatarUrl = "",
  theme = "dark",
  emailNotifications = true,
}: ProfileFormProps) {
  const { setTheme } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profileState, profileAction, profilePending] = useActionState(
    async (_prev: { error?: string; success?: boolean; message?: string } | null, formData: FormData) =>
      updateProfile(formData),
    null,
  );

  const [passwordState, passwordAction, passwordPending] = useActionState(
    async (_prev: { error?: string; success?: boolean; message?: string } | null, formData: FormData) => {
      const newPassword = formData.get("newPassword");
      const confirmPassword = formData.get("confirmPassword");
      if (newPassword !== confirmPassword) {
        return { error: "Passwords do not match" };
      }
      formData.set("password", String(newPassword));
      return updatePassword(formData);
    },
    null,
  );

  const [prefsState, prefsAction, prefsPending] = useActionState(
    async (_prev: { error?: string; success?: boolean; message?: string } | null, formData: FormData) => {
      const result = await updatePreferences(formData);
      if (result.success) {
        const selectedTheme = formData.get("theme") as string;
        if (selectedTheme) setTheme(selectedTheme);
        toast.success(result.message ?? "Preferences saved");
      }
      return result;
    },
    null,
  );

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("avatar", file);
    const result = await uploadAvatar(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message ?? "Avatar updated");
    }
  }

  const initials = (fullName || email)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-6 lg:space-y-7">
      <DashboardCard className="glass-panel glass-panel-premium overflow-hidden border-premium-gold/20">
        <DashboardCardHeader className="flex flex-row items-center gap-4 sm:gap-5">
          <Avatar className="size-16">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName || email} /> : null}
            <AvatarFallback className="bg-premium-gold/20 text-lg font-bold text-premium-gold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <DashboardCardTitle className="text-xl">
              {fullName || "Your Profile"}
            </DashboardCardTitle>
            <DashboardCardDescription>{email}</DashboardCardDescription>
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="btn-ghost-gold rounded-xl"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="size-4" />
              Upload
            </Button>
          </div>
        </DashboardCardHeader>
      </DashboardCard>

      <DashboardCard className="glass-panel glass-panel-premium">
        <DashboardCardHeader>
          <DashboardCardTitle className="flex items-center gap-3">
            <DashboardIconBox icon={User} className="size-9" />
            Account Settings
          </DashboardCardTitle>
          <DashboardCardDescription>
            Update your personal information
          </DashboardCardDescription>
        </DashboardCardHeader>
        <form action={profileAction}>
          <DashboardCardContent className="space-y-5">
            {profileState?.error && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {profileState.error}
              </div>
            )}
            {profileState?.success && (
              <div
                role="status"
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400"
              >
                {profileState.message ?? "Profile updated successfully."}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/70">
                Email
              </Label>
              <Input id="email" value={email} disabled className={`${dashboardInputClass} opacity-70`} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white/70">
                Full name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={fullName}
                placeholder="Jane Doe"
                className={dashboardInputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-white/70">
                Company
              </Label>
              <Input
                id="company"
                name="company"
                defaultValue={company}
                placeholder="Acme Inc."
                className={dashboardInputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-white/70">
                Role
              </Label>
              <Input
                id="role"
                name="role"
                defaultValue={role}
                placeholder="Founder, CEO, Analyst..."
                className={dashboardInputClass}
              />
            </div>
            <Button
              type="submit"
              className="btn-gold h-11 rounded-xl px-6 font-bold text-luxury-black"
              disabled={profilePending}
            >
              {profilePending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DashboardCardContent>
        </form>
      </DashboardCard>

      <DashboardCard className="glass-panel glass-panel-premium">
        <DashboardCardHeader>
          <DashboardCardTitle className="flex items-center gap-3">
            <DashboardIconBox icon={LockKeyhole} className="size-9" />
            Change Password
          </DashboardCardTitle>
          <DashboardCardDescription>
            Update your account password
          </DashboardCardDescription>
        </DashboardCardHeader>
        <form action={passwordAction}>
          <DashboardCardContent className="space-y-5">
            {passwordState?.error && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {passwordState.error}
              </div>
            )}
            {passwordState && "success" in passwordState && passwordState.success && (
              <div
                role="status"
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400"
              >
                {passwordState.message}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-white/70">
                New password
              </Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                minLength={6}
                required
                className={dashboardInputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/70">
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                minLength={6}
                required
                className={dashboardInputClass}
              />
            </div>
            <Button
              type="submit"
              className="btn-gold h-11 rounded-xl px-6 font-bold text-luxury-black"
              disabled={passwordPending}
            >
              {passwordPending ? "Updating..." : "Update Password"}
            </Button>
          </DashboardCardContent>
        </form>
      </DashboardCard>

      <DashboardCard className="glass-panel glass-panel-premium">
        <DashboardCardHeader>
          <DashboardCardTitle className="flex items-center gap-3">
            <DashboardIconBox icon={Settings2} className="size-9" />
            Preferences
          </DashboardCardTitle>
          <DashboardCardDescription>
            Theme and notification settings
          </DashboardCardDescription>
        </DashboardCardHeader>
        <form action={prefsAction}>
          <DashboardCardContent className="space-y-5">
            {prefsState?.error && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {prefsState.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="theme" className="text-white/70">
                Theme
              </Label>
              <select
                id="theme"
                name="theme"
                defaultValue={theme}
                className={dashboardSelectClass}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-black/20 px-3 py-2.5">
              <input
                type="checkbox"
                id="emailNotifications"
                name="emailNotifications"
                defaultChecked={emailNotifications}
                className="size-4 rounded border-white/30 accent-premium-gold"
              />
              <Label htmlFor="emailNotifications" className="text-white/80">
                Email notifications
              </Label>
            </div>
            <Button
              type="submit"
              className="btn-gold h-11 rounded-xl px-6 font-bold text-luxury-black"
              disabled={prefsPending}
            >
              {prefsPending ? "Saving..." : "Save Preferences"}
            </Button>
          </DashboardCardContent>
        </form>
      </DashboardCard>
    </div>
  );
}
