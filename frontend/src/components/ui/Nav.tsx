"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/today", label: "Сегодня" },
  { href: "/calendar", label: "Календарь" },
  { href: "/lunar-matrix", label: "Обеды" },
  { href: "/body-signals", label: "Самочувствие" },
  { href: "/settings", label: "Настройки" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="flex items-center gap-1">
      {links.map((l) => {
        const active = path === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
              active
                ? "bg-accent-dark text-white shadow-card"
                : "text-ink-secondary hover:text-ink hover:bg-surface-hover"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
