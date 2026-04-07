import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/ui/Nav";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Протокол дня",
  description: "Персональный ежедневный протокол: питание, нагрузка, дыхание, лунный день, транзиты.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="min-h-screen font-sans pb-24 bg-surface-bg text-ink">
        <header className="sticky top-0 z-50 bg-surface-card border-b border-border-strong shadow-nav">
          <div className="mx-auto max-w-content px-6 py-2.5 flex items-center justify-between">
            <span className="text-[15px] font-bold tracking-tight text-accent-dark">
              Протокол
            </span>
            <Nav />
          </div>
        </header>
        <main className="mx-auto max-w-content px-6 pt-10">{children}</main>
      </body>
    </html>
  );
}
