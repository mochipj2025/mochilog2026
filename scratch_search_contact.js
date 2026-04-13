const { Resend } = require('resend');
const resend = new Resend('re_7W2nfMSK_MCefDeEtNZw3d5WURR9sWjE3');

async function searchContact() {
  const audienceId = '48a91255-2b1c-4134-8611-3ffd1a93b0ec';
  // ユーザーが登録したと推測されるアドレス
  const email = 'yasuto.88@gmail.com'; 
  
  console.log(`--- Searching for ${email} in Audience ${audienceId} ---`);
  try {
    // 1. 全取得を再試行
    const listRes = await resend.contacts.list({ audienceId });
    console.log('Final List Data:', JSON.stringify(listRes.data, null, 2));

    // 2. 特別のメールアドレスで個別取得（もしAPIがあれば）
    // NOTE: SDK 6.x では get メソッドに email を指定できる場合があります
    const { data: contact, error } = await resend.contacts.get({ 
      audienceId,
      id: email // emailでも引ける場合がある
    });

    if (contact) {
      console.log('✅ Found contact by email:', JSON.stringify(contact, null, 2));
    } else {
      console.log('❌ Not found by email search.');
    }

  } catch (e) {
    console.error('❌ System Error:', e.message);
  }
}

searchContact();
