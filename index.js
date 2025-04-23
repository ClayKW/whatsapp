import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox']
  }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log('Scan QR code to login to WhatsApp');
});

client.on('ready', () => {
  console.log('Bot is ready!');
});

client.on('message', async msg => {
  if (!msg.fromMe && msg.body.length > 0) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(msg.body);
      const response = await result.response;
      await msg.reply(response.text());
    } catch (error) {
      console.error('Error from Gemini:', error);
      await msg.reply('Maaf, ada kesalahan saat memproses permintaan.');
    }
  }
});

client.initialize();
