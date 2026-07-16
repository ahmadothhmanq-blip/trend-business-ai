"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/api/helpers";
import { enforceAuthRateLimit } from "@/lib/api/rate-limit";
import { getOptionalSiteUrl } from "@/lib/env";
import {
  emailSchema,
  passwordSchema,
  preferencesSchema,
  profileSchema,
} from "@/lib/validations/auth";

const AVATAR_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = emailSchema.safeParse(formData.get("email"));
  const password = passwordSchema.safeParse(formData.get("password"));
  const fullName = String(formData.get("fullName") ?? "").trim();

  if (!email.success || !password.success || !fullName) {
    return { error: "Please provide a valid name, email, and password." };
  }

  const limited = enforceAuthRateLimit(email.data);
  if (limited) {
    return { error: "Too many authentication attempts. Please try again later." };
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.data,
    password: password.data,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${getOptionalSiteUrl()}/auth/callback`,
    },
  });

  if (error) {
    return {
      error:
        "Unable to create account. Try a different email or try again later.",
    };
  }

  if (data.user && !data.session) {
    redirect("/login?message=confirm-email");
  }

  redirect("/dashboard");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = emailSchema.safeParse(formData.get("email"));
  const password = passwordSchema.safeParse(formData.get("password"));

  if (!email.success || !password.success) {
    return { error: "Invalid email or password." };
  }

  const limited = enforceAuthRateLimit(email.data);
  if (limited) {
    return { error: "Too many authentication attempts. Please try again later." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: email.data,
    password: password.data,
  });

  if (error) {
    return { error: "Invalid email or password." };
  }

  const redirectTo = safeRedirectPath(
    formData.get("redirect") as string | null,
    "/dashboard",
  );
  redirect(redirectTo);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const email = emailSchema.safeParse(formData.get("email"));

  if (!email.success) {
    return { error: "Please enter a valid email address." };
  }

  const limited = enforceAuthRateLimit(`reset:${email.data}`);
  if (limited) {
    return {
      success: true,
      message: "If that email exists, a password reset link has been sent.",
    };
  }

  const siteUrl = getOptionalSiteUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  // Always return success to avoid email enumeration.
  void error;

  return {
    success: true,
    message: "If that email exists, a password reset link has been sent.",
  };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = passwordSchema.safeParse(formData.get("password"));

  if (!password.success) {
    return { error: "Password must be at least 8 characters." };
  }

  const { error } = await supabase.auth.updateUser({
    password: password.data,
  });

  if (error) {
    return { error: "Unable to update password. Please try again." };
  }

  revalidatePath("/dashboard/profile");
  return { success: true, message: "Password updated successfully." };
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    company: formData.get("company"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid profile data" };
  }

  const { fullName = "", company = "", role = "" } = parsed.data;

  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name: fullName, company, role },
  });

  if (authError) {
    return { error: authError.message };
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: fullName,
    company,
    role,
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath("/dashboard/profile");
  return { success: true, message: "Profile updated successfully." };
}

export async function updatePreferences(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const parsed = preferencesSchema.safeParse({
    theme: formData.get("theme") || undefined,
    emailNotifications: formData.get("emailNotifications") === "on",
  });

  if (!parsed.success) {
    return { error: "Invalid preferences" };
  }

  const { error } = await supabase.from("user_preferences").upsert({
    user_id: user.id,
    theme: parsed.data.theme ?? "dark",
    email_notifications: parsed.data.emailNotifications ?? true,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/profile");
  return { success: true, message: "Preferences saved." };
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) {
    return { error: "No file selected" };
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return { error: "Image must be under 2MB" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const magicMime = detectAvatarMime(buffer);
  const claimed = file.type as keyof typeof AVATAR_TYPES;
  if (!magicMime || !AVATAR_TYPES[claimed] || magicMime !== claimed) {
    return { error: "File must be a valid JPG, PNG or WebP image" };
  }

  const ext = AVATAR_TYPES[claimed];
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, buffer, { upsert: true, contentType: magicMime });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const avatarUrl = `${publicUrl}?t=${Date.now()}`;

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    avatar_url: avatarUrl,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/profile");
  return { success: true, avatarUrl, message: "Avatar updated." };
}

function detectAvatarMime(buffer: Buffer): keyof typeof AVATAR_TYPES | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return "image/png";
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

