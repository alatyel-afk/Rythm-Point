"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/today", label: "Сегодня" },
  { href: "/calendar", label: "Календарь" },
  { href: "/lunar-matrix", label: "Обеды" },
  { href: "/shopping", label: "Покупки" },
  { href: "/body-signals", label: "Самочувствие" },
  { href: "/settings", label: "Настройки" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap items-center justify-end gap-0.5">
      {links.map((l) => {
        const active = path === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-md px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
              active
                ? "bg-accent text-white shadow-md"
                : "text-ink-secondary hover:bg-gold-soft hover:text-ink"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
