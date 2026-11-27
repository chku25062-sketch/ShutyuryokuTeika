import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "集中力低下観察",
  description: "客観的な集中力スコアを測定し、最適な作業・休憩判断を支援するアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased font-sans">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur sticky top-0 z-50">
            <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
              <Link href="/" className="font-bold text-lg flex items-center gap-2">
                <span>⚡</span>
                <span>集中力低下観察</span>
              </Link>
              <nav className="flex items-center gap-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                <Link href="/" className="hover:text-black dark:hover:text-white transition">
                  ホーム
                </Link>
                <Link href="/history" className="hover:text-black dark:hover:text-white transition">
                  履歴
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6">
            {children}
          </main>
          <footer className="border-t border-gray-200 dark:border-gray-800 py-4 text-center text-xs text-gray-500">
            集中力低下観察 &copy; 2026
          </footer>
        </div>
      </body>
    </html>
  );
}
