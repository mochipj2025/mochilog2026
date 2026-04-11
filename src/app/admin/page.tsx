"use client";

/**
 * /admin — メルマガ配信管理画面
 *
 * BROADCAST_SECRET で認証し、件名・本文を入力して一斉配信する。
 * テスト送信（自分だけに送る）→ 本番配信の2ステップ運用。
 */
import { useState } from "react";

export default function AdminBroadcastPage() {
  const [secret, setSecret] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<any>(null);
  const [authenticated, setAuthenticated] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (secret.length > 0) {
      setAuthenticated(true);
    }
  };

  const handleSend = async (mode: "test" | "broadcast") => {
    if (!subject || !html) {
      alert("件名と本文を入力してください。");
      return;
    }

    if (mode === "broadcast") {
      const confirmed = window.confirm(
        "⚠️ 全購読者に配信します。本当によろしいですか？\n\n" +
        "（先にテスト送信で内容を確認することを推奨します）"
      );
      if (!confirmed) return;
    }

    setStatus("loading");
    setResult(null);

    try {
      const body: any = { secret, subject, html };
      if (mode === "test" && testEmail) {
        body.testEmail = testEmail;
      }

      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setResult(data);
      } else {
        setStatus("error");
        setResult(data);
      }
    } catch (err: any) {
      setStatus("error");
      setResult({ error: err?.message || "Network error" });
    }
  };

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md px-6 py-20">
        <div className="graph-paper rounded-2xl p-10 text-center space-y-8">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse blur-lg" />
            <img
              src="/images/mochisura_avatar.png"
              alt="Mochi-Sura"
              className="relative w-full h-full object-cover rounded-full border border-primary/20 shadow-xl"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight font-[family-name:var(--font-zen-kurenaido)]">
              M.O.C.H.I. LABO
            </h1>
            <p className="text-xs text-pencil mt-1 uppercase tracking-widest">
              Administrator Access
            </p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="配信パスワードを入力"
              className="w-full rounded-lg border border-pencil/20 bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white shadow-xl transition-transform hover:scale-105"
            >
              認証する
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── 配信画面 ──
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 lg:py-20">
      <div className="flex items-center gap-6 mb-12 border-b border-primary/10 pb-8">
        <div className="w-20 h-20 flex-shrink-0">
          <img
            src="/images/mochisura_avatar.png"
            alt="Mochi-Sura"
            className="w-full h-full object-cover rounded-full border border-primary/20 shadow-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-ink font-[family-name:var(--font-zen-kurenaido)]">
            📬 メルマガ配信
          </h1>
          <p className="text-sm text-pencil">
            「きだからの手紙」を全購読者の安全基地へ届けます。
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 件名 */}
        <div>
          <label className="mb-1 block text-sm font-bold text-ink">件名</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="きだからの手紙 Vol.02：知性で自分を護る技術"
            className="w-full rounded-lg border border-pencil/30 bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* 本文 (HTML) */}
        <div>
          <label className="mb-1 block text-sm font-bold text-ink">
            本文（HTML）
          </label>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="<h1>きだからの手紙</h1><p>こんにちは...</p>"
            rows={16}
            className="w-full rounded-lg border border-pencil/30 bg-paper px-4 py-3 text-sm text-ink font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* テスト送信 */}
        <div className="rounded-xl bg-bleed/5 p-6 space-y-3">
          <h3 className="text-sm font-bold text-ink">🧪 テスト送信</h3>
          <p className="text-xs text-pencil">
            まず自分のメールアドレスに送って確認してから、全員に配信しましょう。
          </p>
          <div className="flex gap-3">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="自分のメールアドレス"
              className="flex-1 rounded-lg border border-pencil/30 bg-paper px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={() => handleSend("test")}
              disabled={status === "loading" || !testEmail}
              className="rounded-lg bg-ink px-6 py-2 text-sm font-bold text-white transition-transform hover:scale-105 disabled:opacity-50"
            >
              {status === "loading" ? "送信中..." : "テスト送信"}
            </button>
          </div>
        </div>

        {/* 本番配信 */}
        <button
          onClick={() => handleSend("broadcast")}
          disabled={status === "loading"}
          className="w-full rounded-lg bg-primary px-6 py-4 text-lg font-bold text-white shadow-xl transition-transform hover:scale-105 disabled:opacity-50"
        >
          {status === "loading" ? "配信中..." : "📨 全購読者に配信する"}
        </button>

        {/* 結果表示 */}
        {result && (
          <div
            className={`rounded-xl p-6 text-sm ${
              status === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
