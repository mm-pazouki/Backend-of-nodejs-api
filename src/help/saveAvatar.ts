import axios from 'axios';
import * as crypto from 'crypto';
import * as fs from 'fs';

export async function saveAvatar(url: string): Promise<string> {
  const req = await axios.get(url, { responseType: 'arraybuffer' });
  const avatarHash = `${crypto.randomBytes(16).toString('hex')}.jpg`;
  const avatarPath = `${process.cwd()}/src/avatars/${avatarHash}`;
  fs.writeFileSync(avatarPath, req.data);
  return avatarHash;
}
