import { randomBytes, createHash, createHmac, scryptSync, timingSafeEqual, createCipheriv, createDecipheriv } from 'node:crypto';

export const randomToken = () => randomBytes(32).toString('base64url');
export const digest = value => createHash('sha256').update(value).digest('hex');
export const hashPassword = (password, salt = randomBytes(16).toString('hex')) => `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
export function verifyPassword(password, encoded) {
  const [salt, hash] = String(encoded || '').split(':');
  const candidate = scryptSync(password, salt || 'invalid-password-salt', 64);
  const expected = /^[a-f0-9]{128}$/i.test(hash || '') ? Buffer.from(hash, 'hex') : Buffer.alloc(64);
  return timingSafeEqual(candidate, expected) && Boolean(salt && hash);
}
export function createSecurity(env) {
  if (!/^[a-f0-9]{64}$/i.test(env.OPS_ENCRYPTION_KEY || '') || !/^[a-f0-9]{64}$/i.test(env.OPS_SESSION_SECRET || '')) {
    throw new Error('Operations requires independent 32-byte OPS_ENCRYPTION_KEY and OPS_SESSION_SECRET hex secrets.');
  }
  const key = Buffer.from(env.OPS_ENCRYPTION_KEY, 'hex');
  const pepper = env.OPS_SESSION_SECRET;
  return {
    tokenHash: value => createHmac('sha256', pepper).update(value).digest('hex'),
    encrypt(state) {
      const iv = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', key, iv);
      const encrypted = Buffer.concat([cipher.update(JSON.stringify(state), 'utf8'), cipher.final()]);
      return JSON.stringify({ v: 1, iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: encrypted.toString('base64') });
    },
    decrypt(encoded) {
      const data = JSON.parse(encoded);
      if (data.v !== 1) throw new Error('Unsupported operations storage format');
      const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(data.iv, 'base64'));
      decipher.setAuthTag(Buffer.from(data.tag, 'base64'));
      return JSON.parse(Buffer.concat([decipher.update(Buffer.from(data.data, 'base64')), decipher.final()]).toString('utf8'));
    }
  };
}
