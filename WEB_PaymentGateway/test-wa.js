// test-wa.js
import { sendWhatsapp } from './lib/whatsapp.js';

const nomor = '+6287776705742';
const pesan = 'Halo dari Natural Nosh Store 🐾! Tes kirim WA via Twilio API tanpa SDK.';

await sendWhatsapp(nomor, pesan);
