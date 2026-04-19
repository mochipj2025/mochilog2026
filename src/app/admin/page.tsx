"use client";

import { useState, useEffect } from "react";
import { User } from "@/lib/db";
import { newsletterSteps } from "@/lib/newsletter-steps";

export default function AdminDashboardPage() {
  const [secret, setSecret] = useState("");
  const [activeTab, setActiveTab] = useState<"broadcast" | "nurturing">("broadcast");
  
  // --- Broadcast States ---
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [broadcastStatus, setBroadcastStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [broadcastResult, setBroadcastResult] = useState<any>(null);
  const [stats, setStats] = useState<{ total: number, eligible: number, educating: number } | null>(null);
  const [poolQueue, setPoolQueue] = useState<any[]>([]);
  const [poolHistory, setPoolHistory] = useState<any[]>([]);
  const [preview, setPreview] = useState<{ title: string, content: string } | null>(null);

  // --- Nurturing (Step Mail) States ---
  const [users, setUsers] = useState<User[]>([]);
  const [nurturingStatus, setNurturingStatus] = useState<string | null>(null);
  const [errorVisible, setErrorVisible] = useState<string | null>(null);

  const [authenticated, setAuthenticated] = useState(false);
  const [systemHealth, setSystemHealth] = useState<any>(null);

  const fetchBroadcastData = async (pwd: string) => {
    try {
      const resStats = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: pwd, action: "stats" })
      });
      const dataStats = await resStats.json();
      if (dataStats.success) setStats(dataStats);

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

      const resHealth = await fetch("/api/health-check", {
        headers: { "Authorization": `Bearer ${pwd}` }
      });
      if (resHealth.ok) {
        const dataHealth = await resHealth.json();
        setSystemHealth(dataHealth);
      }
    } catch (err) {
      console.error("Broadcast data fetch error:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/test/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error("Failed to fetch users");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (secret.length > 0) {
      setAuthenticated(true);
      fetchBroadcastData(secret);
      fetchUsers();
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

  const handleSendBroadcast = async (mode: "test" | "broadcast") => {
    if (!subject || !html) {
      alert("件名と本文を入力してください。");
      return;
    }

    if (mode === "broadcast") {
      const confirmed = window.confirm("⚠️ 全購読者に一斉配信します。本当によろしいですか？");
      if (!confirmed) return;
    }

    setBroadcastStatus("loading");
    setBroadcastResult(null);

    try {
      const body: any = { secret, subject, html };
      if (mode === "test" && testEmail) body.testEmail = testEmail;

      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setBroadcastStatus(res.ok ? "success" : "error");
      setBroadcastResult(data);
      
      if (res.ok) {
        notify(mode === "test" ? "テスト送信完了！" : "一斉配信完了！");
      }
    } catch (err: any) {
      setBroadcastStatus("error");
      setBroadcastResult({ error: err?.message || "Network error" });
      setErrorVisible(err?.message || "配信処理に失敗しました。");
    }
  };

  const notify = (msg: string) => {
    setNurturingStatus(msg);
    setTimeout(() => setNurturingStatus(null), 3000);
  };

  const handleRunCronNow = async () => {
    notify("配信エンジン点火中...");
    try {
      const res = await fetch("/api/cron/nurturing");
      const data = await res.json();
      notify(`配信完了: ${data.processedCount || 0}通送信`);
      fetchUsers();
    } catch (err) {
      setErrorVisible("エンジン点火失敗");
    }
  };

  const handleSyncResend = async () => {
    notify("Resend同期中...");
    try {
      const res = await fetch("/api/test/sync-resend", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        notify(`${data.imported}件を新規同期完了`);
        fetchUsers();
      } else {
        setErrorVisible(data.error);
      }
    } catch (err) {
      setErrorVisible("同期エラー");
    }
  };

  const handleResetUser = async (email: string) => {
    try {
      await fetch("/api/test/reset-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      notify("進捗をリセットしました");
      fetchUsers();
    } catch (err) {
      setErrorVisible("リセット失敗");
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!confirm(`${email} を除外しますか？`)) return;
    try {
      await fetch("/api/test/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      notify("ユーザーを除外しました");
      fetchUsers();
    } catch (err) {
      setErrorVisible("除外失敗");
    }
  };

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md px-6 py-20">
        <div className="graph-paper rounded-2xl p-10 text-center space-y-8 border border-primary/20 shadow-2xl">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse blur-lg" />
            <img
              src="/images/mochisura_avatar.png"
              alt="Mochi-Sura"
              className="relative w-full h-full object-cover rounded-full border-2 border-primary/30 shadow-xl"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-ink tracking-tight font-[family-name:var(--font-zen-kurenaido)]">
              M.O.C.H.I. LABO
            </h1>
            <p className="text-xs text-pencil mt-1 uppercase tracking-[0.3em] font-bold">
              Central Command Center
            </p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="SECRET CODE を入力"
              className="w-full rounded-lg border-2 border-pencil/10 bg-paper px-4 py-3 text-center text-lg font-mono tracking-widest text-ink outline-none focus:border-primary transition-all shadow-inner"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-ink px-6 py-4 text-sm font-black text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-100"
            >
              司令部へログイン
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
      <div className="flex items-center justify-between mb-10 border-b border-primary/20 pb-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 flex-shrink-0">
            <img
              src="/images/mochisura_avatar.png"
              alt="Mochi-Sura"
              className="w-full h-full object-cover rounded-full border border-primary/20 shadow-lg"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-ink font-[family-name:var(--font-zen-kurenaido)]">
              司令部 : Information Command
            </h1>
            <p className="text-xs text-pencil font-bold uppercase tracking-widest">
              Securing the Sanctuary Infrastructure
            </p>
          </div>
        </div>
        
        <div className="flex bg-bleed/5 p-1 rounded-xl border border-pencil/10">
          <button 
            onClick={() => setActiveTab("broadcast")}
            className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'broadcast' ? 'bg-ink text-white shadow-md' : 'text-pencil hover:text-ink'}`}
          >
            一斉配信
          </button>
          <button 
            onClick={() => setActiveTab("nurturing")}
            className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'nurturing' ? 'bg-ink text-white shadow-md' : 'text-pencil hover:text-ink'}`}
          >
            ステップメール
          </button>
        </div>
      </div>

      <main className="space-y-10 animate-in fade-in duration-500">
        {activeTab === "broadcast" ? (
          <div className="space-y-8">
            {stats && (
              <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-ink/5 border border-primary/10 shadow-inner">
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold text-pencil">Total Contacts</p>
                  <p className="text-2xl font-black text-ink">{stats.total}</p>
                </div>
                <div className="text-center border-x border-pencil/10">
                  <p className="text-[10px] uppercase font-bold text-primary">Eligible</p>
                  <p className="text-2xl font-black text-primary">{stats.eligible}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold text-pencil">Developing</p>
                  <p className="text-2xl font-black text-pencil">{stats.educating}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-black uppercase text-ink">Subject / 件名</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="きだからの手紙 Vol.X..."
                  className="w-full rounded-xl border-2 border-pencil/10 bg-paper px-4 py-4 text-base font-bold text-ink outline-none focus:border-primary transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase text-ink">Body (HTML) / 本文</label>
                <textarea
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  placeholder="HTML Content Here..."
                  rows={12}
                  className="w-full rounded-xl border-2 border-pencil/10 bg-paper px-4 py-4 text-sm font-mono text-ink outline-none focus:border-primary transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-bleed/5 p-6 rounded-2xl border border-pencil/10">
                <h3 className="text-xs font-black uppercase mb-3">🧪 Test Fire</h3>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Test Email Address"
                    className="flex-1 rounded-lg border border-pencil/20 bg-paper/50 px-3 py-2 text-sm text-ink outline-none"
                  />
                  <button
                    onClick={() => handleSendBroadcast("test")}
                    disabled={broadcastStatus === "loading"}
                    className="bg-ink text-paper px-4 py-2 rounded-lg text-xs font-black hover:opacity-80 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {broadcastStatus === "loading" ? "Sending..." : "Send Test"}
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleSendBroadcast("broadcast")}
                disabled={broadcastStatus === "loading"}
                className="bg-primary text-paper rounded-2xl text-lg font-black shadow-xl hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-50 flex items-center justify-center p-6"
              >
                {broadcastStatus === "loading" ? "送信中..." : "📨 全軍(全購読者)へ配信"}
              </button>
            </div>
            
            {nurturingStatus && <div className="p-4 bg-primary/20 border border-primary/30 rounded-xl text-sm font-black text-ink text-center animate-bounce">{nurturingStatus}</div>}
            {errorVisible && <div className="p-4 bg-redpen/20 border border-redpen/30 rounded-xl text-sm font-black text-redpen text-center">{errorVisible}</div>}

            {broadcastResult && (
              <div className={`p-4 rounded-xl text-[10px] font-mono border shadow-inner ${broadcastStatus === 'success' ? 'bg-paper border-primary/30 text-primary' : 'bg-paper border-redpen/30 text-redpen'}`}>
                <p className="font-black mb-1 uppercase tracking-tighter">Transmission Registry:</p>
                <div className="opacity-80 break-all h-20 overflow-y-auto">
                   {JSON.stringify(broadcastResult, null, 2)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex gap-3">
              <button 
                className="flex-1 bg-clinical-blue text-white py-4 rounded-xl text-sm font-black shadow-lg hover:opacity-90 active:scale-95 transition-all"
                onClick={handleRunCronNow}
              >
                配信エンジン点火 (Run Cron Now)
              </button>
              <button 
                className="flex-1 bg-ink text-white py-4 rounded-xl text-sm font-black shadow-lg hover:opacity-90 active:scale-95 transition-all"
                onClick={handleSyncResend}
              >
                Resend Audience から同期
              </button>
            </div>

            {nurturingStatus && <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-lg text-xs font-bold text-center animate-pulse">{nurturingStatus}</div>}
            {errorVisible && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs font-bold text-red-600 text-center">{errorVisible}</div>}

            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase border-l-4 border-ink pl-3 text-ink">Subscriber Progress / 購読者進捗</h3>
              <div className="overflow-hidden rounded-2xl border border-pencil/10 bg-paper shadow-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-ink text-paper uppercase text-[10px] font-black tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Step</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pencil/5">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-ink">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black text-paper ${
                            user.current_step === 0 ? 'bg-pencil/50' : 
                            user.current_step === 1 ? 'bg-clinical-blue' :
                            user.current_step === 2 ? 'bg-primary' : 'bg-ink'
                          }`}>
                            STEP {user.current_step}
                          </span>
                        </td>
                        <td className="px-6 py-4 uppercase text-[10px] font-bold text-pencil">{user.status}</td>
                        <td className="px-6 py-4 flex gap-3">
                          <button onClick={() => handleResetUser(user.email)} className="text-[10px] font-black text-primary hover:underline">RESET</button>
                          <button onClick={() => handleDeleteUser(user.email)} className="text-[10px] font-black text-red-500 hover:underline">REMOVE</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        <hr className="border-pencil/10" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <section className="space-y-4">
            <h2 className="text-xs font-black uppercase text-ink">Upcoming Broadcasts</h2>
            <div className="space-y-2">
              {poolQueue.map(item => (
                <div key={item.file} className="p-4 rounded-xl bg-paper border border-pencil/10 shadow-sm flex justify-between items-center group">
                  <div>
                    <p className="text-[10px] text-primary font-bold">{item.date}</p>
                    <p className="text-sm font-black text-ink">{item.title}</p>
                  </div>
                  <button onClick={() => handlePreview(item.file)} className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-pencil underline">Preview</button>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-black uppercase text-ink">System Health</h2>
            {systemHealth && (
              <div className="p-6 rounded-2xl bg-paper border border-pencil/10 shadow-inner">
                <div className="space-y-2">
                  {systemHealth.reports.map((r: any, i: number) => (
                    <div key={i} className="flex gap-2 text-[10px] items-start border-b border-pencil/5 pb-2 last:border-0">
                      <span className={`font-black w-14 ${r.level === 'Critical' ? 'text-red-500' : 'text-primary'}`}>[{r.level}]</span>
                      <span className="font-bold text-ink w-20">{r.component}</span>
                      <span className="text-pencil">{r.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-md p-6">
          <div className="bg-paper rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden border-2 border-primary/20">
            <div className="p-6 border-b border-pencil/10 flex justify-between items-center bg-bleed/5">
              <h3 className="font-black text-ink">{preview.title}</h3>
              <button onClick={() => setPreview(null)} className="text-pencil hover:text-ink font-black text-2xl">&times;</button>
            </div>
            <div className="p-8 overflow-y-auto bg-graph-paper">
              <div className="prose prose-sm prose-ink max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-ink leading-relaxed font-medium">
                  {preview.content}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
