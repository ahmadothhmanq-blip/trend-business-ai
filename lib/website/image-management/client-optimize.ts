export type ClientOptimizeOptions = {
  maxWidth?: number;
  quality?: number;
  format?: "webp" | "avif" | "jpeg";
  cropAspect?: "free" | "1:1" | "16:9" | "4:5";
};

export type OptimizedImageResult = {
  blob: Blob;
  width: number;
  height: number;
  mimeType: string;
  filename: string;
};

function mimeForFormat(format: ClientOptimizeOptions["format"]): string {
  switch (format) {
    case "avif":
      return "image/avif";
    case "jpeg":
      return "image/jpeg";
    default:
      return "image/webp";
  }
}

function extensionForFormat(format: ClientOptimizeOptions["format"]): string {
  switch (format) {
    case "avif":
      return "avif";
    case "jpeg":
      return "jpg";
    default:
      return "webp";
  }
}

/**
 * Client-side image optimization — WebP/AVIF, resize, optional crop, compression.
 */
export async function optimizeImageFile(
  file: File,
  opts: ClientOptimizeOptions = {},
): Promise<OptimizedImageResult> {
  const maxWidth = opts.maxWidth ?? 1920;
  const quality = opts.quality ?? 0.85;
  const format = opts.format ?? "webp";
  const cropAspect = opts.cropAspect ?? "free";

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let sw = img.width;
      let sh = img.height;
      let sx = 0;
      let sy = 0;

      if (cropAspect === "1:1") {
        const side = Math.min(img.width, img.height);
        sw = side;
        sh = side;
        sx = (img.width - side) / 2;
        sy = (img.height - side) / 2;
      } else if (cropAspect === "16:9") {
        const target = img.width / (16 / 9);
        if (target <= img.height) {
          sh = target;
          sy = (img.height - target) / 2;
        } else {
          sw = img.height * (16 / 9);
          sx = (img.width - sw) / 2;
        }
      } else if (cropAspect === "4:5") {
        const target = img.width / (4 / 5);
        if (target <= img.height) {
          sh = target;
          sy = (img.height - target) / 2;
        } else {
          sw = img.height * (4 / 5);
          sx = (img.width - sw) / 2;
        }
      }

      const scale = Math.min(1, maxWidth / sw);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(sw * scale);
      canvas.height = Math.round(sh * scale);
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(url);
      if (!ctx) {
        reject(new Error("Canvas unavailable"));
        return;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Image optimization failed"));
            return;
          }
          const base = file.name.replace(/\.[^.]+$/, "");
          resolve({
            blob,
            width: canvas.width,
            height: canvas.height,
            mimeType: mimeForFormat(format),
            filename: `${base}.${extensionForFormat(format)}`,
          });
        },
        mimeForFormat(format),
        quality,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Invalid image file"));
    };
    img.src = url;
  });
}

/** Responsive width breakpoints for srcset generation. */
export const RESPONSIVE_WIDTHS = [400, 800, 1200, 1600, 2400] as const;

export function lazyLoadingAttrs(role: "hero" | "content" = "content") {
  return role === "hero"
    ? { loading: "eager" as const, decoding: "async" as const, fetchPriority: "high" as const }
    : { loading: "lazy" as const, decoding: "async" as const };
}
