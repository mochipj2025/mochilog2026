import { Resend } from "resend";
import { NextResponse } from "next/server";
import MochiLetter from "../../../emails/MochiLetter";

/**
 * Vercel のエッジキャッシュによる静的化を防止。
 */
export const dynamic = "force-dynamic";

/**
 * Resend クライアントを遅延初期化する。
 */
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY が設定されていません。Vercel の Environment Variables を確認してください。"
    );
  }
  return new Resend(apiKey);
}

/**
 * GET: ヘルスチェック用。
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "POST /api/subscribe でメールアドレスを送信してください。",
  });
}

/**
 * POST: メルマガ購読処理
 * 1. ウェルカムメールを送信
 * 2. Resend Audience に登録者を追加（購読者リスト管理）
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

    // ── 1. ウェルカムメールを送信 ──
    const { data, error } = await resend.emails.send({
      from: "きだ <kida@mochisura-lab.com>",
      to: email,
      subject: "きだからの手紙を受け取っていただき、ありがとうございます",
      react: <MochiLetter authorName="きだ" />,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return NextResponse.json(
        { error: `Resend Error: ${JSON.stringify(error)}` },
        { status: 500 }
      );
    }

    console.log("✅ ウェルカムメール送信成功:", data);

    // ── 2. Resend Audience に購読者を追加（リスト管理用） ──
    // RESEND_AUDIENCE_ID が未設定の場合はスキップ（グレースフル・フォールバック）
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (audienceId) {
      try {
        await resend.contacts.create({
          audienceId,
          email,
          unsubscribed: false,
        });
        console.log("✅ Audience に購読者追加:", email);
      } catch (contactErr: any) {
        // Audience 追加に失敗してもメール送信自体は成功しているため、
        // エラーをログに記録するだけで処理を止めない。
        console.warn(
          "⚠️ Audience 追加失敗（権限不足の可能性）:",
          contactErr?.message || contactErr
        );
      }
    }

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
