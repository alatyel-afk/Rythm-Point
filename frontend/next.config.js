/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["astronomia"],
  /** Снижает гонки воркеров на Windows (ошибки вида Cannot find module './682.js' в .next) */
  experimental: {
    webpackBuildWorker: false,
  },
  /**
   * Прокси на Python: только через NEXT_PROXY_API в src/lib/backend-proxy.ts
   * внутри route handlers (с откатом на mock). Раньше использовались rewrites —
   * они полностью обходили src/app/api/* и при мёртвом uvicorn давали 500.
   */
};

module.exports = nextConfig;
