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
    throw new Error("RESEND_API_KEY が設定されていません。Vercel の Environment Variables を確認してください。");
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
 * POST: メルマガ購読 & ウェルカムメール送信。
 * .tsx に変更し、JSX 構文でコンポーネントを渡すことでレンダリングの安定性を向上。
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

    // ウェルカムメールを送信
    const { data, error } = await resend.emails.send({
      from: "きだ <kida@mochisura-lab.com>",
      to: email,
      subject: "きだからの手紙を受け取っていただき、ありがとうございます",
      // NOTE: .tsx 拡張子にすることで、JSX 構文が正しく処理されるように修正
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
