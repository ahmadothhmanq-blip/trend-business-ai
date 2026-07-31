/**
 * Website Builder — transactional invitation emails (SendGrid via marketing adapters).
 */

import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { SendGridAdapter } from "@/lib/marketing/integrations/email-adapters";
import type { BuilderMemberRole } from "@/lib/website/builder/enterprise";

export type BuilderEmailDeliveryStatus = "pending" | "sent" | "failed" | "skipped";

import { getLocalDevOrigin } from "@/lib/dev-origin";

export function resolveBuilderAppOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return getLocalDevOrigin();
}

export function buildBuilderInvitationUrl(token: string): string {
  const origin = resolveBuilderAppOrigin();
  return `${origin}/dashboard/website-builder?invite=${encodeURIComponent(token)}`;
}

export function renderBuilderInvitationEmail(params: {
  inviterName: string;
  projectName: string;
  role: BuilderMemberRole;
  acceptUrl: string;
  expiresAt: string;
}): { subject: string; html: string; text: string } {
  const expiresLabel = new Date(params.expiresAt).toLocaleString();
  const subject = `You're invited to collaborate on ${params.projectName}`;
  const text = [
    `${params.inviterName} invited you to collaborate on "${params.projectName}" as ${params.role}.`,
    ``,
    `Accept invitation: ${params.acceptUrl}`,
    ``,
    `This link expires on ${expiresLabel}.`,
  ].join("\n");
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;max-width:560px">
      <h2 style="margin:0 0 12px">Website Builder invitation</h2>
      <p><strong>${escapeHtml(params.inviterName)}</strong> invited you to collaborate on
      <strong>${escapeHtml(params.projectName)}</strong> as <strong>${escapeHtml(params.role)}</strong>.</p>
      <p><a href="${params.acceptUrl}" style="display:inline-block;padding:10px 16px;background:#c9a227;color:#111;text-decoration:none;border-radius:8px;font-weight:600">Accept invitation</a></p>
      <p style="font-size:12px;color:#555">Or copy this link:<br/><a href="${params.acceptUrl}">${params.acceptUrl}</a></p>
      <p style="font-size:12px;color:#555">Expires ${escapeHtml(expiresLabel)}.</p>
    </div>
  `.trim();
  return { subject, html, text };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendBuilderInvitationEmail(args: {
  to: string;
  inviterName: string;
  projectName: string;
  role: BuilderMemberRole;
  token: string;
  expiresAt: string;
}): Promise<{
  status: BuilderEmailDeliveryStatus;
  messageId?: string;
  error?: string;
}> {
  const validation = SendGridAdapter.validateConfig();
  if (!validation.valid) {
    return { status: "skipped", error: validation.error };
  }

  const acceptUrl = buildBuilderInvitationUrl(args.token);
  const { subject, html, text } = renderBuilderInvitationEmail({
    inviterName: args.inviterName,
    projectName: args.projectName,
    role: args.role,
    acceptUrl,
    expiresAt: args.expiresAt,
  });

  const result = await SendGridAdapter.sendEmail({
    to: args.to,
    subject,
    html,
    text,
  });

  if (!result.ok) {
    return { status: "failed", error: result.error };
  }
  return { status: "sent", messageId: result.messageId };
}

export async function recordInvitationEmailDelivery(
  supabase: SupabaseClient,
  memberId: string,
  delivery: {
    status: BuilderEmailDeliveryStatus;
    messageId?: string;
    error?: string;
    incrementResend?: boolean;
  },
): Promise<void> {
  const { data: existing } = await supabase
    .from("website_generation_members")
    .select("email_resend_count")
    .eq("id", memberId)
    .maybeSingle();

  const resendCount =
    (typeof existing?.email_resend_count === "number" ? existing.email_resend_count : 0) +
    (delivery.incrementResend ? 1 : 0);

  await supabase
    .from("website_generation_members")
    .update({
      email_delivery_status: delivery.status,
      email_message_id: delivery.messageId ?? null,
      email_last_error: delivery.error ?? null,
      email_resend_count: resendCount,
      ...(delivery.status === "sent"
        ? { email_sent_at: new Date().toISOString() }
        : {}),
    })
    .eq("id", memberId);
}

export async function deliverBuilderInvitationEmail(params: {
  supabase: SupabaseClient;
  memberId: string;
  email: string;
  role: BuilderMemberRole;
  token: string;
  expiresAt: string;
  inviterName: string;
  projectName: string;
  incrementResend?: boolean;
}): Promise<BuilderEmailDeliveryStatus> {
  const delivery = await sendBuilderInvitationEmail({
    to: params.email,
    inviterName: params.inviterName,
    projectName: params.projectName,
    role: params.role,
    token: params.token,
    expiresAt: params.expiresAt,
  });

  await recordInvitationEmailDelivery(params.supabase, params.memberId, {
    status: delivery.status,
    messageId: delivery.messageId,
    error: delivery.error,
    incrementResend: params.incrementResend,
  });

  return delivery.status;
}
