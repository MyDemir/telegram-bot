import Twit from 'twit';
import { TWITTER_API_KEY, TWITTER_API_SECRET_KEY, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET } from '../config/config';
import { Tweet, UserInfo } from './types';

// CommonJS tarzı import
const TelegramBot = require('node-telegram-bot-api');
// Türleri açıkça import et
import TelegramBotTypes from 'node-telegram-bot-api';
import { loadUserInfo, saveUserInfo } from './utils';

const client = new Twit({
  consumer_key: TWITTER_API_KEY,
  consumer_secret: TWITTER_API_SECRET_KEY,
  access_token: TWITTER_ACCESS_TOKEN,
  access_token_secret: TWITTER_ACCESS_TOKEN_SECRET
});

export async function checkTwitter(bot: TelegramBotTypes): Promise<void> {
  const userInfo = await loadUserInfo();
  for (const [twitterUsername, data] of Object.entries(userInfo)) {
    if (!('last_tweet_id' in data)) continue;
    try {
      const params = { screen_name: twitterUsername, count: 1, tweet_mode: 'extended' };
      const response = await client.get('statuses/user_timeline', params);
      const tweets = response.data as Tweet[];
      if (tweets.length > 0) {
        const tweet = tweets[0];
        const lastTweetId = data.last_tweet_id;
        if (lastTweetId !== tweet.id_str) {
          await sendTweetNotification(bot, tweet, data.chat_id);
          data.last_tweet_id = tweet.id_str;
          await saveUserInfo(userInfo);
        }
      }
    } catch (error) {
      console.error(`Twitter kontrolünde hata (${twitterUsername}):`, error);
    }
  }
}

async function sendTweetNotification(bot: TelegramBotTypes, tweet: Tweet, chatId: number): Promise<void> {
  const tweetUrl = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
  const text = `Yeni tweet! 🐦\n\n${tweet.full_text}\n\n🔗 [Tweeti Görüntüle](${tweetUrl})`;
  await bot.sendMessage(chatId, text, { parse_mode: 'Markdown', disable_web_page_preview: true });
}
