import { Resend } from "resend";
import { NextResponse } from "next/server";
import MochiLetter from "../../../emails/MochiLetter";

/**
 * Vercel のエッジキャッシュによる静的化を防止。
 * API Route は常に動的に実行する必要がある。
 */
export const dynamic = "force-dynamic";

/**
 * Resend クライアントを遅延初期化する。
 * モジュールレベルで new Resend() を呼ぶと、ビルド時に
 * 環境変数が存在しないためクラッシュする（Vercel のビルドエラーの原因）。
 */
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY が設定されていません。Vercel の Environment Variables を確認してください。");
  }
  return new Resend(apiKey);
}

/**
 * GET: ヘルスチェック用。リダイレクト等でメソッドが化けた際の安全弁。
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "POST /api/subscribe でメールアドレスを送信してください。",
  });
}

/**
 * POST: メルマガ購読 & ウェルカムメール送信。
 *
 * kida@mochisura-lab.com から深海テーマのウェルカムメールを送信する。
 * Resend の Contacts API は使用せず、メール送信のみに特化。
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "有効なメールアドレスを入力してください。" },
        { status: 400 }
      );
    }

    const resend = getResendClient();

    // ウェルカムメールを送信（kida@mochisura-lab.com から）
    const { data, error } = await resend.emails.send({
      from: "きだ <kida@mochisura-lab.com>",
      to: email,
      subject: "きだからの手紙を受け取っていただき、ありがとうございます",
      react: MochiLetter({ authorName: "きだ" }),
    });

    if (error) {
      console.error("Resend API Error:", error);
      return NextResponse.json(
        { error: `Resend Error: ${JSON.stringify(error)}` },
        { status: 500 }
      );
    }

    console.log("✅ ウェルカムメール送信成功:", data);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    console.error("Subscription Error:", errorMsg);
    return NextResponse.json(
      { error: `System Error: ${errorMsg}` },
      { status: 500 }
    );
  }
}
