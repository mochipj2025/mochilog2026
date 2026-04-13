"use client";

import React, { useState, useEffect } from "react";
import { Lock, Key, Mail, ArrowRight } from "lucide-react";

interface LabGateProps {
  children: React.ReactNode;
}

const PASSCODE = "mochimochi";

export default function LabGate({ children }: LabGateProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unlocked = localStorage.getItem("mochi_lab_unlocked");
    if (unlocked === "true") {
      setIsUnlocked(true);
    }
    setIsLoading(false);
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.toLowerCase() === PASSCODE) {
      setIsUnlocked(true);
      localStorage.setItem("mochi_lab_unlocked", "true");
      setError(false);
    } else {
      setError(true);
      // 簡単な揺れアニメーションなどのためにエラー状態を維持
      setTimeout(() => setError(false), 500);
    }
  };

  if (isLoading) return <div className="min-height-screen bg-deep-abyss" />;

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[60vh] overflow-hidden rounded-2xl border border-clinical-blue/10 bg-paper/50 p-1 animate-fade-up">
      {/* ── 背景のボカシ ── */}
      <div className="absolute inset-0 z-0 opacity-20 blur-xl">
        <div className="h-full w-full bg-gradient-to-br from-clinical-blue/20 to-accent/10" />
      </div>

      {/* ── ゲート本体 ── */}
      <div className="relative z-10 flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-deep-abyss border border-clinical-blue/30 shadow-[0_0_15px_rgba(0,210,255,0.2)]">
          <Lock className="h-8 w-8 text-clinical-blue" />
        </div>

        <h2 className="mb-4 text-2xl font-bold font-[family-name:var(--font-hand)] text-ink">
          Restricted Access: 臨床研究アーカイブ
        </h2>

        <p className="mb-8 max-w-md text-sm text-pencil leading-relaxed md:text-base">
          ここは、BNS理論（身体・神経・物語）の深淵を探求する秘密の研究室です。
          技術とクライアントの安全を守るため、アクセスには
          <span className="text-clinical-blue font-bold px-1 italic">「合言葉」</span>
          が必要です。
        </p>

        {/* ── 入力フォーム ── */}
        <form onSubmit={handleUnlock} className="mb-10 w-full max-w-xs transition-all">
          <div className={`relative mb-4 overflow-hidden rounded-full border bg-deep-abyss transition-all ${error ? 'border-redpen animate-shake' : 'border-clinical-blue/20 focus-within:border-clinical-blue/50'}`}>
            <div className="flex items-center px-4">
              <Key className="h-4 w-4 text-pencil mr-3" />
              <input
                type="text"
                placeholder="合言葉を入力..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-pencil/50"
              />
              <button
                type="submit"
                className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-clinical-blue text-deep-abyss transition-transform hover:scale-110 active:scale-90"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          {error && <p className="text-xs text-redpen">合言葉が正しくありません。</p>}
        </form>

        {/* ── メルマガ誘導 ── */}
        <div className="rounded-xl border border-clinical-blue/10 bg-deep-mid/50 p-6 backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-clinical-blue/60">
            <Mail className="h-3 w-3" />
            <span>How to get the key?</span>
          </div>
          <p className="mb-4 text-xs text-pencil">
            合言葉は「きだからの手紙（メルマガ）」の<br className="sm:hidden" />ウェルカムメールに記載されています。
          </p>
          <a
            href="/newsletter"
            className="text-sm font-bold text-ink underline underline-offset-4 transition-colors hover:text-clinical-blue"
          >
            M.O.C.H.I. LABO へ入会する（無料）
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}
