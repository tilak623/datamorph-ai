import crypto from 'crypto';
import { cookies } from 'next/headers';
import { UserSession } from '@/types';
import { db } from './db';

const COOKIE_NAME = 'datamorph_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'datamorph_dev_default_secret_32bytes_min_key!';

// Encrypt payload using AES-256-CBC
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(SESSION_SECRET).digest();
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

// Decrypt payload
function decrypt(hash: string): string | null {
  try {
    const parts = hash.split(':');
    if (parts.length !== 2) return null;
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const key = crypto.createHash('sha256').update(SESSION_SECRET).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (!cookie?.value) return null;

    const decrypted = decrypt(cookie.value);
    if (!decrypted) return null;

    const sessionData = JSON.parse(decrypted) as UserSession;
    if (!sessionData?.id) return null;

    // Verify user exists in db
    const user = db.getUser(sessionData.id);
    return user || sessionData;
  } catch (err) {
    return null;
  }
}

export async function setSession(user: UserSession): Promise<void> {
  const cookieStore = cookies();
  const encrypted = encrypt(JSON.stringify(user));
  
  cookieStore.set(COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Demo user generator for instant zero-config testing
export function createDemoUser(): UserSession {
  const demoId = 'demo-user-id';
  let user = db.getUser(demoId);
  if (!user) {
    user = {
      id: demoId,
      githubId: 'demo-github-id',
      username: 'data-explorer',
      name: 'Editorial Explorer',
      email: 'demo@datamorph.ai',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
      isDemo: true,
    };
    db.upsertUser(user);
  }
  return user;
}
