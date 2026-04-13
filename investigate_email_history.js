const { Resend } = require('resend');
const resend = new Resend('re_7W2nfMSK_MCefDeEtNZw3d5WURR9sWjE3');

async function listRecentEmails() {
  console.log('--- Investigating Sent Emails History ---');
  try {
    // Resend API does not have a public "list" for emails in the basic SDK sometimes,
    // but we check if it's available or if we can use another way.
    // In newer versions, sometimes it's under resend.emails.list()
    if (typeof resend.emails.list === 'function') {
      const { data, error } = await resend.emails.list();
      if (error) {
        console.error('❌ Error listing emails:', error);
        return;
      }
      console.log('Found Emails:', JSON.stringify(data, null, 2));
    } else {
      console.log('⚠️ resend.emails.list() is not available in this SDK version.');
      // Alternatively, check audiences/contacts to see if they are buried elsewhere
    }
  } catch (e) {
    console.error('❌ System Error:', e.message);
  }
}

listRecentEmails();
