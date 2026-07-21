import type { PlatformPublisher, PublishContent, PublishContext, PublishResult } from "./types";

export function isMockPublishMode(): boolean {
  return process.env.SOCIAL_PUBLISH_MOCK === "true";
}

function fullCaption(content: PublishContent): string {
  const tags = (content.hashtags ?? []).map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");
  return [content.caption || content.postText, tags].filter(Boolean).join("\n\n").trim();
}

function mockResult(platform: string): PublishResult {
  return {
    ok: true,
    platformPostId: `mock-${platform}-${Date.now()}`,
    response: { mock: true, platform },
  };
}

async function metaPublish(
  ctx: PublishContext,
  endpoint: string,
  body: Record<string, unknown>,
): Promise<PublishResult> {
  const res = await fetch(`https://graph.facebook.com/v21.0/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, access_token: ctx.accessToken }),
  });
  const data = (await res.json()) as Record<string, unknown> & { error?: { message?: string } };
  if (!res.ok) {
    return { ok: false, error: String(data.error?.message ?? data.error ?? "Publish failed"), response: data };
  }
  return { ok: true, platformPostId: String(data.id ?? ""), response: data };
}

export const FacebookPublisher: PlatformPublisher = {
  platform: "facebook",
  async validateAccount(ctx) {
    if (!ctx.accessToken) return { valid: false, error: "Missing access token" };
    return { valid: true };
  },
  async publish(content, ctx) {
    if (isMockPublishMode()) return mockResult("facebook");
    const pageId = ctx.platformAccountId ?? ctx.accountId;
    return metaPublish(ctx, `${pageId}/feed`, { message: fullCaption(content), link: content.mediaUrl ?? "" });
  },
};

export const InstagramPublisher: PlatformPublisher = {
  platform: "instagram",
  async validateAccount(ctx) {
    if (!ctx.accessToken) return { valid: false, error: "Missing access token" };
    return { valid: true };
  },
  async publish(content, ctx) {
    if (isMockPublishMode()) return mockResult("instagram");
    const igUserId = ctx.platformAccountId ?? ctx.accountId;
    if (content.mediaUrl) {
      const create = await metaPublish(ctx, `${igUserId}/media`, {
        image_url: content.mediaUrl,
        caption: fullCaption(content),
      });
      if (!create.ok || !create.platformPostId) return create;
      return metaPublish(ctx, `${igUserId}/media_publish`, { creation_id: create.platformPostId });
    }
    return { ok: false, error: "Instagram requires media_url for publishing." };
  },
};

export const WhatsAppPublisher: PlatformPublisher = {
  platform: "whatsapp",
  async validateAccount(ctx) {
    return ctx.accessToken ? { valid: true } : { valid: false, error: "Missing token" };
  },
  async publish(content, ctx) {
    if (isMockPublishMode()) return mockResult("whatsapp");
    const phoneId = ctx.platformAccountId ?? ctx.accountId;
    return metaPublish(ctx, `${phoneId}/messages`, {
      messaging_product: "whatsapp",
      type: "text",
      text: { body: fullCaption(content) },
    });
  },
};

export const MessengerPublisher: PlatformPublisher = {
  platform: "messenger",
  async validateAccount(ctx) {
    return ctx.accessToken ? { valid: true } : { valid: false, error: "Missing token" };
  },
  async publish(content, ctx) {
    if (isMockPublishMode()) return mockResult("messenger");
    const pageId = ctx.platformAccountId ?? ctx.accountId;
    return metaPublish(ctx, `${pageId}/messages`, {
      messaging_type: "UPDATE",
      message: { text: fullCaption(content) },
    });
  },
};

export const LinkedInPublisher: PlatformPublisher = {
  platform: "linkedin",
  async validateAccount(ctx) {
    return ctx.accessToken ? { valid: true } : { valid: false, error: "Missing token" };
  },
  async publish(content, ctx) {
    if (isMockPublishMode()) return mockResult("linkedin");
    const author = ctx.platformAccountId ? `urn:li:person:${ctx.platformAccountId}` : `urn:li:person:${ctx.accountId}`;
    const res = await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ctx.accessToken}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": "202401",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author,
        commentary: fullCaption(content),
        visibility: "PUBLIC",
        lifecycleState: "PUBLISHED",
      }),
    });
    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) return { ok: false, error: String(data.message ?? "LinkedIn publish failed"), response: data };
    const postId = res.headers.get("x-restli-id") ?? "";
    return { ok: true, platformPostId: postId, response: data };
  },
};

export const XPublisher: PlatformPublisher = {
  platform: "x",
  async validateAccount(ctx) {
    return ctx.accessToken ? { valid: true } : { valid: false, error: "Missing token" };
  },
  async publish(content, ctx) {
    if (isMockPublishMode()) return mockResult("x");
    const res = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ctx.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: fullCaption(content).slice(0, 280) }),
    });
    const data = (await res.json()) as { data?: { id?: string }; detail?: string };
    if (!res.ok) return { ok: false, error: data.detail ?? "X publish failed", response: data as Record<string, unknown> };
    return { ok: true, platformPostId: data.data?.id ?? "", response: data as Record<string, unknown> };
  },
};

export const PUBLISHERS: Record<string, PlatformPublisher> = {
  facebook: FacebookPublisher,
  instagram: InstagramPublisher,
  whatsapp: WhatsAppPublisher,
  messenger: MessengerPublisher,
  linkedin: LinkedInPublisher,
  x: XPublisher,
};

export function getPublisher(platform: string): PlatformPublisher | null {
  return PUBLISHERS[platform] ?? null;
}
