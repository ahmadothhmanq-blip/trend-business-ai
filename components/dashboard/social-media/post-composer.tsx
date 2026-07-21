"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Wand2, ImageIcon, Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SOCIAL_TONES } from "@/lib/social-media/prompts";
import { POST_PLATFORMS } from "@/lib/social-media/platforms";
import { buildImageGeneratorPayload } from "@/lib/social-media/design-integration";
import { TemplateSelector } from "@/components/dashboard/social-media/template-selector";
import { PostPreviewPanel } from "@/components/dashboard/social-media/post-preview";
import type { SocialPost, SocialPostPlatform, SocialAccountPublic } from "@/types/social-media";

type Brand = { id: string; brand_name: string };

type Props = {
  post: Partial<SocialPost> | null;
  brands: Brand[];
  onSaved: (post: SocialPost) => void;
  onChange: (patch: Partial<SocialPost>) => void;
};

export function PostComposer({ post, brands, onSaved, onChange }: Props) {
  const [platform, setPlatform] = useState<SocialPostPlatform>(post?.platform ?? "instagram");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [brandId, setBrandId] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [accounts, setAccounts] = useState<SocialAccountPublic[]>([]);
  const [accountId, setAccountId] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/social-media/accounts");
        const data = await res.json();
        if (res.ok) {
          const connected = (data.accounts ?? []).filter(
            (a: SocialAccountPublic) => a.status === "connected" || a.connection_status === "connected",
          );
          setAccounts(connected);
          if (connected[0]?.id) setAccountId(connected[0].id);
        }
      } catch {
        // optional
      }
    })();
  }, []);

  const generate = async (templateId?: string, templateTopic?: string) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/social-media/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          topic: templateTopic || topic || post?.title || "Social post",
          tone,
          brandIdentityId: brandId || undefined,
          templateId,
          save: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      onSaved(data.post);
      toast.success("Post generated!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setGenerating(false);
    }
  };

  const runAction = async (action: string) => {
    const text = post?.caption || post?.post_text;
    if (!text?.trim()) {
      toast.error("Generate or write content first.");
      return;
    }
    setActionBusy(true);
    try {
      const res = await fetch("/api/social-media/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text, platform, postId: post?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed");
      onChange({
        post_text: data.result.postText,
        caption: data.result.caption,
        hashtags: data.result.hashtags,
        cta: data.result.cta,
        content_angle: data.result.contentAngle,
      });
      if (post?.id) onSaved({ ...post, ...data.result } as SocialPost);
      toast.success("Updated!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionBusy(false);
    }
  };

  const saveDraft = async () => {
    if (!post?.id) {
      const res = await fetch("/api/social-media/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          title: post?.title || "Untitled Post",
          postText: post?.post_text ?? "",
          caption: post?.caption ?? "",
          hashtags: post?.hashtags ?? [],
          cta: post?.cta ?? "",
          contentAngle: post?.content_angle ?? "",
          tone,
          brandIdentityId: brandId || undefined,
          status: "draft",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSaved(data.post);
      toast.success("Draft saved");
      return;
    }

    const res = await fetch(`/api/social-media/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: post.title,
        postText: post.post_text,
        caption: post.caption,
        hashtags: post.hashtags,
        cta: post.cta,
        contentAngle: post.content_angle,
        tone,
        status: "draft",
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    onSaved(data.post);
    toast.success("Draft saved");
  };

  const schedule = async () => {
    if (!post?.id || !scheduleAt) {
      toast.error("Save post and pick schedule time.");
      return;
    }
    if (!accountId) {
      toast.error("Connect an account first.");
      return;
    }
    const res = await fetch(`/api/social-media/posts/${post.id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountId,
        scheduledAt: new Date(scheduleAt).toISOString(),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Schedule failed");
    setPublishStatus(data.job?.status ?? "queued");
    toast.success("Scheduled for publishing!");
  };

  const publishNow = async () => {
    if (!post?.id) {
      toast.error("Save the post first.");
      return;
    }
    if (!accountId) {
      toast.error("Connect an account to publish.");
      return;
    }
    setPublishing(true);
    try {
      const res = await fetch(`/api/social-media/posts/${post.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.result?.error ?? "Publish failed");
      setPublishStatus(data.job?.status ?? (data.result?.ok ? "published" : "failed"));
      if (data.result?.ok) {
        onSaved({ ...post, status: "published" } as SocialPost);
        toast.success("Published!");
      } else {
        toast.error(data.result?.error ?? "Publish failed");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  const generateVisual = async () => {
    const payload = buildImageGeneratorPayload({
      prompt: post?.caption || post?.post_text || topic || "Social media visual",
      platform,
    });
    toast.info("Opening Image Generator flow — use dashboard Image Generator with social dimensions.");
    void payload;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-white/50">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as SocialPostPlatform)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            >
              {POST_PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            >
              {SOCIAL_TONES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {brands.length > 0 && (
          <div>
            <label className="text-xs text-white/50">Brand (read-only)</label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            >
              <option value="">No brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.brand_name}</option>
              ))}
            </select>
          </div>
        )}

        {accounts.length > 0 && (
          <div>
            <label className="text-xs text-white/50">Publish account</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.account_name} ({a.platform})
                </option>
              ))}
            </select>
          </div>
        )}

        {publishStatus && (
          <p className="text-xs text-premium-gold-light">Publishing status: {publishStatus}</p>
        )}

        <div>
          <label className="text-xs text-white/50">Topic / brief</label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What should this post be about?"
            className="mt-1 rounded-lg border-white/10 bg-white/5 text-white"
          />
        </div>

        <TemplateSelector
          platform={platform}
          onApply={({ template, topic: t }) => void generate(template.id, t)}
        />

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void generate()} disabled={generating} className="rounded-lg">
            <Sparkles className="mr-2 size-4" />
            {generating ? "Generating…" : "AI Generate"}
          </Button>
          <Button variant="outline" className="rounded-lg border-white/10" onClick={() => void saveDraft()}>
            Save Draft
          </Button>
          <Button variant="outline" className="rounded-lg border-white/10" onClick={() => void generateVisual()}>
            <ImageIcon className="mr-2 size-4" /> Visual
          </Button>
        </div>

        <div>
          <label className="text-xs text-white/50">Title</label>
          <Input
            value={post?.title ?? ""}
            onChange={(e) => onChange({ title: e.target.value })}
            className="mt-1 rounded-lg border-white/10 bg-white/5 text-white"
          />
        </div>
        <div>
          <label className="text-xs text-white/50">Caption</label>
          <Textarea
            value={post?.caption ?? ""}
            onChange={(e) => onChange({ caption: e.target.value, post_text: e.target.value })}
            rows={6}
            className="mt-1 rounded-lg border-white/10 bg-white/5 text-white"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {["rewrite", "improve_engagement", "shorten", "expand", "generate_variations"].map((a) => (
            <Button
              key={a}
              size="sm"
              variant="outline"
              disabled={actionBusy}
              className="rounded-lg border-white/10 text-xs capitalize"
              onClick={() => void runAction(a)}
            >
              <Wand2 className="mr-1 size-3" />
              {a.replace("_", " ")}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void publishNow()} disabled={publishing || !post?.id} className="rounded-lg">
            <Send className="mr-2 size-4" />
            {publishing ? "Publishing…" : "Publish"}
          </Button>
          <Input
            type="datetime-local"
            value={scheduleAt}
            onChange={(e) => setScheduleAt(e.target.value)}
            className="rounded-lg border-white/10 bg-white/5 text-white max-w-[220px]"
          />
          <Button variant="outline" className="rounded-lg border-white/10" onClick={() => void schedule()}>
            <Clock className="mr-2 size-4" />
            Schedule
          </Button>
        </div>
      </div>

      <PostPreviewPanel post={post ?? { platform }} />
    </div>
  );
}
