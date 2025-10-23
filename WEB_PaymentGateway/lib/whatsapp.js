const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendWhatsapp(toPhone, message) {
  // toPhone in format +62...
  return client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM, // e.g. 'whatsapp:+1415...'
    to: `whatsapp:${toPhone}`,
    body: message
  });
}

module.exports = { sendWhatsapp };
