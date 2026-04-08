"use client";

import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body
        className="min-h-screen px-6 py-10 font-sans antialiased"
        style={{
          fontFamily: 'system-ui, "Segoe UI", sans-serif',
          backgroundColor: "#f0e8df",
          backgroundImage: "linear-gradient(180deg, #f5efe8 0%, #efe6db 42%, #e8ddd2 100%)",
          color: "#1c1714",
        }}
      >
        <div className="mx-auto max-w-lg rounded-2xl border border-[rgba(201,162,39,0.35)] bg-[#fdfbf8] p-8 shadow-[0_12px_36px_rgba(60,40,30,0.08)]">
          <h1 className="font-display text-xl font-semibold text-[#120e0c] mb-3">Критическая ошибка</h1>
          <p className="text-sm text-[#5c4f47] mb-6 leading-relaxed">
            {error.message ||
              "Перезапустите приложение. Если ошибка повторяется — удалите папку .next в frontend и снова выполните npm run dev."}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ background: "#6b2d3a" }}
          >
            Повторить
          </button>
        </div>
      </body>
    </html>
  );
}
