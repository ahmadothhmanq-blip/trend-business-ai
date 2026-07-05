import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle variant="outline" />
      </div>
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-30" aria-hidden="true" />
      <ResetPasswordForm />
    </div>
  );
}
