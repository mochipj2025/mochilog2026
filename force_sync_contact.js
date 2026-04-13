const { Resend } = require('resend');
const resend = new Resend('re_7W2nfMSK_MCefDeEtNZw3d5WURR9sWjE3');

async function createInternal() {
  console.log('--- Forcing Contact Creation ---');
  try {
    const { data, error } = await resend.contacts.create({
      email: 'yasuto.88@gmail.com',
      firstName: 'Yasuto',
      unsubscribed: false,
      audienceId: '48a91255-2b1c-4134-8611-3ffd1a93b0ec'
    });
    
    if (error) {
      // すでに存在している場合は「正常」とみなします
      if (error.name === 'conflict' || error.message?.includes('already exists')) {
        console.log('ℹ️ Contact already exists, sync should be ready.');
      } else {
        console.error('❌ Error:', error);
        return;
      }
    } else {
      console.log('✅ Successfully created/synced contact:', data.id);
    }
    
    // 最後にリストを再確認
    const list = await resend.contacts.list({ audienceId: '48a91255-2b1c-4134-8611-3ffd1a93b0ec' });
    console.log(`Current active count in API: ${list.data?.data?.length || 0}`);
    
  } catch (e) {
    console.error('❌ System Error:', e.message);
  }
}

createInternal();
