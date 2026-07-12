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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 88,
              height: 98,
            }}
          >
            <svg
              width="88"
              height="98"
              viewBox="0 0 64 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M32 16.5 48 23.5V38c0 9.5-6.8 16.8-16 20-9.2-3.2-16-10.5-16-20V23.5L32 16.5Z"
                fill="#111111"
                stroke="#D4AF37"
                strokeWidth="2"
              />
              <rect x="22" y="40" width="4.2" height="9" rx="1" fill="#D4AF37" opacity="0.75" />
              <rect x="28.2" y="35.5" width="4.2" height="13.5" rx="1" fill="#D4AF37" opacity="0.88" />
              <rect x="34.4" y="31.5" width="4.2" height="17.5" rx="1" fill="#D4AF37" />
              <rect x="40.6" y="26.5" width="4.2" height="22.5" rx="1" fill="#FFD700" />
              <path d="M42.7 24.2 45.5 27.2H44v4.2h-2.6v-4.2h-1.5l2.8-3Z" fill="#FFD700" />
              <path
                d="M24 14.5 27.5 9l4.5 5 4.5-5 3.5 5.5"
                stroke="#D4AF37"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="27.5" cy="8.2" r="1.5" fill="#FFD700" />
              <circle cx="32" cy="7.2" r="1.7" fill="#FFD700" />
              <circle cx="36.5" cy="8.2" r="1.5" fill="#FFD700" />
            </svg>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 64,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                color: "#ffffff",
              }}
            >
              Trend Business AI
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#D4AF37",
              }}
            >
              Premium AI Company
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 500,
              lineHeight: 1.35,
              color: "rgba(255, 255, 255, 0.78)",
              maxWidth: "880px",
              marginTop: 8,
            }}
          >
            AI Business Planning Workspace
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 20,
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
