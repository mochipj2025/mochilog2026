import { NextResponse } from "next/server";
import { getAllActiveUsers } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * シミュレーター用：全ユーザーリストを取得
 */
export async function GET() {
  try {
    const users = await getAllActiveUsers();
    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
