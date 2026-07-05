import { ImageResponse } from "next/og";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/seo/site";

export const socialImageSize = {
  width: 1200,
  height: 630,
};

export const socialImageAlt = `${SITE_NAME} — AI-powered business platform`;

export const socialImageContentType = "image/png";

export function createSocialImageResponse() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0a0a0a 0%, #111111 45%, #0d0d0d 100%)",
          position: "relative",
          overflow: "hidden",
          padding: "64px 80px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "900px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(212, 175, 55, 0.22) 0%, rgba(212, 175, 55, 0.06) 40%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            opacity: 0.35,
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: "#ffffff",
            }}
          >
            <span>Trend Business </span>
            <span
              style={{
                background: "linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #B8941F 100%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              AI
            </span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              fontWeight: 500,
              lineHeight: 1.35,
              color: "rgba(255, 255, 255, 0.78)",
              maxWidth: "880px",
            }}
          >
            AI Business Planning Workspace
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "8px",
              fontSize: 22,
              lineHeight: 1.5,
              color: "rgba(255, 255, 255, 0.52)",
              maxWidth: "820px",
            }}
          >
            {DEFAULT_DESCRIPTION}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, transparent, #D4AF37, #FFD700, #D4AF37, transparent)",
            display: "flex",
          }}
        />
      </div>
    ),
    {
      ...socialImageSize,
    },
  );
}
