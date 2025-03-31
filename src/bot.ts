import { TELEGRAM_BOT_TOKEN } from '../config/config';
import { checkTwitter } from './twitter';
import { startHandler, setChannelsHandler, addTwitterHandler, forwardContentHandler } from './handlers';

// CommonJS tarzı import
const TelegramBot = require('node-telegram-bot-api');
// Türleri açıkça import et
import TelegramBotTypes from 'node-telegram-bot-api';

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg: TelegramBotTypes.Message) => startHandler(bot, msg));
bot.onText(/\/set_channels/, (msg: TelegramBotTypes.Message) => setChannelsHandler(bot, msg));
bot.onText(/\/add_twitter/, (msg: TelegramBotTypes.Message) => addTwitterHandler(bot, msg));
bot.on('message', (msg: TelegramBotTypes.Message) => {
  if (!msg.text?.startsWith('/')) forwardContentHandler(bot, msg);
});

// Twitter kontrolünü her 60 saniyede bir çalıştır
setInterval(() => checkTwitter(bot), 60 * 1000);

console.log('Bot çalışıyor...');
