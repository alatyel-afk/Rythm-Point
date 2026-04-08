import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-content px-6 py-20 text-center space-y-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Джйотиш · питание</p>
      <h1 className="font-display text-2xl font-semibold text-ink-strong">Страница не найдена</h1>
      <p className="text-sm text-ink-secondary max-w-md mx-auto leading-relaxed">
        Адрес изменился или набран с опечаткой. Вернитесь на главный протокол.
      </p>
      <Link
        href="/today"
        className="inline-flex rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-card hover:bg-accent-dark transition-colors"
      >
        На «Сегодня»
      </Link>
    </div>
  );
}
