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
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", background: "#efe6db", color: "#1c1714" }}>
        <h1 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>Критическая ошибка</h1>
        <p style={{ fontSize: "0.875rem", marginBottom: "1rem", maxWidth: "28rem" }}>
          {error.message || "Перезапустите приложение. Если ошибка повторяется — удалите папку .next в frontend и снова выполните npm run dev."}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: "0.5rem 1rem",
            background: "#6b2d3a",
            color: "#fff",
            border: "none",
            borderRadius: "0.75rem",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Повторить
        </button>
      </body>
    </html>
  );
}
