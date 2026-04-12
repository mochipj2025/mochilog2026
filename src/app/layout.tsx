import type { Metadata } from "next";
import { Inter, Noto_Serif_JP, Zen_Kurenaido } from "next/font/google";
import "./globals.css";

/* ── フォント設定：3書体（機能/本文/手書き）── */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// 明朝体：臨床ノートの知性を表現する本文用
const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// 手書き風：見出しに「未完成な思考」の質感を出す
const zenKurenaido = Zen_Kurenaido({
  variable: "--font-zen-kurenaido",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "もちスラ Lab | M.O.C.H.I. LABO",
  description:
    "作業療法士・きだの脳内をそのまま公開する、臨床ノート型デジタル・ガーデン。BNS理論（身体・神経・物語）の思考のプロセスを、研究室（Lab）として未完成のまま覗き見できます。",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${inter.variable} ${notoSerifJP.variable} ${zenKurenaido.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* ── ヘッダー ── */}
        <header className="sticky top-0 z-50 glass">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
            <a href="/" className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="もちスラ"
                className="mochi-blink h-8 w-8 object-contain"
              />
              <span className="whitespace-nowrap text-base sm:text-lg font-bold tracking-tight text-primary">
                もちスラ Lab
              </span>
            </a>
            <nav className="flex items-center gap-3 sm:gap-6 text-sm font-medium">
              <a
                href="/about"
                className="transition-colors hover:text-primary"
              >
                About
              </a>
              <a
                href="/lab"
                className="transition-colors hover:text-primary"
              >
                Laboratory
              </a>
              <a
                href="https://note.com/mochisuranote"
                className="transition-colors hover:text-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Note
              </a>
              <a
                href="/newsletter"
                className="shrink-0 whitespace-nowrap rounded-full bg-primary px-4 py-1.5 text-[10px] sm:text-xs font-bold text-white shadow transition-transform hover:scale-105 active:scale-95"
              >
                <span className="hidden sm:inline">💌 手紙を受け取る</span>
                <span className="sm:hidden">💌 手紙</span>
              </a>
            </nav>
          </div>
        </header>

        {/* ── メインコンテンツ ── */}
        <main className="relative z-10 flex-1">{children}</main>

        {/* ── フッター ── */}
        <footer className="border-t border-bleed py-10 bg-paper/50">
          <div className="mx-auto max-w-5xl px-6 flex flex-col items-center gap-4 text-sm opacity-50">
            <p>© 2026 M.O.C.H.I. LABO — Connecting the Pulse.</p>
            <div className="flex gap-4">
              <a href="/about" className="hover:text-primary underline-offset-4 hover:underline">About</a>
              <a href="/newsletter" className="hover:text-primary underline-offset-4 hover:underline">Newsletter</a>
              <a href="/lab" className="hover:text-primary underline-offset-4 hover:underline">Lab</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
