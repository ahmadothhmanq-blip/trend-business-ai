import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(
  ROOT,
  "public",
  "images",
  "a6794519-646a-4219-b92c-5761290bd07f (1).png",
);
const OUT_DIR = path.join(ROOT, "public", "images", "brand");

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const meta = await sharp(SRC).metadata();
  console.log("source", meta.width, meta.height, meta.format);

  const { data, info } = await sharp(SRC)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const px = (x, y) => (y * w + x) * 4;

  const isBg = (i) => {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    return r <= 28 && g <= 28 && b <= 28;
  };

  const visited = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const id = y * w + x;
    if (visited[id]) return;
    const i = id * 4;
    if (!isBg(i)) return;
    visited[id] = 1;
    stack.push(id);
  };

  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }

  while (stack.length) {
    const id = stack.pop();
    const x = id % w;
    const y = (id / w) | 0;
    data[id * 4 + 3] = 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  const region = {
    x0: Math.floor(w * 0.02),
    x1: Math.floor(w * 0.28),
    y0: Math.floor(h * 0.04),
    y1: Math.floor(h * 0.48),
  };

  let minX = region.x1;
  let minY = region.y1;
  let maxX = region.x0;
  let maxY = region.y0;
  let found = 0;

  for (let y = region.y0; y < region.y1; y++) {
    for (let x = region.x0; x < region.x1; x++) {
      const i = px(x, y);
      if (data[i + 3] === 0) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const bright = r + g + b > 90;
      const goldish = r > 80 && g > 55 && r >= b;
      if (!(bright || goldish)) continue;
      found++;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  console.log("logo bbox candidates", { found, minX, minY, maxX, maxY });

  if (found < 500) {
    throw new Error("Could not locate logo region — adjust crop.");
  }

  const pad = Math.round(Math.min(w, h) * 0.008);
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  console.log("crop", { minX, minY, cropW, cropH });

  const cropped = Buffer.alloc(cropW * cropH * 4);
  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const si = px(minX + x, minY + y);
      const di = (y * cropW + x) * 4;
      cropped[di] = data[si];
      cropped[di + 1] = data[si + 1];
      cropped[di + 2] = data[si + 2];
      cropped[di + 3] = data[si + 3];
    }
  }

  const fullPath = path.join(OUT_DIR, "trend-business-logo.png");
  await sharp(cropped, { raw: { width: cropW, height: cropH, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(fullPath);

  const iconH = Math.floor(cropH * 0.62);
  let ix0 = cropW;
  let iy0 = iconH;
  let ix1 = 0;
  let iy1 = 0;
  for (let y = 0; y < iconH; y++) {
    for (let x = 0; x < cropW; x++) {
      const i = (y * cropW + x) * 4;
      if (cropped[i + 3] < 16) continue;
      if (x < ix0) ix0 = x;
      if (y < iy0) iy0 = y;
      if (x > ix1) ix1 = x;
      if (y > iy1) iy1 = y;
    }
  }
  const ip = 4;
  ix0 = Math.max(0, ix0 - ip);
  iy0 = Math.max(0, iy0 - ip);
  ix1 = Math.min(cropW - 1, ix1 + ip);
  iy1 = Math.min(iconH - 1, iy1 + ip);
  const iw = ix1 - ix0 + 1;
  const ih = iy1 - iy0 + 1;
  const iconTight = Buffer.alloc(iw * ih * 4);
  for (let y = 0; y < ih; y++) {
    for (let x = 0; x < iw; x++) {
      const si = ((iy0 + y) * cropW + (ix0 + x)) * 4;
      const di = (y * iw + x) * 4;
      iconTight[di] = cropped[si];
      iconTight[di + 1] = cropped[si + 1];
      iconTight[di + 2] = cropped[si + 2];
      iconTight[di + 3] = cropped[si + 3];
    }
  }

  const iconPath = path.join(OUT_DIR, "trend-business-icon.png");
  await sharp(iconTight, { raw: { width: iw, height: ih, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(iconPath);

  await sharp(fullPath)
    .resize({ width: 1024, withoutEnlargement: true })
    .png()
    .toFile(path.join(OUT_DIR, "trend-business-logo@2x.png"));

  await sharp(iconPath)
    .resize(512, 512, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(OUT_DIR, "trend-business-icon-512.png"));

  await sharp(iconPath)
    .resize(32, 32, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(OUT_DIR, "favicon-32.png"));

  await sharp(iconPath)
    .resize(180, 180, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(OUT_DIR, "apple-touch-icon.png"));

  console.log("wrote", OUT_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
