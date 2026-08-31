"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCEPT = "image/png,image/jpeg,image/webp";
const MAX_BYTES = 8 * 1024 * 1024;

export const VIDEO_STUDIO_SOURCE_IMAGE_LIMIT = 8;

type Props = {
  files: File[];
  onChange: (files: File[]) => void;
  title: string;
  hint: string;
  addLabel: string;
  invalidTypeMessage: string;
  tooManyMessage: string;
  onError: (message: string) => void;
};

export function SourceImageField({
  files,
  onChange,
  title,
  hint,
  addLabel,
  invalidTypeMessage,
  tooManyMessage,
  onError,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | File[]) => {
    const next = [...files];
    for (const file of Array.from(incoming)) {
      if (!ACCEPT.split(",").includes(file.type)) {
        onError(invalidTypeMessage);
        continue;
      }
      if (file.size > MAX_BYTES) {
        onError(invalidTypeMessage);
        continue;
      }
      if (next.length >= VIDEO_STUDIO_SOURCE_IMAGE_LIMIT) {
        onError(tooManyMessage);
        break;
      }
      next.push(file);
    }
    onChange(next);
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-white/60">{title}</label>
      <p className="mb-3 text-[11px] text-white/40">{hint}</p>
      <div className="flex flex-wrap gap-3">
        {files.map((file, index) => {
          const preview = URL.createObjectURL(file);
          return (
            <div
              key={`${file.name}-${file.size}-${index}`}
              className="relative size-20 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="" className="size-full object-cover" />
              <button
                type="button"
                className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white/80 hover:text-white"
                onClick={() => onChange(files.filter((_, i) => i !== index))}
                aria-label="Remove image"
              >
                <X className="size-3" />
              </button>
            </div>
          );
        })}
        {files.length < VIDEO_STUDIO_SOURCE_IMAGE_LIMIT ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex size-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/15 bg-white/[0.02] text-[10px] font-medium text-white/50 transition hover:border-premium-gold/40 hover:text-premium-gold-light",
            )}
          >
            <ImagePlus className="size-4" />
            {addLabel}
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) addFiles(event.target.files);
          event.target.value = "";
        }}
      />
      {files.length === 0 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 rounded-lg border-white/10 text-xs text-white/60"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="mr-1.5 size-3.5" />
          {addLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function fileToSourceImagePayload(file: File): Promise<{
  filename: string;
  mimeType: string;
  base64: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.slice(result.indexOf(",") + 1) : result;
      resolve({
        filename: file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120),
        mimeType: file.type || "image/png",
        base64,
      });
    };
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read image."));
    reader.readAsDataURL(file);
  });
}
