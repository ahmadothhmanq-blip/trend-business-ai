import { z } from "zod";

export const emailSchema = z.string().trim().email().max(320);

export const passwordSchema = z.string().min(6).max(128);

export const profileSchema = z.object({
  fullName: z.string().trim().max(200).optional(),
  company: z.string().trim().max(200).optional(),
  role: z.string().trim().max(200).optional(),
});

export const preferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  emailNotifications: z.boolean().optional(),
});
