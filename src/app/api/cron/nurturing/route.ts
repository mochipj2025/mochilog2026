import { Resend } from "resend";
import { NextResponse } from "next/server";
import { newsletterSteps } from "@/lib/newsletter-steps";
import { DigestLetter } from "@/emails/DigestLetter";
import { getPendingUsers, updateUserStep } from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = "force-dynamic";

const BATCH_LIMIT = 50; // タイムアウト回避のための1回あたりの最大処理人数

/**
 * Vercel Cron から呼び出されるステップメール配信エンジン (DB版)
 * 登録後の経過日数と DB の current_step を照らし合わせて配信を行う。
 */
export async function GET(request: Request) {
  // 1. セキュリティチェック (Vercel Cron Secret または Broadcast Secret)
  const authHeader = request.headers.get("authorization");
  const providedSecret = authHeader?.replace("Bearer ", "");
  const cronSecret = process.env.CRON_SECRET;
  const broadcastSecret = process.env.BROADCAST_SECRET;

  const isAuthenticated = 
    providedSecret === cronSecret || 
    providedSecret === broadcastSecret ||
    process.env.NODE_ENV === 'development';

  if (!isAuthenticated) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    console.log("--- Nurturing Engine DB-Drive: Start ---");
    const results = [];
    let processedCount = 0;

    // ステップごとに処理 (Day 1, 2, 3, 7)
    for (let i = 0; i < newsletterSteps.length; i++) {
      if (processedCount >= BATCH_LIMIT) break;

      const step = newsletterSteps[i];
      const stepIndex = i + 1; // 1通目, 2通目...

      // このステップに該当するユーザーを取得
      // 条件: status='active' AND current_step < stepIndex AND 経過日数 >= step.day
      const pendingUsers = await getPendingUsers(step.day, stepIndex, BATCH_LIMIT - processedCount);
      
      console.log(`Step ${stepIndex} (Day ${step.day}): found ${pendingUsers.length} pending users.`);

      for (const user of pendingUsers) {
        if (processedCount >= BATCH_LIMIT) break;

        console.log(`Sending Step ${stepIndex} to ${user.email}`);

        const { error } = await resend.emails.send({
          from: "Mochi-Sura | Kida <kida@mochisura-lab.com>",
          to: user.email,
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

        if (!error) {
          // 送信成功時のみ DB のステップを更新
          await updateUserStep(user.id, stepIndex);
          results.push({ email: user.email, step: stepIndex, success: true });
        } else {
          console.error(`Failed to send Step ${stepIndex} to ${user.email}:`, error);
          results.push({ email: user.email, step: stepIndex, success: false, error });
        }
        processedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      sentTotal: results.length,
      details: results,
    });

  } catch (error: any) {
    console.error("Nurturing Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
