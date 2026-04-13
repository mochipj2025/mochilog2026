import { Resend } from "resend";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = "force-dynamic";

/**
 * AIおよび管理者向けのシステム診断エンドポイント
 * システムの整合性と健康状態をチェックする。
 */
export async function GET(request: Request) {
  // セキュリティチェック (Cron Secret または Broadcast Secret のいずれかで許可)
  const authHeader = request.headers.get("authorization");
  const providedToken = authHeader?.replace("Bearer ", "").trim();
  const cronSecret = process.env.CRON_SECRET?.trim();
  const broadcastSecret = process.env.BROADCAST_SECRET?.trim();

  const isAuthorized = 
    (cronSecret && providedToken === cronSecret) || 
    (broadcastSecret && providedToken === broadcastSecret);

  if (!isAuthorized) {
    return new Response("Unauthorized", { status: 401 });
  }

  const reports: any[] = [];
  let overallStatus = "Healthy";

  try {
    // 1. 環境変数のチェック
    const requiredEnv = ["RESEND_API_KEY", "RESEND_AUDIENCE_ID", "BROADCAST_SECRET"];
    for (const env of requiredEnv) {
      if (!process.env[env]) {
        reports.push({ level: "Critical", component: "Environment", message: `${env} is not set.` });
        overallStatus = "Degraded";
      }
    }

    // 2. Resend API 疎通と Audience チェック
    if (process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID) {
      try {
        const { data, error } = await resend.audiences.get(process.env.RESEND_AUDIENCE_ID);
        if (error) {
          reports.push({ level: "Error", component: "Resend", message: `Audience check failed: ${error.message}` });
          overallStatus = "Degraded";
        } else {
          reports.push({ level: "Info", component: "Resend", message: `Connected to Audience: ${data?.name}` });
        }
      } catch (e) {
        reports.push({ level: "Error", component: "Resend", message: "Connection to Resend failed." });
        overallStatus = "Degraded";
      }
    }

    // 3. 原稿プール (Content) の整合性チェック
    const newslettersDir = path.join(process.cwd(), "content", "newsletters");
    if (fs.existsSync(newslettersDir)) {
      const files = fs.readdirSync(newslettersDir).filter(f => f.endsWith(".md"));
      reports.push({ level: "Info", component: "Pool", message: `${files.length} newsletters found in pool.` });
      
      for (const file of files) {
        try {
          const content = fs.readFileSync(path.join(newslettersDir, file), "utf8");
          const parsed = matter(content);
          if (!parsed.data.subject || !parsed.data.title) {
            reports.push({ level: "Warning", component: "Pool", message: `File ${file} is missing subject or title in frontmatter.` });
            if (overallStatus !== "Degraded") overallStatus = "Warning";
          }
        } catch (e) {
          reports.push({ level: "Error", component: "Pool", message: `Failed to parse ${file}.` });
          overallStatus = "Degraded";
        }
      }
    } else {
      reports.push({ level: "Warning", component: "Pool", message: "Newsletters directory not found." });
    }

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      reports,
      antigravity_hint: overallStatus === "Healthy" 
        ? "Systems are nominal. Ready for content industrialization."
        : "Action required to restore safe base stability."
    });

  } catch (error: any) {
    return NextResponse.json({
      status: "Error",
      message: error.message
    }, { status: 500 });
  }
}
