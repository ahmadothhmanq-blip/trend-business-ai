import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import {
  isPlaceholderProvider,
  isUserFacingProvider,
  shouldExposePlaceholderProviders,
} from "@/lib/ai/provider-config";
import {
  getDefaultSettings,
  sanitizeSettingsForClient,
  type AIProviderSettings,
} from "@/types/ai-settings";
import { NextResponse } from "next/server";
import { z } from "zod";

const providerEntrySchema = z.object({
  name: z.string().min(1),
  enabled: z.boolean(),
  apiKey: z.string(),
  model: z.string(),
  status: z.enum(["connected", "not_configured", "error"]),
});

const settingsSchema = z.object({
  default_provider: z.string().min(1),
  auto_fallback: z.boolean(),
  retry_count: z.number().int().min(0).max(10),
  temperature: z.number().min(0).max(2),
  max_tokens: z.number().int().min(256).max(128000),
  timeout_seconds: z.number().int().min(10).max(600),
  providers: z.array(providerEntrySchema),
});

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase
    .from("ai_provider_settings")
    .select("*")
    .eq("user_id", auth.user!.id)
    .single();

  if (error && error.code !== "PGRST116") {
    // Table may not exist yet (42P01) or relation unknown — return defaults
    if (
      error.code === "42P01" ||
      (typeof error.message === "string" && error.message.includes("relation"))
    ) {
      return NextResponse.json({ settings: getDefaultSettings() });
    }
    return databaseErrorResponse("ai-settings.get", error);
  }

  if (!data) {
    return NextResponse.json({ settings: getDefaultSettings() });
  }

  const providers = Array.isArray(data.providers)
    ? data.providers.map((p: { apiKey?: string; [key: string]: unknown }) => ({
        ...p,
        apiKey: maskApiKey(typeof p.apiKey === "string" ? p.apiKey : ""),
      }))
    : [];

  const settings = sanitizeSettingsForClient({
    ...data,
    providers,
  } as AIProviderSettings);

  return NextResponse.json({ settings });
}

function maskApiKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}

function isMaskedApiKey(key: string): boolean {
  return !key || key.includes("••••");
}

export async function PUT(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid settings" },
      { status: 400 },
    );
  }

  // Preserve stored API keys when the client sends a masked placeholder.
  const { data: existing } = await auth.supabase
    .from("ai_provider_settings")
    .select("providers")
    .eq("user_id", auth.user!.id)
    .maybeSingle();

  const existingByName = new Map<string, string>();
  if (Array.isArray(existing?.providers)) {
    for (const p of existing.providers as Array<{ name?: string; apiKey?: string }>) {
      if (p?.name && typeof p.apiKey === "string" && p.apiKey && !isMaskedApiKey(p.apiKey)) {
        existingByName.set(p.name, p.apiKey);
      }
    }
  }

  if (!isUserFacingProvider(parsed.data.default_provider)) {
    return NextResponse.json(
      { error: "Default provider is not available" },
      { status: 400 },
    );
  }

  const facingProviders = parsed.data.providers.filter((p) =>
    isUserFacingProvider(p.name),
  );

  const providers = facingProviders.map((p) => ({
    ...p,
    apiKey: isMaskedApiKey(p.apiKey)
      ? (existingByName.get(p.name) ?? "")
      : p.apiKey,
  }));

  // Preserve stored placeholder provider rows in production so a save does not wipe them.
  if (!shouldExposePlaceholderProviders() && Array.isArray(existing?.providers)) {
    for (const p of existing.providers as Array<{
      name?: string;
      enabled?: boolean;
      apiKey?: string;
      model?: string;
      status?: string;
    }>) {
      if (!p?.name || !isPlaceholderProvider(p.name)) continue;
      if (providers.some((x) => x.name === p.name)) continue;
      providers.push({
        name: p.name,
        enabled: false,
        apiKey: typeof p.apiKey === "string" ? p.apiKey : "",
        model: typeof p.model === "string" ? p.model : "",
        status:
          p.status === "connected" || p.status === "error"
            ? p.status
            : "not_configured",
      });
    }
  }

  const row = {
    user_id: auth.user!.id,
    default_provider: parsed.data.default_provider,
    auto_fallback: parsed.data.auto_fallback,
    retry_count: parsed.data.retry_count,
    temperature: parsed.data.temperature,
    max_tokens: parsed.data.max_tokens,
    timeout_seconds: parsed.data.timeout_seconds,
    providers,
    updated_at: new Date().toISOString(),
  };

  const { error } = await auth.supabase
    .from("ai_provider_settings")
    .upsert(row, { onConflict: "user_id" });

  if (error) {
    if (
      error.code === "42P01" ||
      (typeof error.message === "string" && error.message.includes("relation"))
    ) {
      return NextResponse.json(
        { error: "AI Provider Settings table not found. Please apply migration 012." },
        { status: 503 },
      );
    }
    return databaseErrorResponse("ai-settings.update", error);
  }

  return NextResponse.json({ message: "AI provider settings saved." });
}
