import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * データベース初期化エンドポイント
 * schema.sql の内容を本番DBに適用する。
 */
export async function POST(request: Request) {
  const steps: string[] = [];
  // Database connection check trigger (Redeploying with POSTGRES_URL)
  try {
    const { secret } = await request.json();
    const expectedSecret = process.env.BROADCAST_SECRET?.trim();

    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. users table
    steps.push("Creating users table");
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        current_step INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active'
      );
    `;

    // 2. delivery_logs table
    steps.push("Creating delivery_logs table");
    await sql`
      CREATE TABLE IF NOT EXISTS delivery_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        step INTEGER NOT NULL,
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL,
        error_message TEXT
      );
    `;

    // 3. indexes
    steps.push("Creating indexes");
    await sql`CREATE INDEX IF NOT EXISTS idx_users_status_step ON users(status, current_step);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`;

    return NextResponse.json({ 
      success: true, 
      message: "Database initialized successfully.",
      completedSteps: steps
    });

  } catch (error: any) {
    console.error("DB Init Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Unknown error",
      lastStep: steps[steps.length - 1],
      hint: "Make sure POSTGRES_URL is set in Vercel environment variables."
    }, { status: 500 });
  }
}
