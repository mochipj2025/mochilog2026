-- ステップメール配信システム用 DBスキーマ

-- 読者（購読者）テーブル
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  current_step INTEGER DEFAULT 0, -- 最後に正常送信されたステップ番号 (0: 登録直後, 1: Day 1 送信済...)
  status TEXT DEFAULT 'active'    -- 'active', 'unsubscribed'
);

-- ログテーブル (任意: 送信履歴を詳細に残したい場合)
CREATE TABLE IF NOT EXISTS delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  step INTEGER NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL,           -- 'success', 'error'
  error_message TEXT
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_users_status_step ON users(status, current_step);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
