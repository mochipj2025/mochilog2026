import { sql } from "@vercel/postgres";

export interface User {
  id: string;
  email: string;
  created_at: string;
  current_step: number;
  status: 'active' | 'unsubscribed';
}

// ローカルテスト用のメモリエミュレータ（リロードで消えないようにグローバルに保持）
const globalForDb = global as unknown as { _mockUsers: User[] | undefined };
let mockUsers: User[] = globalForDb._mockUsers ?? [];
if (process.env.NODE_ENV !== "production") globalForDb._mockUsers = mockUsers;

const isDbConfigured = !!process.env.POSTGRES_URL;

/**
 * 読者を新規登録（既に存在すれば何もしない）
 */
export async function registerUser(email: string) {
  if (!isDbConfigured) {
    const existing = mockUsers.find(u => u.email === email);
    if (existing) return null;
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      created_at: new Date().toISOString(),
      current_step: 0,
      status: 'active'
    };
    mockUsers.push(newUser);
    return newUser;
  }
  try {
    const result = await sql`
      INSERT INTO users (email)
      VALUES (${email})
      ON CONFLICT (email) DO NOTHING
      RETURNING *
    `;
    return result.rows[0] as User || null;
  } catch (error) {
    console.error("registerUser Error:", error);
    throw error;
  }
}

/**
 * 送信待ちのユーザーを取得
 * ロジック: 
 * - status = 'active'
 * - 登録から一定時間経過している
 * - current_step が次のステップ未満
 */
export async function getPendingUsers(stepDay: number, stepIndex: number, limit: number = 100) {
  if (!isDbConfigured) {
    const now = new Date();
    return mockUsers
      .filter(u => {
        const createdAt = new Date(u.created_at);
        const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return u.status === 'active' && u.current_step < stepIndex && diffDays >= stepDay;
      })
      .slice(0, limit);
  }
  try {
    const result = await sql`
      SELECT * FROM users
      WHERE status = 'active'
      AND current_step < ${stepIndex}
      AND created_at <= NOW() - (INTERVAL '1 day' * ${stepDay})
      ORDER BY created_at ASC
      LIMIT ${limit}
    `;
    return result.rows as User[];
  } catch (error) {
    console.error("getPendingUsers Error:", error);
    throw error;
  }
}

/**
 * ユーザーの進捗を更新
 */
export async function updateUserStep(userId: string, nextStep: number) {
  if (!isDbConfigured) {
    const user = mockUsers.find(u => u.id === userId);
    if (user) user.current_step = nextStep;
    return;
  }
  try {
    await sql`
      UPDATE users
      SET current_step = ${nextStep}
      WHERE id = ${userId}
    `;
  } catch (error) {
    console.error("updateUserStep Error:", error);
    throw error;
  }
}

/**
 * 購読停止
 */
export async function unsubscribeUser(email: string) {
  if (!isDbConfigured) {
    const user = mockUsers.find(u => u.email === email);
    if (user) user.status = 'unsubscribed';
    return;
  }
  try {
    await sql`
      UPDATE users
      SET status = 'unsubscribed'
      WHERE email = ${email}
    `;
  } catch (error) {
    console.error("unsubscribeUser Error:", error);
    throw error;
  }
}

/**
 * 全アクティブユーザー取得（シミュレーター用）
 */
export async function getAllActiveUsers() {
  if (!isDbConfigured) {
    return [...mockUsers].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  try {
    const result = await sql`SELECT * FROM users ORDER BY created_at DESC`;
    return result.rows as User[];
  } catch (error) {
    console.error("getAllActiveUsers Error:", error);
    throw error;
  }
}

/**
 * 特定ユーザーのテスト用リセット（シミュレーター用）
 */
export async function resetUserProgress(email: string) {
  if (!isDbConfigured) {
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      user.current_step = 0;
      user.created_at = new Date().toISOString();
    }
    return;
  }
  try {
    await sql`
      UPDATE users
      SET current_step = 0, created_at = NOW()
      WHERE email = ${email}
    `;
  } catch (error) {
    console.error("resetUserProgress Error:", error);
    throw error;
  }
}

export async function deleteUser(email: string) {
  if (!isDbConfigured) {
    mockUsers = mockUsers.filter(u => u.email !== email);
    if (process.env.NODE_ENV !== "production") {
      const globalForDb = global as unknown as { _mockUsers: User[] | undefined };
      globalForDb._mockUsers = mockUsers;
    }
    return;
  }
  try {
    await sql`DELETE FROM users WHERE email = ${email}`;
  } catch (error) {
    console.error("deleteUser Error:", error);
    throw error;
  }
}
