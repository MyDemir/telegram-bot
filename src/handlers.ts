import * as TelegramBot from 'node-telegram-bot-api';
import { UserInfo } from './types';
import { loadUserInfo, saveUserInfo } from './utils';

export async function startHandler(bot: TelegramBot, msg: TelegramBot.Message): Promise<void> {
  await bot.sendMessage(msg.chat.id, "Merhaba! Bu bot, bir kanalda paylaşılan gönderileri diğer kanala bildirmek için tasarlandı. Kullanabileceğiniz komutlar:\n\n/set_channels @kaynakkanal @hedefkanal - Kaynak ve hedef kanalları ayarlayın.\n/add_twitter @kullaniciadi - Bir Twitter hesabı ekleyin.");
}

export async function setChannelsHandler(bot: TelegramBot, msg: TelegramBot.Message): Promise<void> {
  const args = msg.text?.split(' ').slice(1);
  if (args?.length !== 2) {
    await bot.sendMessage(msg.chat.id, "Lütfen iki kanal adı girin. Örnek: /set_channels @kaynakkanal @hedefkanal");
    return;
  }

  const [sourceChannel, targetChannel] = args;
  const sourceChat = await bot.getChat(sourceChannel);
  const targetChat = await bot.getChat(targetChannel);

  const userInfo = await loadUserInfo();
  const userId = msg.from!.id.toString();
  userInfo[userId] = {
    source_channel: sourceChat.id,
    target_channel: targetChat.id
  };
  await saveUserInfo(userInfo);

  await bot.sendMessage(msg.chat.id, `Kanallar ayarlandı!\nKaynak: ${sourceChannel} (${sourceChat.id})\nHedef: ${targetChannel} (${targetChat.id})`);
}

export async function addTwitterHandler(bot: TelegramBot, msg: TelegramBot.Message): Promise<void> {
  const args = msg.text?.split(' ').slice(1);
  if (args?.length !== 1) {
    await bot.sendMessage(msg.chat.id, "Lütfen bir Twitter kullanıcı adı girin. Örnek: /add_twitter @elonmusk");
    return;
  }

  const twitterUsername = args[0].replace('@', '');
  const userInfo = await loadUserInfo();
  if (twitterUsername in userInfo) {
    await bot.sendMessage(msg.chat.id, `${twitterUsername} zaten takip ediliyor.`);
  } else {
    userInfo[twitterUsername] = {
      last_tweet_id: null,
      chat_id: msg.chat.id,
      twitter_username: twitterUsername
    };
    await saveUserInfo(userInfo);
    await bot.sendMessage(msg.chat.id, `${twitterUsername} takip listesine eklendi.`);
  }
}

export async function forwardContentHandler(bot: TelegramBot, msg: TelegramBot.Message): Promise<void> {
  const userInfo = await loadUserInfo();
  const chatId = msg.chat.id;
  const userId = msg.from!.id;

  let sourceChannel: number | undefined;
  let targetChannel: number | undefined;
  for (const info of Object.values(userInfo)) {
    if ('source_channel' in info && info.source_channel === chatId) {
      sourceChannel = info.source_channel;
      targetChannel = info.target_channel;
      break;
    }
  }

  if (!sourceChannel || !targetChannel) return;

  const chatMember = await bot.getChatMember(sourceChannel, userId);
  const isAdmin = ['administrator', 'creator'].includes(chatMember.status);
  if (!isAdmin) return;

  const chat = await bot.getChat(chatId);
  const sourceChannelLink = chat.username ? `https://t.me/${chat.username}` : "Kanalı Görüntüle";
  const keyboard = [[{ text: "Kanala Git", url: sourceChannelLink }]];

  await bot.sendMessage(targetChannel, "🔔 Yeni içerik var! Kaynak kanala göz atın! 🔔", {
    reply_markup: { inline_keyboard: keyboard }
  });
}
