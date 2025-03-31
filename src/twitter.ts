import { TWITTER_API_KEY, TWITTER_API_SECRET_KEY, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET } from '../config/config';
import { Tweet, UserInfo } from './types';
import { TelegramBot } from 'node-telegram-bot-api';
import { loadUserInfo, saveUserInfo } from './utils';
import * as tweepy from 'tweepy';

const auth = new tweepy.OAuthHandler(TWITTER_API_KEY, TWITTER_API_SECRET_KEY);
auth.set_access_token(TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET);
const api = new tweepy.API(auth);

export async function checkTwitter(bot: TelegramBot): Promise<void> {
  const userInfo = await loadUserInfo();
  for (const [twitterUsername, data] of Object.entries(userInfo)) {
    if (!('last_tweet_id' in data)) continue;
    try {
      const tweets = api.user_timeline({ screen_name: twitterUsername, count: 1, tweet_mode: 'extended' });
      if (tweets.length > 0) {
        const tweet = tweets[0] as unknown as Tweet;
        const lastTweetId = data.last_tweet_id;
        if (lastTweetId !== tweet.id) {
          await sendTweetNotification(bot, tweet, data.chat_id);
          data.last_tweet_id = tweet.id;
          await saveUserInfo(userInfo);
        }
      }
    } catch (error) {
      console.error(`Twitter kontrolünde hata (${twitterUsername}):`, error);
    }
  }
}

async function sendTweetNotification(bot: TelegramBot, tweet: Tweet, chatId: number): Promise<void> {
  const tweetUrl = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id}`;
  const text = `Yeni tweet! 🐦\n\n${tweet.full_text}\n\n🔗 [Tweeti Görüntüle](${tweetUrl})`;
  await bot.sendMessage(chatId, text, { parse_mode: 'Markdown', disable_web_page_preview: true });
}
