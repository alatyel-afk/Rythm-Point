export default function Loading() {
  return (
    <div
      className="mx-auto max-w-content px-6 py-16"
      style={{ minHeight: "40vh" }}
      aria-live="polite"
    >
      <div className="premium-card rounded-2xl p-10 text-center space-y-3 border-gold/20">
        <div className="inline-flex h-8 w-8 animate-pulse rounded-full bg-gold/30 mx-auto" aria-hidden />
        <p className="text-sm font-medium text-ink-secondary">Загрузка…</p>
      </div>
    </div>
  );
}
