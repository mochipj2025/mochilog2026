/**
 * / — もちスラ brain トップページ（ノートの表紙）
 *
 * 既存のヒーロー ＋ BNS理論セクションに加え、
 * brain最新記事とメルマガCTAを追加した統合ランディング。
 */
import { getAllLabPosts } from "@/lib/lab";
import LabCard from "@/components/LabCard";

export default function Home() {
  const latestPosts = getAllLabPosts().slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col transition-colors duration-500">
      {/* ── Background decoration ── */}
      <div className="fixed inset-0 lab-gradient opacity-10 pointer-events-none" />

      {/* ── Hero Section ── */}
      <section className="relative flex flex-col items-center justify-center py-24 px-6 text-center lg:py-32">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-primary">
          Mochi-Sura Lab
        </h2>
        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl">
          臨床の孤独を、
          <br />
          <span className="text-primary italic">「一生の学び」</span>に変える。
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-8 opacity-70 font-[family-name:var(--font-serif)]">
          病院勤務15年の作業療法士が辿り着いた、身体・神経・物語を繋ぐ場所。
          <br />
          「理論通りにいかない」と一人で悩むすべてのセラピストへの、安全基地です。
        </p>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/lab"
            className="flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-bold text-white shadow-xl transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
          >
            <span className="text-xl">📔</span>
            Labの中を覗く
          </a>
          <a
            href="https://note.com/mochisuranote"
            className="rounded-full border border-primary/30 px-8 py-4 text-lg font-bold text-primary transition-all hover:bg-primary/5"
            target="_blank"
            rel="noopener noreferrer"
          >
            📝 完成品を読む（note）
          </a>
        </div>
      </section>

      {/* ── BNS Theory Section ── */}
      <section id="bns" className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-20 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl font-[family-name:var(--font-hand)]">
              BNS Theory
            </h2>
            <p className="mt-4 opacity-70 italic font-[family-name:var(--font-serif)]">
              臨床を解き明かす、3つの層
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="glass group rounded-3xl p-8 transition-all hover:bg-white/[0.05] tab-body">
              <div className="mb-6 text-4xl">🌱</div>
              <h3 className="mb-4 text-2xl font-bold" style={{ color: "var(--tab-green)" }}>
                Body (身体)
              </h3>
              <p className="text-sm leading-relaxed opacity-70 font-[family-name:var(--font-serif)]">
                解剖学や「起始停止」だけでは届かない領域があります。痛みは単なる故障ではなく、身体からの切実な「叫び」。その防衛のスイッチを、優しくオフにする方法を考えます。
              </p>
            </div>

            <div className="glass group rounded-3xl p-8 transition-all hover:bg-white/[0.05] tab-nerve">
              <div className="mb-6 text-4xl">🤝</div>
              <h3 className="mb-4 text-2xl font-bold" style={{ color: "var(--tab-purple)" }}>
                Nerve (神経)
              </h3>
              <p className="text-sm leading-relaxed opacity-70 font-[family-name:var(--font-serif)]">
                触れることは、相手の神経と響き合うこと。生理学の裏付けを持って、お客様の身体を「戦いモード」から、深い安らぎの「安全モード」へとエスコートします。
              </p>
            </div>

            <div className="glass group rounded-3xl p-8 transition-all hover:bg-white/[0.05] tab-story">
              <div className="mb-6 text-4xl">🎙️</div>
              <h3 className="mb-4 text-2xl font-bold" style={{ color: "var(--tab-amber)" }}>
                Story (物語)
              </h3>
              <p className="text-sm leading-relaxed opacity-70 font-[family-name:var(--font-serif)]">
                痛みの中にある、その人だけの物語（人生の文脈）に耳を傾けます。セラピストが「安全基地」となることで、お客様は初めて心の鎧を脱ぐことができるのです。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── もちスラ Lab（最新の脳内メモ）── */}
      {latestPosts.length > 0 && (
        <section className="py-24 bg-paper/30">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold font-[family-name:var(--font-hand)]">
                📒 最近のLabメモ
              </h2>
              <p className="mt-3 text-pencil italic text-sm font-[family-name:var(--font-serif)]">
                まだ完成してない。でも、ここにある。
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post, i) => (
                <div key={post.slug} style={{ animationDelay: `${i * 100}ms` }}>
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

            <div className="mt-10 text-center">
              <a
                href="/lab"
                className="text-sm font-bold text-clinical-blue underline underline-offset-4 transition-colors hover:text-primary"
              >
                もっと覗く →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ── メルマガ CTA ── */}
      <section className="py-20">
        <div className="mx-auto max-w-xl px-6 text-center">
          <div className="graph-paper rounded-2xl p-10">
            <div className="mb-4 text-4xl">💌</div>
            <h2 className="mb-3 text-2xl font-bold font-[family-name:var(--font-hand)] text-ink">
              きだからの手紙
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-pencil font-[family-name:var(--font-serif)]">
              note や表のブログには書けない、日々のなかでふと思いついたことや、現場での気づき。等身大の想いを、ありのまま届けます。
            </p>
            <a
              href="/newsletter"
              className="inline-block rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              詳細を見る
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
