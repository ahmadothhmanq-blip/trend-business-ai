function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function publicVideoPageHeaders(): Record<string, string> {
  return {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "private, no-store",
    "Content-Security-Policy":
      "default-src 'none'; style-src 'unsafe-inline'; media-src https: blob: data:; img-src data: https:; base-uri 'none'; form-action 'none'; frame-ancestors *",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Robots-Tag": "index, follow",
  };
}

export function buildPublicVideoHtml(input: {
  title: string;
  description: string;
  pageUrl: string;
  videoUrl: string;
  mimeType: "video/mp4" | "video/webm";
  durationSec: number;
}): string {
  const title = escapeHtml(input.title.trim() || "Published video");
  const description = escapeHtml(input.description.trim() || "Professional video published from Video Studio.");
  const pageUrl = escapeHtml(input.pageUrl);
  const videoUrl = escapeHtml(input.videoUrl);
  const mime = escapeHtml(input.mimeType);
  const duration = Math.max(1, Math.round(input.durationSec));
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${pageUrl}">
  <meta property="og:type" content="video.other">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:video" content="${videoUrl}">
  <meta property="og:video:url" content="${videoUrl}">
  <meta property="og:video:secure_url" content="${videoUrl}">
  <meta property="og:video:type" content="${mime}">
  <meta property="og:video:duration" content="${duration}">
  <meta name="twitter:card" content="player">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:player" content="${pageUrl}">
  <meta name="twitter:player:stream" content="${videoUrl}">
  <meta name="twitter:player:stream:content_type" content="${mime}">
  <style>
    :root { color-scheme: dark; }
    body { margin: 0; font-family: "Segoe UI", Inter, system-ui, sans-serif; background: #070b12; color: #e8eef8; }
    main { max-width: 960px; margin: 0 auto; padding: 48px 20px 72px; }
    h1 { font-size: 1.75rem; letter-spacing: -0.03em; margin: 0 0 12px; }
    p { color: #9aa7bb; line-height: 1.6; margin: 0 0 28px; }
    video { width: 100%; border-radius: 16px; background: #000; }
  </style>
</head>
<body>
  <main>
    <h1>${title}</h1>
    <p>${description}</p>
    <video controls playsinline preload="metadata">
      <source src="${videoUrl}" type="${mime}">
    </video>
  </main>
</body>
</html>
`;
}

export function htmlContainsInternalStorage(html: string): boolean {
  return /storage:\/\//i.test(html) || /"storage_path"/i.test(html);
}

export function buildPublicVideoEmbedHtml(pageUrl: string, title?: string): string {
  const src = escapeHtml(pageUrl.trim());
  const label = escapeHtml((title || "Published video").trim() || "Published video");
  return `<iframe src="${src}" title="${label}" loading="lazy" allow="fullscreen; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" style="width:100%;aspect-ratio:16/9;border:0;border-radius:12px;background:#000"></iframe>`;
}
