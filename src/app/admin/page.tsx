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
  const [stats, setStats] = useState<{ total: number, eligible: number, educating: number } | null>(null);
  const [poolQueue, setPoolQueue] = useState<any[]>([]);
  const [poolHistory, setPoolHistory] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [preview, setPreview] = useState<{ title: string, content: string } | null>(null);

  const fetchData = async (pwd: string) => {
    try {
      // 1. 購読者統計
      const resStats = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: pwd, action: "stats" })
      });
      const dataStats = await resStats.json();
      if (dataStats.success) setStats(dataStats);

      // 2. 予約・履歴リスト
      const resDash = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: pwd, action: "dashboard" })
      });
      const dataDash = await resDash.json();
      if (dataDash.success) {
        setPoolQueue(dataDash.upcoming);
        setPoolHistory(dataDash.history);
      }

      // 3. システム診断
      const resHealth = await fetch("/api/health-check", {
        headers: { "Authorization": `Bearer ${pwd}` } // 本来は専用のシークレットだが今回は共用
      });
      if (resHealth.ok) {
        const dataHealth = await resHealth.json();
        setHealth(dataHealth);
      }
    } catch (err) {
      console.error("Data fetch error:", err);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (secret.length > 0) {
      setAuthenticated(true);
      fetchData(secret);
    }
  };

  const handlePreview = async (file: string) => {
    try {
      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, action: "preview", file })
      });
      const data = await res.json();
      if (data.success) {
        setPreview({ title: data.frontmatter.title, content: data.content });
      }
    } catch (err) {
      alert("プレビューの取得に失敗しました。");
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
        {/* ステータスパネル */}
        {stats && (
          <div className="flex gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex-1 text-center">
              <p className="text-xs text-pencil">総購読者</p>
              <p className="text-xl font-bold text-ink">{stats.total}名</p>
            </div>
            <div className="w-px bg-primary/10" />
            <div className="flex-1 text-center">
              <p className="text-xs text-pencil">配信対象 (7日以上)</p>
              <p className="text-xl font-bold text-primary">{stats.eligible}名</p>
            </div>
            <div className="w-px bg-primary/10" />
            <div className="flex-1 text-center">
              <p className="text-xs text-pencil">教育中 (7日未満)</p>
              <p className="text-xl font-bold text-pencil">{stats.educating}名</p>
            </div>
          </div>
        )}

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

        <hr className="border-pencil/10 my-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 予約キュー */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-ink">📅 配信予約（Queue）</h2>
            <div className="space-y-2">
              {poolQueue.length > 0 ? (
                poolQueue.map((item) => (
                  <div key={item.file} className="flex items-center justify-between p-3 rounded-lg bg-paper border border-pencil/20 shadow-sm">
                    <div>
                      <p className="text-xs text-primary font-bold">{item.date}</p>
                      <p className="text-sm font-bold text-ink truncate max-w-[200px]">{item.title}</p>
                    </div>
                    <button 
                      onClick={() => handlePreview(item.file)}
                      className="text-xs font-bold text-pencil hover:text-primary transition-colors underline"
                    >
                      Preview
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-pencil">予約された原稿はありません。</p>
              )}
            </div>
          </section>

          {/* 配信履歴 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-ink">📜 配信実績（History）</h2>
            <div className="space-y-2">
              {poolHistory.length > 0 ? (
                poolHistory.map((item) => (
                  <div key={item.file} className="flex items-center justify-between p-3 rounded-lg bg-bleed/5 border border-pencil/10">
                    <div>
                      <p className="text-xs text-pencil">{item.date}</p>
                      <p className="text-sm font-bold text-ink/60">{item.title}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-ink/5 text-pencil">Sent</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-pencil">まだ履歴はありません。</p>
              )}
            </div>
          </section>
        </div>

        {/* システム診断診断 */}
        {health && (
          <section className="mt-8 p-6 rounded-xl border border-pencil/20 bg-paper">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                🛡️ System Health
                <span className={`inline-block w-2 h-2 rounded-full ${health.status === 'Healthy' ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
              </h2>
              <span className="text-xs text-pencil font-mono">{health.timestamp}</span>
            </div>
            <div className="space-y-2">
              {health.reports.map((report: any, idx: number) => (
                <div key={idx} className="flex gap-3 text-xs border-b border-pencil/5 pb-2 last:border-0">
                  <span className={`font-bold uppercase w-16 ${report.level === 'Critical' ? 'text-red-500' : report.level === 'Warning' ? 'text-amber-500' : 'text-primary'}`}>
                    [{report.level}]
                  </span>
                  <span className="font-bold text-ink w-20">{report.component}</span>
                  <span className="text-pencil">{report.message}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs italic text-clinical-blue font-bold">
              💡 Antigravity: {health.antigravity_hint}
            </p>
          </section>
        )}
      </div>

      {/* プレビューモーダル */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-6">
          <div className="bg-paper rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden border border-pencil/20">
            <div className="p-6 border-b border-pencil/10 flex justify-between items-center bg-bleed/5">
              <h3 className="font-bold text-ink">{preview.title}</h3>
              <button onClick={() => setPreview(null)} className="text-pencil hover:text-ink font-bold text-xl">&times;</button>
            </div>
            <div className="p-8 overflow-y-auto bg-graph-paper">
              <pre className="text-sm text-ink whitespace-pre-wrap font-sans leading-relaxed">
                {preview.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
