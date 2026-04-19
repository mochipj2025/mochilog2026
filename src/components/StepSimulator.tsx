"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  created_at: string;
  current_step: number;
  status: string;
}

export default function StepSimulator() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/test/users");
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleTestTrigger = async () => {
    setMessage("配信実行中...");
    try {
      // 本来は Cron が叩くエンドポイントをシミュレーターから手動実行
      // ローカル/テスト環境で動くように authorization ヘッダー等の扱いに注意
      const res = await fetch("/api/cron/nurturing");
      const data = await res.json();
      setMessage(`配信完了: ${data.sentTotal}通送信`);
      fetchUsers();
    } catch (err) {
      setError("配信テストに失敗しました");
    }
  };

  const handleReset = async (email: string) => {
    try {
      await fetch("/api/test/reset-user", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage(`${email} の進捗をリセットしました`);
      fetchUsers();
    } catch (err) {
      setError("リセットに失敗しました");
    }
  };

  const handleSyncResend = async () => {
    setMessage("Resendから同期中...");
    try {
      const res = await fetch("/api/test/sync-resend", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        notify(`${data.imported}件の新規購読者を同期完了（計${data.totalFound}件）`);
        fetchUsers();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("同期に失敗しました");
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!confirm(`${email} をリストから除外しますか？`)) return;
    try {
      const res = await fetch("/api/test/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        notify("ユーザーを除外しました");
        fetchUsers();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("除外に失敗しました");
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        notify(`登録成功: ${email}`);
        fetchUsers();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("登録に失敗しました");
    }
  };

  const notify = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="simulator-container">
      <header className="simulator-header">
        <h1>Step Mail Distribution Simulator</h1>
        <p className="subtitle">司令部専用：配信ステータスの監視とテスト実行</p>
      </header>

      <div className="simulator-controls" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button className="primary-btn" onClick={handleTestTrigger}>
          全ユーザーに対して配信チェック実行 (Run Cron Now)
        </button>
        <button className="secondary-btn" onClick={handleSyncResend} style={{ width: 'auto', marginTop: 0, padding: '0.8rem 1.5rem' }}>
          Resend Audience から購読者を一括同期
        </button>
        {message && <div className="toast success">{message}</div>}
        {error && <div className="toast error">{error}</div>}
      </div>

      <main className="simulator-main">
        <section className="user-section">
          <h2>購読者リスト</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="table-wrapper">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>登録日時</th>
                    <th>進捗</th>
                    <th>ステータス</th>
                    <th>アクション</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className={user.status === 'unsubscribed' ? 'row-unsub' : ''}>
                      <td>{user.email}</td>
                      <td>{new Date(user.created_at).toLocaleString()}</td>
                      <td>
                        <span className={`step-badge step-${user.current_step}`}>
                          Step {user.current_step}
                        </span>
                      </td>
                      <td>{user.status}</td>
                      <td className="actions-cell">
                        <button className="text-btn reset-link" onClick={() => handleResetUser(user.email)}>Reset</button>
                        <span className="divider">|</span>
                        <button className="text-btn delete-link" onClick={() => handleDeleteUser(user.email)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="info-section">
          <div className="info-card" style={{ marginBottom: "1.5rem" }}>
            <h3>新規テストユーザー登録</h3>
            <form onSubmit={handleRegister} className="register-form">
              <input type="email" name="email" placeholder="test@example.com" required />
              <button type="submit" className="secondary-btn">登録</button>
            </form>
          </div>

          <div className="info-card">
            <h3>配信スケジュール</h3>
            <ul className="schedule-list">
              <li><strong>Step 1 (Day 1):</strong> なぜ、AIと砦を築くのか</li>
              <li><strong>Step 2 (Day 2):</strong> 知性の外注｜Deep Research</li>
              <li><strong>Step 3 (Day 3):</strong> 「ありがとう」は毒である</li>
              <li><strong>Step 4 (Day 7):</strong> 3日間の沈黙と、指先のパルス</li>
            </ul>
          </div>
        </section>
      </main>

      <style jsx>{`
        .simulator-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          color: #e0e0e0;
          font-family: 'Outfit', sans-serif;
        }
        .simulator-header {
          border-bottom: 1px solid #333;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
        }
        h1 {
          font-size: 2.5rem;
          background: linear-gradient(135deg, #fff 0%, #888 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }
        .subtitle {
          color: #888;
          font-style: italic;
        }
        .simulator-controls {
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .primary-btn {
          padding: 0.8rem 1.5rem;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
          transition: all 0.3s ease;
        }
        .primary-btn:hover {
          background: #2980b9;
          transform: translateY(-2px);
        }
        .secondary-btn {
          width: 100%;
          padding: 0.6rem;
          background: #444;
          color: white;
          border: 1px solid #555;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 0.5rem;
        }
        .secondary-btn:hover {
          background: #555;
        }
        .register-form input {
          width: 100%;
          padding: 0.6rem;
          border-radius: 6px;
          border: 1px solid #333;
          background: #1a1a1a;
          color: white;
          box-sizing: border-box;
        }
        .table-wrapper {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }
        .user-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .user-table th, .user-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .user-table th {
          background: rgba(255, 255, 255, 0.05);
          font-weight: 600;
        }
        .row-unsub {
          opacity: 0.5;
          text-decoration: line-through;
        }
        .step-badge {
          display: inline-block;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: bold;
          background: #444;
        }
        .step-0 { background: #555; }
        .step-1 { background: #27ae60; }
        .step-2 { background: #2980b9; }
        .step-3 { background: #8e44ad; }
        .step-4 { background: #f39c12; }

        .actions-cell {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .divider {
          color: #888;
          opacity: 0.5;
        }
        .text-btn {
          background: none;
          border: none;
          padding: 0;
          font-size: 0.85rem;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .reset-link { color: #64ffda; }
        .delete-link { color: #ff5252; }
        .text-btn:hover { opacity: 0.7; text-decoration: underline; }

        .toast {
          padding: 0.8rem 1.2rem;
          border-radius: 8px;
          font-size: 0.9rem;
        }
        .success { background: rgba(46, 204, 113, 0.2); border: 1px solid #2ecc71; color: #2ecc71; }
        .error { background: rgba(231, 76, 60, 0.2); border: 1px solid #e74c3c; color: #e74c3c; }

        .simulator-main {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 2rem;
        }
        .info-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          border-radius: 12px;
        }
        .schedule-list {
          list-style: none;
          padding: 0;
        }
        .schedule-list li {
          margin-bottom: 1rem;
          font-size: 0.9rem;
          line-height: 1.4;
          padding-left: 1rem;
          border-left: 2px solid #3498db;
        }
      `}</style>
    </div>
  );
}
