import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      // Allow all HTTPS hosts — needed for user-uploaded images from arbitrary sources
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  compress: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "",
  },
  turbopack: {},
};

export default nextConfig;
