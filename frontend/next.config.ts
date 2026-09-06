import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Security headers. CSP держим не-строгий в MVP — Next.js inline-styles/scripts
// требуют либо nonce (сложно с App Router), либо 'unsafe-inline'. Убираем opt-in
// в жёсткий CSP на этапе продакшена.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  // Standalone build — упаковывает в .next/standalone/ всё, что нужно для запуска,
  // включая минимальный слепок node_modules. Используется в Docker (see Dockerfile).
  output: "standalone",
  images: {
    // разрешаем next/image брать с MinIO и placehold.co (seed)
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "gta6media.duckdns.org" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
