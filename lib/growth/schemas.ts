import { z } from "zod";

export const leadCaptureSchema = z.object({
  email: z.string().email().max(320),
  name: z.string().max(120).optional().nullable(),
  company: z.string().max(160).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  message: z.string().max(4000).optional().nullable(),
  source: z
    .enum([
      "website",
      "contact",
      "newsletter",
      "exit_intent",
      "cta",
      "affiliate",
      "referral",
      "import",
      "other",
    ])
    .default("website"),
  pagePath: z.string().max(300).optional().nullable(),
  utmSource: z.string().max(120).optional().nullable(),
  utmMedium: z.string().max(120).optional().nullable(),
  utmCampaign: z.string().max(120).optional().nullable(),
  affiliateCode: z.string().max(64).optional().nullable(),
  referralCode: z.string().max(64).optional().nullable(),
  honeypot: z.string().max(100).optional().nullable(),
});

export const newsletterSchema = z.object({
  email: z.string().email().max(320),
  name: z.string().max(120).optional().nullable(),
  source: z.string().max(80).default("newsletter"),
  honeypot: z.string().max(100).optional().nullable(),
});

export const eventTrackSchema = z.object({
  eventName: z.string().min(1).max(120),
  eventCategory: z
    .enum(["pageview", "engagement", "conversion", "campaign", "experiment", "affiliate", "system"])
    .default("engagement"),
  pagePath: z.string().max(300).optional().nullable(),
  referrer: z.string().max(500).optional().nullable(),
  utmSource: z.string().max(120).optional().nullable(),
  utmMedium: z.string().max(120).optional().nullable(),
  utmCampaign: z.string().max(120).optional().nullable(),
  sessionId: z.string().max(120).optional().nullable(),
  valueCents: z.number().int().min(0).max(100_000_000).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const referralInviteSchema = z.object({
  email: z.string().email().max(320),
});

export const contactUpsertSchema = z.object({
  email: z.string().email().max(320),
  name: z.string().max(120).optional().nullable(),
  company: z.string().max(160).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  lifecycleStage: z
    .enum(["subscriber", "lead", "mql", "sql", "opportunity", "customer", "churned"])
    .optional(),
  score: z.number().int().min(0).max(100).optional(),
  tags: z.array(z.string().max(40)).max(20).optional(),
});

export const dealUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2).max(200),
  contactId: z.string().uuid().optional().nullable(),
  stage: z.enum(["new", "qualified", "proposal", "negotiation", "won", "lost"]).optional(),
  valueCents: z.number().int().min(0).max(100_000_000).optional(),
  probability: z.number().int().min(0).max(100).optional(),
  expectedCloseAt: z.string().max(40).optional().nullable(),
  notes: z.string().max(4000).optional(),
});

export const campaignUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(160),
  subject: z.string().min(2).max(200),
  previewText: z.string().max(300).optional(),
  bodyHtml: z.string().max(100_000).optional(),
  bodyText: z.string().max(50_000).optional(),
  segment: z.string().max(80).optional(),
  status: z.enum(["draft", "scheduled", "sending", "sent", "canceled"]).optional(),
  scheduledAt: z.string().max(40).optional().nullable(),
});

export const automationUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(160),
  triggerEvent: z.enum([
    "lead_created",
    "subscriber_added",
    "deal_stage_changed",
    "user_signed_up",
    "custom",
  ]),
  status: z.enum(["active", "paused", "archived"]).optional(),
  steps: z
    .array(
      z.object({
        id: z.string().max(64),
        type: z.enum(["email", "wait", "tag", "score", "webhook"]),
        delayHours: z.number().int().min(0).max(720).optional(),
        subject: z.string().max(200).optional(),
        body: z.string().max(20_000).optional(),
        tag: z.string().max(40).optional(),
        scoreDelta: z.number().int().min(-100).max(100).optional(),
      }),
    )
    .max(20)
    .optional(),
});

export const experimentUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(160),
  hypothesis: z.string().max(1000).optional(),
  targetType: z.enum(["landing", "headline", "cta", "pricing", "other"]),
  status: z.enum(["draft", "running", "paused", "completed", "archived"]).optional(),
  variants: z
    .array(
      z.object({
        id: z.string().max(64),
        label: z.string().max(80),
        value: z.string().max(500),
        weight: z.number().int().min(0).max(100),
      }),
    )
    .min(2)
    .max(6)
    .optional(),
});
