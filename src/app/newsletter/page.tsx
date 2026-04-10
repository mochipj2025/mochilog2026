/**
 * /newsletter — 「木田からの手紙」メルマガ登録ページ
 *
 * Phase 0: まずフォームだけ設置してリストを蓄積する。
 * Phase 1 以降で Listmonk + SES と連携予定。
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "きだからの手紙 — もちスラ brain | M.O.C.H.I. LABO",
  description:
    "noteやブログには書けない、脳内の「最新のスパーク」を加工せずにそのまま届けます。週1回、セラピストの臨床を豊かにする一通。",
};

export default function NewsletterPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      {/* ── レターヘッド ── */}
      <div className="graph-paper rounded-2xl p-10 sm:p-14 text-center animate-fade-up">
        <div className="mb-6 text-5xl">💌</div>

        <h1 className="mb-4 text-3xl font-bold font-[family-name:var(--font-hand)] text-ink">
          きだからの手紙
        </h1>

        <p className="mb-8 text-sm leading-relaxed text-pencil font-[family-name:var(--font-serif)]">
          note やブログには書けない、
          <br />
          脳内の「最新のスパーク」を、
          <br />
          加工せずにそのまま届けます。
        </p>

        {/* ── 届く内容の一覧 ── */}
        <div className="mb-10 mx-auto max-w-sm text-left">
          <ul className="space-y-3 text-sm text-ink font-[family-name:var(--font-serif)]">
            <li className="flex gap-3">
              <span className="text-clinical-blue">📒</span>
              次に書こうとしていること
            </li>
            <li className="flex gap-3">
              <span className="text-clinical-blue">🧠</span>
              臨床で感じた、まだ言語化できない違和感
            </li>
            <li className="flex gap-3">
              <span className="text-clinical-blue">🔬</span>
              BNS 理論の最新アップデート
            </li>
            <li className="flex gap-3">
              <span className="text-clinical-blue">🎧</span>
              Podcast で話した、その裏側の本音
            </li>
          </ul>
        </div>

        {/* ── 登録フォーム ── */}
        <form
          action="#"
          method="POST"
          className="mx-auto flex max-w-sm flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="メールアドレスを入力"
            className="flex-1 rounded-full border border-pencil/30 bg-paper px-5 py-3 text-sm text-ink placeholder:text-pencil/60 outline-none focus:border-clinical-blue focus:ring-2 focus:ring-clinical-blue/20 transition-all"
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            登録する
          </button>
        </form>

        {/* ── 補足 ── */}
        <div className="mt-6 space-y-1 text-xs text-pencil">
          <p>配信頻度：週1回程度（日曜夜 or 月曜朝）</p>
          <p>いつでも解除できます。スパムは送りません。</p>
        </div>
      </div>

      {/* ── もちスラコメント ── */}
      <div className="mochi-comment mt-10">
        まだ始まったばかりの手紙です。最初の読者になってくれたら、きっと嬉しい。
      </div>
    </div>
  );
}
