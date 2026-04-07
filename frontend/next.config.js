/** @type {import('next').NextConfig} */
const nextConfig = {
  /** Снижает гонки воркеров на Windows (ошибки вида Cannot find module './682.js' в .next) */
  experimental: {
    webpackBuildWorker: false,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
