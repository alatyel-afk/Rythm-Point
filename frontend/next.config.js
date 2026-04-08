/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["astronomia"],
  /** Снижает гонки воркеров на Windows (ошибки вида Cannot find module './682.js' в .next) */
  experimental: {
    webpackBuildWorker: false,
  },
  /**
   * Только для `npm run dev:webpack`: отключаем файловый кеш Webpack в dev —
   * иначе на Windows (особенно с длинным путём / кириллицей) часто бьётся .next и
   * пропадают чанки вида ./276.js → «чёрно-белая» страница ошибки без CSS.
   */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  /**
   * Прокси на Python: только через NEXT_PROXY_API в src/lib/backend-proxy.ts
   * внутри route handlers (с откатом на mock). Раньше использовались rewrites —
   * они полностью обходили src/app/api/* и при мёртвом uvicorn давали 500.
   */
};

module.exports = nextConfig;
