import { NextResponse } from "next/server";
import { resetUserProgress } from "@/lib/db";

/**
 * テスト用：特定のユーザーの進捗をリセットし、created_at を NOW() に戻す
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await resetUserProgress(email);

    return NextResponse.json({
      success: true,
      message: `Reset progress for ${email}`
    });

  } catch (error: any) {
    console.error("Reset API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
