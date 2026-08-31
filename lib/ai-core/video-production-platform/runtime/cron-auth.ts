/**
 * Cron authorization for Video Studio background worker.
 * Missing secret is a hard deny — never bypass.
 */
import { timingSafeEqual } from "node:crypto";

function secretsEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function authorizeVideoStudioCron(request: Request): boolean {
  const secret = process.env.VIDEO_STUDIO_CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const header = request.headers.get("x-video-studio-cron-secret")?.trim() || "";
  return secretsEqual(bearer, secret) || secretsEqual(header, secret);
}
