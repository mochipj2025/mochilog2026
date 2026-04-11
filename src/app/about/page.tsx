import { Zen_Kurenaido } from "next/font/google";

export const metadata = {
  title: "About | もちスラ Lab",
  description: "作業療法士・きだの歩みと、BNS理論（身体・神経・物語）が生まれた背景。セラピストの安全基地としてのミッションを語ります。",
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "きだ",
    "jobTitle": "作業療法士",
    "url": "https://lab.mochisura-lab.com/about",
    "sameAs": [
      "https://note.com/mochisuranote",
      "https://www.threads.net/@hogushiya_kida",
      "https://x.com/mochilabo2026"
    ],
    "description": "15年の臨床経験を持つ作業療法士。身体・神経・物語を統合するBNS理論の提唱者であり、M.O.C.H.I. LABO主宰。",
    "worksFor": {
      "@type": "Organization",
      "name": "M.O.C.H.I. LABO",
      "url": "https://lab.mochisura-lab.com"
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── JSON-LD for AIEO ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* ── Background decoration ── */}
      <div className="fixed inset-0 lab-gradient opacity-5 pointer-events-none" />
      
      <article className="relative mx-auto max-w-3xl px-6 py-20 lg:py-32">
        {/* ── Mascot & Header ── */}
        <header className="mb-16 text-center space-y-6">
          <div className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse blur-xl" />
            <img
              src="/images/mochisura_avatar.png"
              alt="Mochi-Sura mascot"
              className="relative w-full h-full object-cover rounded-full border-2 border-primary/30 shadow-2xl glass"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-[family-name:var(--font-zen-kurenaido)] text-primary">
              Connecting the Pulse.
            </h1>
            <p className="text-lg opacity-60 font-[family-name:var(--font-noto-serif-jp)] italic">
              指先のパルセーション、人との接続。
            </p>
          </div>
        </header>

        {/* ── Main Content ── */}
        <div className="space-y-16 text-ink/90 leading-relaxed font-[family-name:var(--font-noto-serif-jp)]">
          
          <section className="space-y-6">
            <h2 className="text-2xl font-bold border-b border-primary/20 pb-2">
              「指先が、言葉を失った日」から始まった。
            </h2>
            <p>
              病院という名の「巨大なシステム」の中で、15年間、わたしは作業療法士として臨床の最前線に立っていました。
            </p>
            <p>
              特に精神科という、心と身体の境界線が曖昧になる場所で。何千人もの「痛み」と向き合い、その背後にある「物語」を聴き続けてきました。
            </p>
            <p>
              ある日、気づいたのです。教科書通りの解剖学を当てはめ、エビデンスに基づいた神経学で説明を尽くしても、どうしても解けない「痛み」がある。そして、その痛みに寄り添おうとするセラピスト自身が、過酷な感情労働の中で、まるで「消耗品」のように摩耗していく現実に。
            </p>
          </section>

          <section className="glass rounded-3xl p-8 space-y-6">
            <h2 className="text-2xl font-bold border-b border-primary/20 pb-2">
              わたしたちを繋ぐ、3つのパルス（BNSモデル）
            </h2>
            <p>
              臨床の現場でわたしが辿り着いた答えは、**「統合（Integration）」**でした。
            </p>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <span className="text-primary font-bold">Body:</span>
                <span className="text-sm">起始部・停止部の微細なロック。物理的な解剖学の真実。</span>
              </li>
              <li className="flex gap-4">
                <span className="text-primary font-bold">Nerve:</span>
                <span className="text-sm">自律神経のトーン、迷走神経の調律。安心を届ける周波数。</span>
              </li>
              <li className="flex gap-4">
                <span className="text-primary font-bold">Story:</span>
                <span className="text-sm">臨床に流れる人生の文脈。わたしたちがセラピストとして聴くべき声。</span>
              </li>
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold border-b border-primary/20 pb-2">
              安全基地（Safe Base）としての使命
            </h2>
            <p>
              なぜ、わたしは病院を飛び出し、このラボを作ったのか。
            </p>
            <p>
              それは、セラピストが「誰かのために」自分を削るのではなく、自分自身を**「安全基地（Safe Base）」**として確立し、臨床家としての誇りを取り戻せる場所が必要だと確信したからです。
            </p>
            <p>
              AIがどれほど進化しても、指先から伝わる微かな震え（パルセーション）を読み取り、相手の物語を尊重することは、わたしたち人間にしかできません。
            </p>
          </section>

          {/* ── Credentials ── */}
          <section className="graph-paper rounded-2xl p-8 text-sm space-y-4">
            <h3 className="font-bold uppercase tracking-widest text-primary">Credentials</h3>
            <ul className="space-y-2 opacity-80">
              <li>• 作業療法士（国家資格）/ 修業年数 15年</li>
              <li>• 通算臨床件数 20,000件以上（精神科・身体領域）</li>
              <li>• 身体・神経・精神の統合アプローチ「BNS理論」体系化</li>
              <li>• AIを活用した臨床知性の言語化リサーチ</li>
            </ul>
          </section>

          <footer className="pt-10 space-y-12">
            <div className="flex flex-col items-center gap-6">
              <p className="text-sm opacity-50 italic">
                Connect with the Pulse.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="/newsletter"
                  className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-xl transition-transform hover:scale-105"
                >
                  💌 メルマガで「手紙」を購読する
                </a>
                <a
                  href="https://note.com/mochisuranote/membership"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-primary/30 px-8 py-3 text-sm font-bold text-primary transition-all hover:bg-primary/5"
                >
                  🛡️ メンバーシップへ入る
                </a>
              </div>
            </div>
          </footer>
        </div>
      </article>
    </div>
  );
}
