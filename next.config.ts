import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  async redirects() {
    return [
      // Consolidate legacy /solutions/* into canonical /products/* URLs
      {
        source: "/solutions/:slug",
        destination: "/products/:slug",
        permanent: true,
      },
      // M03 — collapse duplicate dashboard product entry points
      {
        source: "/dashboard/brand-designer",
        destination: "/dashboard/brand-studio",
        permanent: true,
      },
      {
        source: "/dashboard/creative-studio",
        destination: "/dashboard/image-generator",
        permanent: true,
      },
      {
        source: "/dashboard/business-manager",
        destination: "/dashboard/business-intelligence",
        permanent: true,
      },
      {
        source: "/dashboard/business-audit",
        destination: "/dashboard/feasibility-study",
        permanent: true,
      },
      {
        source: "/dashboard/subscription",
        destination: "/dashboard/billing",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      // Deny framing site-wide, except Website Builder preview APIs (D-017).
      // Those routes set X-Frame-Options: SAMEORIGIN themselves so the
      // dashboard iframe can load live preview without Chrome's
      // "localhost refused to connect" framing error.
      {
        source: "/((?!api/website-builder/).*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        source: "/api/website-builder/:id/live-preview",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
        ],
      },
      {
        source: "/api/website-builder/preview/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/icon.svg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  serverExternalPackages: ["openai", "jspdf", "jszip"],
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "radix-ui"],
  },
};

export default nextConfig;
