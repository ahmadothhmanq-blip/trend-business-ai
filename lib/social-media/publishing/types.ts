export type PublishContent = {
  caption: string;
  postText: string;
  mediaUrl?: string | null;
  hashtags?: string[];
};

export type PublishContext = {
  accessToken: string;
  accountId: string;
  platformAccountId?: string;
};

export type PublishResult = {
  ok: boolean;
  platformPostId?: string;
  response?: Record<string, unknown>;
  error?: string;
};

export interface PlatformPublisher {
  platform: string;
  validateAccount(ctx: PublishContext): Promise<{ valid: boolean; error?: string }>;
  publish(content: PublishContent, ctx: PublishContext): Promise<PublishResult>;
}
