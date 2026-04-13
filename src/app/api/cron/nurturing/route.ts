import { Resend } from "resend";
import { NextResponse } from "next/server";
import { newsletterSteps } from "@/lib/newsletter-steps";
import { DigestLetter } from "@/emails/DigestLetter";

const resend = new Resend(process.env.RESEND_API_KEY);
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

export const dynamic = "force-dynamic";

/**
 * Vercel Cron から呼び出されるステップメール配信エンドポイント
 * 毎朝9:00 JST (UTC 0:00) または 夜21:00 JST (UTC 12:00) に実行される想定
 */
export async function GET(request: Request) {
  // 1. セキュリティチェック (Vercel Cron Secret)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!AUDIENCE_ID) {
    return NextResponse.json({ error: "AUDIENCE_ID not set" }, { status: 500 });
  }

  try {
    console.log("--- Nurturing Engine: Start Batch Processing ---");

    // 2. 購読者リストを全取得 (Resend Contacts API)
    const { data: contactsData, error: contactError } = await resend.contacts.list({
      audienceId: AUDIENCE_ID,
    });

    if (contactError) {
      throw new Error(`Failed to fetch contacts: ${JSON.stringify(contactError)}`);
    }

    const contacts = contactsData?.data || [];
    console.log(`Targeting ${contacts.length} contacts.`);

    const results = [];
    const now = new Date();

    // 3. 各購読者の経過日数を計算し、該当するステップがあれば送信
    for (const contact of contacts) {
      if (contact.unsubscribed) continue;

      const createdAt = new Date(contact.created_at);
      // 経過日数を計算 (ミリ秒 -> 日)
      const diffTime = now.getTime() - createdAt.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // 該当するステップを探す
      const step = newsletterSteps.find((s) => s.day === diffDays);

      if (step) {
        console.log(`Sending Day ${step.day} to ${contact.email} (Joined ${diffDays} days ago)`);
        
        const { data, error } = await resend.emails.send({
          from: "きだ <kida@mochisura-lab.com>",
          to: contact.email,
          subject: step.subject,
          react: DigestLetter({
            previewText: step.previewText,
            title: step.title,
            bodyContent: step.bodyContent,
            nerveContent: step.nerveContent,
            storyContent: step.storyContent,
            noteLink: step.noteLink,
          }),
        });

        results.push({
          email: contact.email,
          step: step.day,
          success: !error,
          error: error || null,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: contacts.length,
      sent: results.length,
      details: results,
    });

  } catch (error: any) {
    console.error("Nurturing Error:", error.message);
    
    // 管理者へアラートメールを送信
    await resend.emails.send({
      from: "System <kida@mochisura-lab.com>",
      to: "kida@mochisura-lab.com",
      subject: "⚠️ 【CRITICAL】M.O.C.H.I. LABO Nurturing Engine Error",
      html: `
        <h1>Nurturing Engine でエラーが発生しました</h1>
        <p><strong>時間:</strong> ${new Date().toISOString()}</p>
        <p><strong>エラー内容:</strong> ${error.message}</p>
        <p>至急、Vercel のログを確認してください。</p>
      `
    }).catch(e => console.error("Failed to send alert email:", e));

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
