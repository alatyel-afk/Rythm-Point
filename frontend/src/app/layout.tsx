import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/ui/Nav";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Протокол дня",
  description: "Персональный ежедневный протокол: питание, нагрузка, дыхание, лунный день, транзиты.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen font-sans pb-24 text-ink antialiased">
        <header className="sticky top-0 z-50 border-b border-gold/30 bg-[#fdfbf8]/92 shadow-[0_2px_16px_rgba(60,40,28,0.07)] backdrop-blur-md">
          <div className="mx-auto max-w-content px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold mb-1">
                Джйотиш · питание
              </p>
              <span className="font-display text-[1.4rem] sm:text-[1.55rem] font-semibold tracking-[-0.03em] text-ink-strong">
                Протокол
              </span>
            </div>
            <Nav />
          </div>
        </header>
        <main className="mx-auto max-w-content px-6 pt-10 pb-16">{children}</main>
      </body>
    </html>
  );
}
