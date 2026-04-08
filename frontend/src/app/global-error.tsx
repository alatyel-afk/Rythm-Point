"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", padding: 24, background: "#dce8f4", color: "#182331" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: 12 }}>Критическая ошибка</h2>
        <p style={{ marginBottom: 20, wordBreak: "break-word" }}>{error.message}</p>
        <button type="button" onClick={() => reset()} style={{ padding: "8px 16px", cursor: "pointer" }}>
          Перезагрузить
        </button>
      </body>
    </html>
  );
}
