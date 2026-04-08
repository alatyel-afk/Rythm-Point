/** @type {import('next').NextConfig} */
const nextConfig = {
  /** Снижает гонки воркеров на Windows (ошибки вида Cannot find module './682.js' в .next) */
  experimental: {
    webpackBuildWorker: false,
  },
  /**
   * Прокси на Python-бэкенд только если задано (см. .env.local):
   *   NEXT_PROXY_API=http://127.0.0.1:8000
   * Без этого используются маршруты Next.js (src/app/api/*, mock-engine).
   * Иначе при выключенном бэкенде /api уходит в никуда или приходит неверный JSON — белый экран в React.
   */
  async rewrites() {
    const base = process.env.NEXT_PROXY_API?.trim();
    if (!base) return [];
    const origin = base.replace(/\/$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${origin}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
