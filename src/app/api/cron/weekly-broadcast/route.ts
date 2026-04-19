import { Resend } from "resend";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { WeeklyLetter } from "@/emails/WeeklyLetter";

const resend = new Resend(process.env.RESEND_API_KEY);
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

export const dynamic = "force-dynamic";

/**
 * 毎週火曜日に実行される週刊メルマガ自動配信エンジン
 * content/newsletters フォルダから今日の日付で始まる原稿を探して配信する。
 */
export async function GET(request: Request) {
  // 1. セキュリティチェック (Vercel Cron Secret)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.NODE_ENV !== 'development') {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  if (!AUDIENCE_ID) {
    return NextResponse.json({ error: "AUDIENCE_ID is not set" }, { status: 500 });
  }

  try {
    const now = new Date();
    // 日本時間(JST)での日付を取得 (YYYY-MM-DD)
    const jstDate = new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Tokyo",
    }).format(now).replace(/\//g, "-");

    console.log(`--- Weekly Broadcast Engine: Searching for ${jstDate} ---`);

    // 2. 原稿の検索
    const newslettersDir = path.join(process.cwd(), "content", "newsletters");
    if (!fs.existsSync(newslettersDir)) {
      return NextResponse.json({ message: "Newsletters directory not found" }, { status: 200 });
    }

    const files = fs.readdirSync(newslettersDir);
    const targetFile = files.find(f => f.startsWith(jstDate) && f.endsWith(".md"));

    if (!targetFile) {
      console.log(`No newsletter found for today (${jstDate}). Skipping.`);
      return NextResponse.json({ message: `No newsletter found for ${jstDate}` }, { status: 200 });
    }

    // 3. 原稿のパース
    const fullPath = path.join(newslettersDir, targetFile);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data: frontmatter, content } = matter(fileContents);

    // MarkdownをHTMLに変換
    const processedContent = await remark().use(html).process(content);
    const bodyHtml = processedContent.toString();

    // 4. 購読者リストの全件取得 (Pagination 対応)
    console.log("Fetching all contacts from Resend Audience...");
    let allContacts: any[] = [];
    let hasMore = true;
    let lastId: string | undefined = undefined;

    while (hasMore) {
      const { data, error }: any = await resend.contacts.list({
        audienceId: AUDIENCE_ID,
        limit: 100,
        after: lastId
      });

      if (error) {
        throw new Error(`Failed to fetch contacts: ${JSON.stringify(error)}`);
      }

      if (data && data.data) {
        allContacts.push(...data.data);
        hasMore = data.has_more;
        if (hasMore && data.data.length > 0) {
          lastId = data.data[data.data.length - 1].id;
        }
      } else {
        hasMore = false;
      }
    }

    // 登録から7日以上経過、かつ購読解除していない人を抽出
    const eligibleSubscribers = allContacts.filter((c: any) => {
      if (c.unsubscribed || !c.email) return false;
      const createdAt = new Date(c.created_at);
      const diffTime = now.getTime() - createdAt.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 7;
    });

    if (eligibleSubscribers.length === 0) {
      return NextResponse.json({ message: "No eligible subscribers (7+ days) found." }, { status: 200 });
    }

    // 5. バッチ配信
    console.log(`Broadcasting to ${eligibleSubscribers.length} graduates.`);
    const results = [];
    const batchSize = 100;

    for (let i = 0; i < eligibleSubscribers.length; i += batchSize) {
      const batch = eligibleSubscribers.slice(i, i + batchSize);
      const emails = batch.map((c: any) => ({
        from: "Mochi-Sura | Kida <kida@mochisura-lab.com>",
        to: c.email,
        subject: frontmatter.subject || "きだからの手紙",
        react: WeeklyLetter({
          previewText: frontmatter.previewText || "",
          title: frontmatter.title || "きだからの手紙",
          htmlContent: bodyHtml,
        }),
      }));

      const { data, error } = await resend.batch.send(emails);
      results.push({ batch: Math.floor(i / batchSize) + 1, success: !error, error });
    }

    return NextResponse.json({
      success: true,
      file: targetFile,
      sentTo: eligibleSubscribers.length,
      results
    });

  } catch (error: any) {
    console.error("Weekly Broadcast Error:", error.message);

    // 管理者へアラートメールを送信
    await resend.emails.send({
      from: "Mochi-Sura | System <kida@mochisura-lab.com>",
      to: "kida@mochisura-lab.com",
      subject: "⚠️ 【CRITICAL】Weekly Broadcast Engine Error",
      html: `
        <h1>Weekly Broadcast Engine でエラーが発生しました</h1>
        <p><strong>時間:</strong> ${new Date().toISOString()}</p>
        <p><strong>エラー内容:</strong> ${error.message}</p>
        <p>至急、原稿ファイルや Vercel のログを確認してください。</p>
      `
    }).catch(e => console.error("Failed to send alert email:", e));

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
