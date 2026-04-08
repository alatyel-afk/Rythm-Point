"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-content px-6 py-16 text-center">
      <h1 className="text-xl font-bold text-ink mb-2">Не удалось отобразить страницу</h1>
      <p className="text-ink-secondary text-sm mb-6 break-words max-w-lg mx-auto">{error.message}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-lg bg-accent-dark px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
      >
        Попробовать снова
      </button>
    </div>
  );
}
