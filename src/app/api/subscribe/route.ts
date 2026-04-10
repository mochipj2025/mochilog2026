import { Resend } from "resend";
import { NextResponse } from "next/server";
import MochiLetter from "../../../emails/MochiLetter";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "有効なメールアドレスを入力してください。" },
        { status: 400 }
      );
    }

    // 1. Resend の Audiences (購読者リスト) に追加
    await resend.contacts.create({
      email: email,
      unsubscribed: false,
      audienceId: "", // デフォルト、または後で設定
    });

    // 2. ウェルカムメールを送信
    await resend.emails.send({
      from: "きだ <kida@mochisura-lab.com>",
      to: email,
      subject: "きだからの手紙を受け取っていただき、ありがとうございます",
      react: MochiLetter({ authorName: "きだ" }),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Subscription Error:", error);
    return NextResponse.json(
      { error: "登録に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }
}
