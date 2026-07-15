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
    ];
  },
  async headers() {
    return [
      {
        source: "/((?!api/website-builder/preview).*)",
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
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
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
