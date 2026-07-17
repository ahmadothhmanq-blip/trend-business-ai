import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { isUserFacingProvider } from "@/lib/ai/provider-config";
import { NextResponse } from "next/server";
import { z } from "zod";

const testSchema = z.object({
  provider: z.string().min(1),
  apiKey: z.string().min(1, "API key is required"),
  model: z.string().min(1),
});

type TestResult = {
  success: boolean;
  provider: string;
  model: string;
  latencyMs: number;
  error?: string;
};

async function testDeepSeek(apiKey: string, model: string): Promise<TestResult> {
  const start = Date.now();
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "Reply with: ok" }],
      max_tokens: 5,
    }),
  });
  const latencyMs = Date.now() - start;
  if (!res.ok) {
    const body = await res.text();
    return { success: false, provider: "deepseek", model, latencyMs, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
  }
  return { success: true, provider: "deepseek", model, latencyMs };
}

async function testOpenAI(apiKey: string, model: string): Promise<TestResult> {
  const start = Date.now();
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "Reply with: ok" }],
      max_tokens: 5,
    }),
  });
  const latencyMs = Date.now() - start;
  if (!res.ok) {
    const body = await res.text();
    return { success: false, provider: "openai", model, latencyMs, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
  }
  return { success: true, provider: "openai", model, latencyMs };
}

async function testAnthropic(apiKey: string, model: string): Promise<TestResult> {
  const start = Date.now();
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 5,
      messages: [{ role: "user", content: "Reply with: ok" }],
    }),
  });
  const latencyMs = Date.now() - start;
  if (!res.ok) {
    const body = await res.text();
    return { success: false, provider: "claude", model, latencyMs, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
  }
  return { success: true, provider: "claude", model, latencyMs };
}

async function testGemini(apiKey: string, model: string): Promise<TestResult> {
  const start = Date.now();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Reply with: ok" }] }],
      generationConfig: { maxOutputTokens: 5 },
    }),
  });
  const latencyMs = Date.now() - start;
  if (!res.ok) {
    const body = await res.text();
    return { success: false, provider: "gemini", model, latencyMs, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
  }
  return { success: true, provider: "gemini", model, latencyMs };
}

async function testGrok(apiKey: string, model: string): Promise<TestResult> {
  const start = Date.now();
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "Reply with: ok" }],
      max_tokens: 5,
    }),
  });
  const latencyMs = Date.now() - start;
  if (!res.ok) {
    const body = await res.text();
    return { success: false, provider: "grok", model, latencyMs, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
  }
  return { success: true, provider: "grok", model, latencyMs };
}

async function testLlama(_apiKey: string, model: string): Promise<TestResult> {
  return {
    success: false,
    provider: "llama",
    model,
    latencyMs: 0,
    error: "Llama provider requires a custom endpoint. Configure your Llama API host first.",
  };
}

const testers: Record<string, (apiKey: string, model: string) => Promise<TestResult>> = {
  deepseek: testDeepSeek,
  openai: testOpenAI,
  claude: testAnthropic,
  gemini: testGemini,
  grok: testGrok,
  llama: testLlama,
};

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = testSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const { provider, apiKey, model } = parsed.data;

  if (!isUserFacingProvider(provider)) {
    return NextResponse.json(
      { error: `Provider is not available: ${provider}` },
      { status: 400 },
    );
  }

  const tester = testers[provider];

  if (!tester) {
    return NextResponse.json(
      { error: `Unknown provider: ${provider}` },
      { status: 400 },
    );
  }

  try {
    const result = await tester(apiKey, model);
    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      result: { success: false, provider, model, latencyMs: 0, error: message },
    });
  }
}
