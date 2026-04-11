import { Resend } from "resend";
import { NextResponse } from "next/server";

/**
 * /api/broadcast — メルマガ一斉配信エンドポイント
 *
 * POST: 指定された件名・本文を、Resend Audience の全購読者に配信する。
 * パスワード認証付き（BROADCAST_SECRET 環境変数で保護）。
 *
 * リクエストボディ:
 *   { secret, subject, html, testEmail? }
 *   - secret: BROADCAST_SECRET と一致する文字列
 *   - subject: メールの件名
 *   - html: メール本文（HTML）
 *   - testEmail: （任意）テスト送信先。指定時は1通だけ送る
 */
export const dynamic = "force-dynamic";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY が未設定です");
  return new Resend(apiKey);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret, subject, html, testEmail } = body;

    // ── 認証 ──
    const expectedSecret = process.env.BROADCAST_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json(
        { error: "認証に失敗しました。" },
        { status: 401 }
      );
    }

    if (!subject || !html) {
      return NextResponse.json(
        { error: "subject と html は必須です。" },
        { status: 400 }
      );
    }

    const resend = getResendClient();

    // ── テスト送信モード ──
    if (testEmail) {
      const { data, error } = await resend.emails.send({
        from: "きだ <kida@mochisura-lab.com>",
        to: testEmail,
        subject,
        html,
      });

      if (error) {
        return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        mode: "test",
        sentTo: testEmail,
        id: data?.id,
      });
    }

    // ── 本番配信：Resend Audience から購読者を取得 ──
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!audienceId) {
      return NextResponse.json(
        { error: "RESEND_AUDIENCE_ID が設定されていません。Vercel の環境変数を確認してください。" },
        { status: 500 }
      );
    }

    // Resend Contacts API で購読者リストを取得
    const { data: contacts, error: listError } = await resend.contacts.list({
      audienceId,
    });

    if (listError) {
      return NextResponse.json(
        { error: `購読者リストの取得に失敗: ${JSON.stringify(listError)}` },
        { status: 500 }
      );
    }

    // 購読解除済みを除外
    const activeSubscribers = (contacts?.data || []).filter(
      (c: any) => !c.unsubscribed && c.email
    );

    if (activeSubscribers.length === 0) {
      return NextResponse.json(
        { error: "配信対象の購読者がいません。" },
        { status: 400 }
      );
    }

    // ── Resend Batch Send（最大100件ずつ） ──
    const results: any[] = [];
    const batchSize = 50;

    for (let i = 0; i < activeSubscribers.length; i += batchSize) {
      const batch = activeSubscribers.slice(i, i + batchSize);
      const emails = batch.map((c: any) => ({
        from: "きだ <kida@mochisura-lab.com>",
        to: c.email,
        subject,
        html,
      }));

      const { data: batchData, error: batchError } =
        await resend.batch.send(emails);

      if (batchError) {
        console.error(`Batch ${i / batchSize + 1} error:`, batchError);
        results.push({ batch: i / batchSize + 1, error: batchError });
      } else {
        results.push({ batch: i / batchSize + 1, sent: batch.length, data: batchData });
      }
    }

    console.log(
      `✅ メルマガ配信完了: ${activeSubscribers.length}件 / 件名: ${subject}`
    );

    return NextResponse.json({
      success: true,
      mode: "broadcast",
      totalSubscribers: activeSubscribers.length,
      results,
    });
  } catch (error: any) {
    console.error("Broadcast Error:", error?.message || error);
    return NextResponse.json(
      { error: `System Error: ${error?.message || String(error)}` },
      { status: 500 }
    );
  }
}
