import { Resend } from "resend";
import { NextResponse } from "next/server";
import { registerUser } from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

export const dynamic = "force-dynamic";

/**
 * Resend Audience から購読者リストを取得し、自前 DB に一括同期する
 */
export async function POST() {
  if (!AUDIENCE_ID) {
    return NextResponse.json({ error: "AUDIENCE_ID is not configured" }, { status: 500 });
  }

  try {
    console.log("--- Resend Sync: Starting Bulk Import ---");
    
    // 1. Resend から連絡先を取得
    // 注: 本格的な運用の場合はページネーションが必要だが、初期インポート用としてリストを取得
    const { data: contactsData, error: contactError } = await resend.contacts.list({
      audienceId: AUDIENCE_ID,
    });

    if (contactError) {
      throw new Error(`Resend API Error: ${JSON.stringify(contactError)}`);
    }

    const contacts = contactsData?.data || [];
    console.log(`Audience found: ${contacts.length} contacts.`);

    let importedCount = 0;
    let skippedCount = 0;

    // 2. データベースに UPSERT
    for (const contact of contacts) {
      if (contact.unsubscribed) {
        skippedCount++;
        continue;
      }

      const result = await registerUser(contact.email);
      if (result) {
        importedCount++;
      } else {
        skippedCount++; // 既に存在する場合など
      }
    }

    return NextResponse.json({
      success: true,
      totalFound: contacts.length,
      imported: importedCount,
      skipped: skippedCount,
      message: `Successfully synced ${importedCount} new contacts from Resend.`
    });

  } catch (error: any) {
    console.error("Resend Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
