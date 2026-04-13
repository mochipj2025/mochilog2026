const { Resend } = require('resend');
const resend = new Resend('re_7W2nfMSK_MCefDeEtNZw3d5WURR9sWjE3');

async function checkContacts() {
  const audienceId = '48a91255-2b1c-4134-8611-3ffd1a93b0ec';
  console.log('--- Investigating Contacts Structure ---');
  try {
    const { data, error } = await resend.contacts.list({ audienceId });
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log('Raw Data Type:', typeof data);
    console.log('Is Array?', Array.isArray(data));
    console.log('Full Data Structure:', JSON.stringify(data, null, 2));
    
    const activeSubscribers = (data?.data || (Array.isArray(data) ? data : [])).filter(
      (c) => !c.unsubscribed && c.email
    );
    
    console.log('Identified Active Subscribers Number:', activeSubscribers.length);
  } catch (e) {
    console.error('❌ System Error:', e.message);
  }
}

checkContacts();
