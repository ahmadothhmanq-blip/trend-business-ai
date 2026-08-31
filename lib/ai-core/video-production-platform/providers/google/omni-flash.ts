import type {
  VideoProvider,
  VideoProviderClipRequest,
  VideoProviderClipResult,
} from "@/lib/ai-core/video-production-platform/providers/types";

const OMNI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const OMNI_MODEL = process.env.OMNI_FLASH_MODEL || "gemini-omni-flash-preview";

function omniApiKey(): string | null {
  const key = (process.env.GEMINI_API_KEY || process.env.OMNI_FLASH_API_KEY || "").trim();
  return key || null;
}

function normalizeAspectRatio(aspectRatio?: string): "16:9" | "9:16" {
  return aspectRatio === "9:16" ? "9:16" : "16:9";
}

function jsonOrNull<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

type OmniInteractionResponse = {
  id?: string;
  status?: string;
  steps?: Array<{
    type?: string;
    content?: Array<
      | {
          type?: string;
          text?: string;
          // model_output -> video
          video?: { mime_type?: string; data?: string; uri?: string };
          // REST sometimes embeds video under output structures
          mime_type?: string;
          data?: string;
          uri?: string;
        }
      | Record<string, unknown>
    >;
  }>;
  model?: string;
  object?: string;
};

function readNestedString(
  value: unknown,
  field: "mime_type" | "data" | "uri",
): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = (value as Record<string, unknown>)[field];
  return typeof raw === "string" ? raw : undefined;
}

function normalizeVideoMimeType(value?: string): "video/mp4" | "video/webm" {
  return value === "video/webm" ? "video/webm" : "video/mp4";
}

function extractInteractionVideo(resp: OmniInteractionResponse): {
  mimeType?: string;
  base64?: string;
  uri?: string;
} {
  const steps = resp.steps ?? [];
  for (const step of steps) {
    const contents = step.content ?? [];
    for (const c of contents) {
      if (!c || typeof c !== "object") continue;
      const anyC = c as Record<string, unknown>;
      // Typical: { type:"video", mime_type:"video/mp4", data:"<base64>" }
      const mimeType =
        readNestedString(anyC, "mime_type") ||
        readNestedString(anyC["video"], "mime_type");

      const base64 =
        readNestedString(anyC, "data") ||
        readNestedString(anyC["video"], "data");

      const uri =
        readNestedString(anyC, "uri") ||
        readNestedString(anyC["video"], "uri");

      if (mimeType || base64 || uri) return { mimeType, base64, uri };
    }
  }
  return {};
}

async function downloadIfUri(uri: string, apiKey: string): Promise<Uint8Array | null> {
  // If URI already includes :download?alt=media, fetch directly.
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    const res = await fetch(uri, {
      headers: { "x-goog-api-key": apiKey },
    });
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  }
  return null;
}

export const omniFlashVideoProvider: VideoProvider = {
  id: "omni_flash",
  label: "Gemini Omni Flash",
  configured: Boolean(omniApiKey()),
  supportsImageToVideo: true,
  supportsAvatar: false,

  async generateClip(req: VideoProviderClipRequest): Promise<VideoProviderClipResult> {
    const key = omniApiKey();
    if (!key) {
      return {
        provider: "omni_flash",
        status: "failed",
        mimeType: "video/mp4",
        error: "GEMINI_API_KEY not configured",
        message: "Omni Flash not configured",
      };
    }

    try {
      const aspectRatio = normalizeAspectRatio(req.aspectRatio);

      // Omni uses the Interactions API. We request video (optionally via URI).
      const res = await fetch(`${OMNI_BASE}/interactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          model: OMNI_MODEL,
          input: req.prompt,
          // For production adapters, use delivery:"uri" to avoid huge payloads.
          // (This will require polling + download.)
          response_format: {
            type: "video",
            delivery: "uri",
            aspect_ratio: aspectRatio,
          },
        }),
      });

      const text = await res.text();
      if (!res.ok) {
        return {
          provider: "omni_flash",
          status: "failed",
          mimeType: "video/mp4",
          error: `HTTP ${res.status} ${text.slice(0, 500)}`,
          message: "Omni Flash job submission failed.",
        };
      }

      const json = jsonOrNull<OmniInteractionResponse>(text);
      const interactionId = json?.id;
      if (!interactionId) {
        return {
          provider: "omni_flash",
          status: "failed",
          mimeType: "video/mp4",
          error: "Omni Flash response missing interaction id",
          message: "Omni Flash job submission failed.",
        };
      }

      // Some responses may already include the video; try extracting it.
      const video = extractInteractionVideo(json ?? {});
      if (video.base64) {
        const bytes = Uint8Array.from(Buffer.from(video.base64, "base64"));
        return {
          provider: "omni_flash",
          status: "completed",
          externalJobId: interactionId,
          mimeType: normalizeVideoMimeType(video.mimeType),
          bytes,
          message: "Omni Flash completed (inline).",
        };
      }

      if (video.uri) {
        return {
          provider: "omni_flash",
          status: "processing",
          externalJobId: interactionId,
          mimeType: normalizeVideoMimeType(video.mimeType),
          remoteUrl: video.uri,
          message: "Omni Flash accepted; poll for completion.",
        };
      }

      return {
        provider: "omni_flash",
        status: "processing",
        externalJobId: interactionId,
        mimeType: "video/mp4",
        message: "Omni Flash accepted; poll for completion.",
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Omni Flash request failed";
      return {
        provider: "omni_flash",
        status: "failed",
        mimeType: "video/mp4",
        error: msg,
        message: msg,
      };
    }
  },

  async pollJob(externalJobId: string): Promise<VideoProviderClipResult> {
    const key = omniApiKey();
    if (!key) {
      return {
        provider: "omni_flash",
        status: "failed",
        mimeType: "video/mp4",
        error: "GEMINI_API_KEY missing",
        message: "Omni Flash not configured",
      };
    }

    const res = await fetch(`${OMNI_BASE}/interactions/${externalJobId}`, {
      headers: { "x-goog-api-key": key },
    });
    const text = await res.text();
    if (!res.ok) {
      return {
        provider: "omni_flash",
        status: "failed",
        externalJobId,
        mimeType: "video/mp4",
        error: `HTTP ${res.status} ${text.slice(0, 500)}`,
        message: "Omni Flash poll failed.",
      };
    }

    const json = jsonOrNull<OmniInteractionResponse>(text);
    const video = extractInteractionVideo(json ?? {});

    if (video.base64) {
      const bytes = Uint8Array.from(Buffer.from(video.base64, "base64"));
      return {
        provider: "omni_flash",
        status: "completed",
        externalJobId,
        mimeType: normalizeVideoMimeType(video.mimeType),
        bytes,
        message: "Omni Flash completed.",
      };
    }

    if (video.uri) {
      const bytes = await downloadIfUri(video.uri, key);
      if (bytes?.byteLength) {
        return {
          provider: "omni_flash",
          status: "completed",
          externalJobId,
          remoteUrl: video.uri,
          mimeType: normalizeVideoMimeType(video.mimeType),
          bytes,
          message: "Omni Flash completed (downloaded).",
        };
      }
      return {
        provider: "omni_flash",
        status: "processing",
        externalJobId,
        remoteUrl: video.uri,
        mimeType: normalizeVideoMimeType(video.mimeType),
        message: "Omni Flash video uri available; download pending.",
      };
    }

    return {
      provider: "omni_flash",
      status: "processing",
      externalJobId,
      mimeType: "video/mp4",
      message: "Omni Flash still processing.",
    };
  },
};

