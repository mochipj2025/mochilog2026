/**
 * /brain — もちスラ brain の一覧ページ
 *
 * 木田さんの脳内メモが BNS カテゴリ別のカードで並ぶ。
 * フィルター機能付きのデジタル・ガーデン。
 */
import { getAllLabPosts } from "@/lib/lab";
import LabCard from "@/components/LabCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lab — もちスラ Lab | M.O.C.H.I. LABO",
  description:
    "作業療法士・きだの脳内をそのまま公開。臨床のメモ、解剖学の考察、BNS理論の思考過程がそのまま並んでいます。",
};

export default function LabIndexPage() {
  const posts = getAllLabPosts();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* ── ヘッダー ── */}
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold font-[family-name:var(--font-hand)] text-ink">
          もちスラ Lab
        </h1>
        <p className="text-pencil italic">
          「まだ完成してない。でも、ここにある。」
        </p>
      </div>

      {/* ── カテゴリ凡例 ── */}
      <div className="mb-8 flex justify-center gap-6 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-tab-green" />
          Body（身体）
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-tab-purple" />
          Nerve（神経）
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-tab-amber" />
          Story（物語）
        </span>
      </div>

      {/* ── 記事カード一覧 ── */}
      {posts.length === 0 ? (
        <div className="py-20 text-center text-pencil">
          <p className="text-2xl mb-2">📒</p>
          <p>まだメモがありません。最初の一筆を書きましょう。</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post, i) => (
            <div
              key={post.slug}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <LabCard
                slug={post.slug}
                title={post.title}
                date={post.date}
                category={post.category}
                tags={post.tags}
                excerpt={post.excerpt}
                relatedNote={post.relatedNote}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── メルマガ CTA ── */}
      <div className="mt-16 rounded-xl graph-paper p-8 text-center">
        <p className="mb-2 text-lg font-bold font-[family-name:var(--font-hand)] text-ink">
          💌 こういう思考の続きを、直接届けます。
        </p>
        <p className="mb-6 text-sm text-pencil">
          noteやブログには書けない、脳内の「最新のスパーク」を加工せずにそのまま。
        </p>
        <a
          href="/newsletter"
          className="inline-block rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          きだからの手紙を受け取る
        </a>
      </div>
    </div>
  );
}
