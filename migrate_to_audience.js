const { Resend } = require('resend');
const resend = new Resend('re_7W2nfMSK_MCefDeEtNZw3d5WURR9sWjE3');

async function migrate() {
  const audienceId = '48a91255-2b1c-4134-8611-3ffd1a93b0ec';
  console.log('--- Resend Audience Migration Started ---');
  
  try {
    // 1. 送信履歴からメールアドレスを取得
    const { data: emailList, error: fetchError } = await resend.emails.list();
    if (fetchError) {
      console.error('❌ Error fetching email history:', fetchError);
      return;
    }

    // 重複を排除し、有効なメールアドレスのみ抽出
    const emails = [...new Set(emailList.data.flatMap(e => e.to))];
    console.log(`🔍 Found ${emails.length} unique recipients in history.`);

    // 2. 各アドレスを Audience に追加
    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (const email of emails) {
      try {
        const { error } = await resend.contacts.create({
          audienceId,
          email,
          unsubscribed: false
        });

        if (error) {
          if (error.name === 'conflict' || error.message?.includes('already exists')) {
            console.log(`- ${email}: Already in audience (Skipped)`);
            skipCount++;
          } else {
            console.error(`- ${email}: Failed to add - ${error.message}`);
            failCount++;
          }
        } else {
          console.log(`- ${email}: ✅ Added successfully`);
          successCount++;
        }
      } catch (e) {
        console.error(`- ${email}: System Error - ${e.message}`);
        failCount++;
      }
    }

    // 3. 結果表示
    console.log('\n--- Migration Result ---');
    console.log(`✅ Newly Added: ${successCount}`);
    console.log(`ℹ️ Already Exists: ${skipCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📍 Target Audience: General (${audienceId})`);

  } catch (e) {
    console.error('❌ Global Migration Error:', e.message);
  }
}

migrate();
