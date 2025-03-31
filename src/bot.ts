import * as TelegramBot from 'node-telegram-bot-api';
import { TELEGRAM_BOT_TOKEN } from '../config/config';
import { checkTwitter } from './twitter';
import { startHandler, setChannelsHandler, addTwitterHandler, forwardContentHandler } from './handlers';

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => startHandler(bot, msg));
bot.onText(/\/set_channels/, (msg) => setChannelsHandler(bot, msg));
bot.onText(/\/add_twitter/, (msg) => addTwitterHandler(bot, msg));
bot.on('message', (msg) => {
  if (!msg.text?.startsWith('/')) forwardContentHandler(bot, msg);
});

// Twitter kontrolünü her 60 saniyede bir çalıştır
setInterval(() => checkTwitter(bot), 60 * 1000);

console.log('Bot çalışıyor...');
