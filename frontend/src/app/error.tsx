"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-content px-6 py-16 text-center space-y-4">
      <h1 className="font-display text-xl font-semibold text-ink-strong">
        Не удалось показать страницу
      </h1>
      <p className="text-sm text-ink-secondary max-w-md mx-auto">
        {error.message || "Неизвестная ошибка. Если недавно менялся код — остановите dev-сервер, удалите папку «.next» в каталоге frontend и запустите снова."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
      >
        Попробовать снова
      </button>
    </div>
  );
}
