import * as fs from 'fs/promises';
import { UserInfo } from './types';

export async function loadUserInfo(): Promise<UserInfo> {
  try {
    const data = await fs.readFile('user_info.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

export async function saveUserInfo(userInfo: UserInfo): Promise<void> {
  await fs.writeFile('user_info.json', JSON.stringify(userInfo, null, 4));
}
