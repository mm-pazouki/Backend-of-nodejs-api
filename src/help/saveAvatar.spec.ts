import axios from 'axios';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { saveAvatar } from './saveAvatar';

jest.mock('axios');
jest.mock('crypto');
jest.mock('fs');

describe('saveAvatar', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should download and save avatar successfully', async () => {
    const buffer = Buffer.from([1, 2, 3]);
    const url = 'https://example.com/avatar.jpg';
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: buffer });
    (crypto.randomBytes as jest.Mock).mockReturnValueOnce(buffer);
    jest.spyOn(process, 'cwd').mockReturnValue('/tmp');
    (fs.writeFileSync as jest.Mock).mockReturnValueOnce(null);

    const res = await saveAvatar(url);

    expect(res).toEqual(`${buffer.toString('hex')}.jpg`);
    expect(axios.get).toHaveBeenCalledWith(url, {
      responseType: 'arraybuffer',
    });
    expect(crypto.randomBytes).toHaveBeenCalledWith(16);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      '/tmp/src/avatars/010203.jpg',
      buffer,
    );
  });
});
