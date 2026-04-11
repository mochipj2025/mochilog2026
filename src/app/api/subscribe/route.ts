import { Resend } from "resend";
import { NextResponse } from "next/server";
import MochiLetter from "../../../emails/MochiLetter";

/**
 * Vercel のエッジキャッシュによる静的化を防止。
 * API Route は常に動的に実行する必要がある。
 */
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

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
 * 修正点:
 * - resend.contacts.create() を削除。API Key が "Sending access" のみのため
 *   Contacts 操作の権限がなく、かつ audienceId が空文字列だったため
 *   バリデーションエラーでクラッシュしていた。
 * - テスト段階では「メール送信のみ」に簡素化し、購読者リスト管理は
 *   Resend ダッシュボード側で行う。
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
        { error: "メールの送信に失敗しました。時間をおいて再度お試しください。" },
        { status: 500 }
      );
    }

    console.log("✅ ウェルカムメール送信成功:", data);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Subscription Error:", error);
    return NextResponse.json(
      { error: "登録に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }
}
