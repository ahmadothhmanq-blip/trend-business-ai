import { generateJsonWithValidation } from "@/lib/ai/generator";
import { assetPlanPrompt } from "@/lib/ai/prompts/website-layers";
import { uploadWebsiteAsset } from "@/lib/website/assets-storage";
import { assetPlanSchema } from "@/plugins/website/layers/schemas";
import type {
  AssetItem,
  AssetManifest,
  AssetRole,
  BusinessProfile,
  DesignSystem,
  WebsiteStrategy,
} from "@/plugins/website/layers/types";
import type { WebsiteGenerationInput } from "@/plugins/website/types";
import type { GenerationContext } from "@/lib/ai/types";

const MAX_AI_IMAGES = 4;

type PlannedAsset = {
  id: string;
  role: string;
  name: string;
  prompt: string;
  alt: string;
};

function svgDataUrl(label: string, primary: string, secondary: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${primary}"/>
      <stop offset="100%" stop-color="${secondary}"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#g)"/>
  <text x="80" y="820" fill="rgba(255,255,255,0.85)" font-family="Georgia, serif" font-size="48">${label.replace(/[<>&]/g, "")}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function normalizeRole(role: string): AssetRole {
  const r = role.toLowerCase();
  if (r.includes("hero")) return "hero";
  if (r.includes("product")) return "product";
  if (r.includes("background")) return "background";
  if (r.includes("brand") || r.includes("logo")) return "brand";
  if (r.includes("icon")) return "icon";
  return "section";
}

async function generateOpenAiImage(
  prompt: string,
): Promise<{ bytes: Buffer; mimeType: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt.slice(0, 3900),
        n: 1,
        size: "1792x1024",
        response_format: "b64_json",
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("OpenAI image generation failed", response.status, text.slice(0, 400));
      return null;
    }

    const json = (await response.json()) as {
      data?: Array<{ b64_json?: string }>;
    };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) return null;
    return { bytes: Buffer.from(b64, "base64"), mimeType: "image/png" };
  } catch (error) {
    console.error("OpenAI image generation threw", error);
    return null;
  }
}

function fallbackAsset(
  item: PlannedAsset,
  design: DesignSystem,
): AssetItem {
  return {
    id: item.id,
    role: normalizeRole(item.role),
    name: item.name,
    prompt: item.prompt,
    alt: item.alt,
    url: svgDataUrl(item.name, design.colors.primary, design.colors.secondary),
    storagePath: null,
    status: "fallback",
    mimeType: "image/svg+xml",
  };
}

export async function generateWebsiteAssets(params: {
  input: WebsiteGenerationInput;
  businessProfile: BusinessProfile;
  strategy: WebsiteStrategy;
  designSystem: DesignSystem;
  ctx: GenerationContext;
  userId?: string;
  generationKey?: string;
}): Promise<AssetManifest> {
  const { input, businessProfile, strategy, designSystem, ctx } = params;
  ctx.progress.emit("Generating assets...");

  const instruction = input.continueInstruction?.toLowerCase() ?? "";
  if (
    input.mode === "continue" &&
    input.previousAssetManifest?.items?.length &&
    !instruction.includes("[assets]")
  ) {
    return input.previousAssetManifest;
  }

  let planned: PlannedAsset[] = [];
  try {
    const plan = await generateJsonWithValidation<{ items: PlannedAsset[] }>({
      provider: ctx.provider,
      prompt: assetPlanPrompt(strategy, designSystem, businessProfile),
      schema: assetPlanSchema,
      maxAttempts: 2,
      validate: (v) =>
        v.items?.length
          ? { valid: true }
          : { valid: false, reason: "asset items required" },
    });
    planned = plan.items.slice(0, MAX_AI_IMAGES);
  } catch (error) {
    console.error("asset plan failed; using defaults", error);
    planned = [
      {
        id: "hero",
        role: "hero",
        name: "Hero",
        prompt: `Professional website hero image for ${businessProfile.industry}: ${businessProfile.offer}. Style: ${designSystem.style}. No text.`,
        alt: `${businessProfile.projectName} hero`,
      },
      {
        id: "section-1",
        role: "section",
        name: "Section visual",
        prompt: `Supporting lifestyle image for ${businessProfile.targetAudience}, ${designSystem.style}, no text`,
        alt: "Section visual",
      },
    ];
  }

  const items: AssetItem[] = [];
  let providerUsed: string | undefined;

  for (const item of planned) {
    const role = normalizeRole(item.role);
    if (role === "icon") {
      items.push(fallbackAsset(item, designSystem));
      continue;
    }

    const generated = await generateOpenAiImage(
      `${item.prompt}. Brand colors roughly ${designSystem.colors.primary} and ${designSystem.colors.secondary}.`,
    );

    if (!generated) {
      items.push(fallbackAsset(item, designSystem));
      continue;
    }

    providerUsed = "openai-dall-e-3";
    let url: string | null = null;
    let storagePath: string | null = null;

    if (params.userId && params.generationKey) {
      const uploaded = await uploadWebsiteAsset({
        userId: params.userId,
        generationKey: params.generationKey,
        assetId: item.id,
        bytes: generated.bytes,
        contentType: generated.mimeType,
      });
      if (uploaded) {
        url = uploaded.publicUrl;
        storagePath = uploaded.storagePath;
      }
    }

    if (!url) {
      url = `data:${generated.mimeType};base64,${generated.bytes.toString("base64")}`;
    }

    items.push({
      id: item.id,
      role,
      name: item.name,
      prompt: item.prompt,
      alt: item.alt,
      url,
      storagePath,
      status: "generated",
      mimeType: generated.mimeType,
    });
  }

  return {
    items,
    provider: providerUsed ?? "fallback-svg",
    generatedAt: new Date().toISOString(),
  };
}

export function assetManifestForPrompt(manifest: AssetManifest): string {
  return manifest.items
    .map(
      (item) =>
        `- ${item.role}/${item.name}: ${item.alt} → ${item.url ? "URL available" : "missing"} (${item.status})`,
    )
    .join("\n");
}
