"use client";

/**
 * /newsletter — 「きだからの手紙」メルマガ登録ページ
 *
 * Resend API と連携して購読リストを構築する。
 */
import { useState } from "react";

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("ありがとうございます。これから、大切に届けさせていただきます。");
      } else {
        setStatus("error");
        setMessage(data.error || "登録に失敗しました。時間をおいて再度お試しください。");
      }
    } catch (err) {
      setStatus("error");
      setMessage("ネットワークエラーが発生しました。");
    }
  };

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

        {status === "success" ? (
          <div className="mx-auto max-w-sm rounded-xl bg-clinical-blue/10 p-6 text-clinical-blue animate-in fade-in zoom-in duration-500">
            <p className="text-sm font-bold">{message}</p>
          </div>
        ) : (
          <>
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
              </ul>
            </div>

            {/* ── 登録フォーム ── */}
            <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="メールアドレスを入力"
                disabled={status === "loading"}
                className="flex-1 rounded-full border border-pencil/30 bg-paper px-5 py-3 text-sm text-ink placeholder:text-pencil/60 outline-none focus:border-clinical-blue focus:ring-2 focus:ring-clinical-blue/20 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {status === "loading" ? "処理中..." : "登録する"}
              </button>
            </form>

            {status === "error" && (
              <p className="mt-4 text-xs font-bold text-red-500">{message}</p>
            )}

            {/* ── 補足 ── */}
            <div className="mt-6 space-y-1 text-xs text-pencil">
              <p>配信頻度：週1回程度（日曜夜 or 月曜朝）</p>
              <p>いつでも解除できます。スパムは送りません。</p>
            </div>
          </>
        )}
      </div>

      {/* ── もちスラコメント ── */}
      <div className="mochi-comment mt-10">
        {status === "success" 
          ? "やった！きださんの手紙が届くのが、ぼくも楽しみなんだ！"
          : "まだ始まったばかりの手紙です。最初の読者になってくれたら、きっと嬉しい。"}
      </div>
    </div>
  );
}
