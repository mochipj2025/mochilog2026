const { Resend } = require('resend');
// ユーザーが新しく設定した Full Access キーを使用
const resend = new Resend('re_7W2nfMSK_MCefDeEtNZw3d5WURR9sWjE3');

async function check() {
  console.log('--- Resend Audience Investigation ---');
  try {
    const { data, error } = await resend.audiences.list();
    if (error) {
      console.error('❌ Error fetching audiences:', error);
      return;
    }
    
    // data が配列であることを期待
    const audiences = data.data || data; 

    if (!audiences || audiences.length === 0) {
      console.log('⚠️ No audiences found.');
    } else {
      console.log('✅ Found audiences:');
      audiences.forEach(a => {
        console.log(`- Name: ${a.name}, ID: ${a.id}`);
      });
    }
  } catch (e) {
    console.error('❌ System Error:', e.message);
  }
}

check();
