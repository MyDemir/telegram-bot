import * as dotenv from 'dotenv';

dotenv.config();

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
export const TWITTER_API_KEY = process.env.API_KEY!;
export const TWITTER_API_SECRET_KEY = process.env.API_SECRET_KEY!;
export const TWITTER_ACCESS_TOKEN = process.env.ACCESS_TOKEN!;
export const TWITTER_ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
