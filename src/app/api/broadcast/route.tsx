import { Resend } from "resend";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

/**
 * /api/broadcast — メルマガ一斉配信エンドポイント
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

    // デバッグログ: 認証情報の不整合を特定
    console.log(`[Auth Debug] Provided: "${providedSecret}", Expected: "${expectedSecret}"`);

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
      total = activeSubscribers.length;
      
      activeSubscribers.forEach((c: any) => {
        const createdAt = new Date(c.created_at);
        const daysDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff >= 7) {
          eligible++;
        } else {
          educating++;
        }
      });
      
      return NextResponse.json({ success: true, total, eligible, educating });
    }

    // ── ダッシュボード情報取得 (dashboard) ──
    if (body.action === "dashboard") {
      const newslettersDir = path.join(process.cwd(), "content", "newsletters");
      const files = fs.existsSync(newslettersDir) ? fs.readdirSync(newslettersDir) : [];
      
      const now = new Date();
      const upcoming: any[] = [];
      const history: any[] = [];

      for (const file of files) {
        if (!file.endsWith(".md")) continue;
        const fullPath = path.join(newslettersDir, file);
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const { data: frontmatter } = matter(fileContents);
        
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
      console.log(`[Test Send] Attempting to send to ${testEmail}...`);
      const { data, error } = await resend.emails.send({
        from: "Mochi-Sura | Kida <kida@mochisura-lab.com>",
        to: testEmail,
        subject,
        html,
      });

      console.log(`[Test Send Result] Data: ${JSON.stringify(data)}, Error: ${JSON.stringify(error)}`);

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

    // ── 本番配信 ──
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!audienceId) {
      return NextResponse.json(
        { error: "RESEND_AUDIENCE_ID が設定されていません。" },
        { status: 500 }
      );
    }

    const { data: contacts, error: listError } = await resend.contacts.list({
      audienceId,
    });

    if (listError) {
      return NextResponse.json(
        { error: `購読者リストの取得に失敗: ${JSON.stringify(listError)}` },
        { status: 500 }
      );
    }

    const activeSubscribers = (contacts?.data || []).filter(
      (c: any) => !c.unsubscribed && c.email
    );

    if (activeSubscribers.length === 0) {
      return NextResponse.json(
        { error: "配信対象がいません。" },
        { status: 400 }
      );
    }

    const results: any[] = [];
    const batchSize = 50;

    for (let i = 0; i < activeSubscribers.length; i += batchSize) {
      const batch = activeSubscribers.slice(i, i + batchSize);
      const emails = batch.map((c: any) => ({
        from: "Mochi-Sura | Kida <kida@mochisura-lab.com>",
        to: c.email,
        subject,
        html,
      }));

      const { data: batchData, error: batchError } = await resend.batch.send(emails);

      if (batchError) {
        results.push({ batch: i / batchSize + 1, error: batchError });
      } else {
        results.push({ batch: i / batchSize + 1, sent: batch.length, data: batchData });
      }
    }

    return NextResponse.json({
      success: true,
      mode: "broadcast",
      totalSubscribers: activeSubscribers.length,
      results,
    });
  } catch (error: any) {
    console.error("Broadcast API Error:", error);
    return NextResponse.json(
      { error: `System Error: ${error?.message || String(error)}` },
      { status: 500 }
    );
  }
}
