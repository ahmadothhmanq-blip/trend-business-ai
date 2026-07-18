/**
 * Shared image provider for AI Assets Engine.
 * Reuses OpenAI DALL·E when OPENAI_API_KEY is set; otherwise SVG fallback.
 */

export async function generateRealisticImage(
  prompt: string,
): Promise<{ bytes: Buffer; mimeType: string; provider: string } | null> {
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
        quality: "standard",
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error(
        "AI Assets Engine: OpenAI image failed",
        response.status,
        text.slice(0, 400),
      );
      return null;
    }

    const json = (await response.json()) as {
      data?: Array<{ b64_json?: string }>;
    };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) return null;
    return {
      bytes: Buffer.from(b64, "base64"),
      mimeType: "image/png",
      provider: "openai-dall-e-3",
    };
  } catch (error) {
    console.error("AI Assets Engine: OpenAI image threw", error);
    return null;
  }
}

export function svgFallbackDataUrl(
  label: string,
  primary: string,
  secondary: string,
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${primary}"/>
      <stop offset="100%" stop-color="${secondary}"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#g)"/>
  <text x="80" y="820" fill="rgba(255,255,255,0.85)" font-family="Georgia, serif" font-size="48">${label.replace(/[<>&']/g, "")}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function isImageProviderConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}
