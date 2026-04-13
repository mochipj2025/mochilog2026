import { Resend } from "resend";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

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
    const expectedSecret = process.env.BROADCAST_SECRET?.trim();
    const providedSecret = secret?.trim();

    if (!expectedSecret || providedSecret !== expectedSecret) {
      return NextResponse.json(
        { error: "認証に失敗しました。パスワードが一致しません。" },
        { status: 401 }
      );
    }

    const resend = getResendClient();

    // ── 統計取得 (stats) ──
    if (body.action === "stats") {
      const audienceId = process.env.RESEND_AUDIENCE_ID;
      if (!audienceId) {
        return NextResponse.json({ error: "RESEND_AUDIENCE_ID is not set" }, { status: 500 });
      }
      const { data: contacts, error: listError } = await resend.contacts.list({ audienceId });
      if (listError) {
        return NextResponse.json({ error: `リスト取得失敗: ${JSON.stringify(listError)}` }, { status: 500 });
      }
      const now = new Date();
      let total = 0;
      let eligible = 0;
      let educating = 0;

      const activeSubscribers = (contacts?.data || []).filter((c: any) => !c.unsubscribed && c.email);
      for (const c of activeSubscribers) {
        total++;
        const createdAt = new Date(c.created_at);
        const diffTime = now.getTime() - createdAt.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 7) {
          eligible++;
        } else {
          educating++;
        }
      }
      return NextResponse.json({ success: true, total, eligible, educating });
    }

    // ── ダッシュボード情報取得 (dashboard) ──
    if (body.action === "dashboard") {
      const newslettersDir = path.join(process.cwd(), "content", "newsletters");
      const files = fs.existsSync(newslettersDir) ? fs.readdirSync(newslettersDir) : [];
      
      const now = new Date();
      const upcoming: any[] = [];
      const history: any[] = [];

      // ファイルリストをパースして分類
      for (const file of files) {
        if (!file.endsWith(".md")) continue;
        const fullPath = path.join(newslettersDir, file);
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const { data: frontmatter } = matter(fileContents);
        
        // ファイル名から日付を抽出 (YYYY-MM-DD)
        const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
        const fileDateStr = dateMatch ? dateMatch[1] : "";
        const fileDate = fileDateStr ? new Date(fileDateStr) : new Date(0);

        const item = {
          file,
          subject: frontmatter.subject || "No Subject",
          date: fileDateStr,
          title: frontmatter.title || "No Title",
        };

        if (fileDateStr && fileDate >= new Date(now.setHours(0,0,0,0))) {
          upcoming.push(item);
        } else {
          history.push(item);
        }
      }

      // 日付順にソート (未来分は昇順、履歴分は降順)
      upcoming.sort((a, b) => a.date.localeCompare(b.date));
      history.sort((a, b) => b.date.localeCompare(a.date));

      return NextResponse.json({
        success: true,
        upcoming,
        history,
      });
    }

    // ── プレビュー取得 (preview) ──
    if (body.action === "preview" && body.file) {
      const newslettersDir = path.join(process.cwd(), "content", "newsletters");
      const fullPath = path.join(newslettersDir, body.file);
      if (!fs.existsSync(fullPath)) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data: frontmatter, content } = matter(fileContents);
      return NextResponse.json({
        success: true,
        frontmatter,
        content
      });
    }

    if (!subject || !html) {
      return NextResponse.json(
        { error: "subject と html は必須です。" },
        { status: 400 }
      );
    }

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

    // 購読解除済みを除外、かつ登録から7日以上経過したユーザーのみ抽出
    const now = new Date();
    const activeSubscribers = (contacts?.data || []).filter(
      (c: any) => {
        if (c.unsubscribed || !c.email) return false;
        const createdAt = new Date(c.created_at);
        const diffTime = now.getTime() - createdAt.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 7;
      }
    );

    if (activeSubscribers.length === 0) {
      return NextResponse.json(
        { error: "配信対象（登録から7日以上経過した購読者）がいません。" },
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
