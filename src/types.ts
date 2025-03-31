export interface UserInfo {
  [twitterUsername: string]: {
    last_tweet_id: string | null;
    chat_id: number;
    twitter_username: string;
  } | {
    source_channel?: number;
    target_channel?: number;
  };
}

export interface Tweet {
  id_str: string; // 'twit' tweet kimliklerini string olarak döner
  full_text: string;
  user: {
    screen_name: string;
  };
}
