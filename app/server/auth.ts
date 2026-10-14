import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Request, Response, NextFunction } from 'express';
import { stateDir, ServiceError } from './core.js';
export type Role = 'viewer' | 'reviewer' | 'admin';
export type User = { username: string; role: Role; salt: string; hash: string };
export type Session = { username: string; role: Role; csrf: string; expires: number };
declare global {
  namespace Express {
    interface Request {
      localSession?: Session;
    }
  }
}
const sessions = new Map<string, Session>();
const attempts = new Map<string, { count: number; until: number }>();
const digest = (s: string) => createHash('sha256').update(s).digest('hex');
const dummySalt = '00000000000000000000000000000000';
const dummyHash = scryptSync('unconfigured-user', dummySalt, 64);
export function users(): User[] {
  return JSON.parse(readFileSync(resolve(stateDir, 'users.json'), 'utf8'));
}
export function loopbackHost(req: Request, res: Response, next: NextFunction) {
  if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.host || ''))
    return res.status(403).json({ error: 'Local loopback host only' });
  next();
}
export function login(req: Request, res: Response) {
  const { username, password } = req.body || {};
  const ip = req.ip || 'local';
  const now = Date.now();
  let rate = attempts.get(ip);
  if (!rate || rate.until < now) {
    rate = { count: 0, until: now + 60000 };
    attempts.set(ip, rate);
  }
  if (++rate.count > 10)
    throw new ServiceError(429, 'Too many login attempts; try again in a minute');
  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    username.length > 100 ||
    password.length > 200
  )
    throw new ServiceError(400, 'Username and password required');
  const user = users().find((u) => u.username === username);
  const candidate = scryptSync(password, user?.salt || dummySalt, 64);
  const expected = user ? Buffer.from(user.hash, 'hex') : dummyHash;
  if (!user || expected.length !== candidate.length || !timingSafeEqual(candidate, expected))
    throw new ServiceError(401, 'Invalid local credentials');
  if (!['viewer', 'reviewer', 'admin'].includes(user.role))
    throw new ServiceError(403, 'Unsupported role');
  if (sessions.size >= 1000)
    for (const [key, s] of sessions) if (s.expires < now) sessions.delete(key);
  const token = randomBytes(32).toString('hex');
  const session = {
    username: user.username,
    role: user.role,
    csrf: randomBytes(32).toString('hex'),
    expires: now + 4 * 60 * 60 * 1000,
  };
  sessions.set(digest(token), session);
  res.cookie('dcpi_session', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: false,
    path: '/',
    maxAge: 4 * 60 * 60 * 1000,
  });
  res.json({ username: session.username, role: session.role, csrf: session.csrf });
}
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.dcpi_session;
  const s = typeof token === 'string' ? sessions.get(digest(token)) : undefined;
  if (!s || s.expires < Date.now()) {
    if (s) sessions.delete(digest(token));
    return next(new ServiceError(401, 'Local sign-in required'));
  }
  req.localSession = s;
  next();
}
export function roleGuard(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) =>
    roles.includes(req.localSession!.role)
      ? next()
      : next(new ServiceError(403, 'Role cannot perform this action'));
}
const LOOPBACK_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1):\d{2,5}$/;
// Host-app integration: the cockpit's loopback origin may be added explicitly.
// Only loopback http origins are accepted; anything else fails closed at startup.
export function extraTrustedOrigins(raw = process.env.PERMIT_TRUSTED_ORIGINS || ''): string[] {
  const list = raw.split(',').map((v) => v.trim()).filter(Boolean);
  for (const o of list)
    if (!LOOPBACK_ORIGIN.test(o)) throw new Error('PERMIT_TRUSTED_ORIGINS accepts loopback http origins only');
  return list;
}
const EXTRA_ORIGINS = extraTrustedOrigins();
export function trustedOrigin(origin: string, extra: string[] = EXTRA_ORIGINS) {
  return /^http:\/\/(localhost|127\.0\.0\.1):(5173|3001)$/.test(origin) || extra.includes(origin);
}
export function csrf(req: Request, _res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  if (origin && !trustedOrigin(origin))
    return next(new ServiceError(403, 'Untrusted request origin'));
  const value = req.headers['x-csrf-token'];
  if (typeof value !== 'string' || value !== req.localSession?.csrf)
    return next(new ServiceError(403, 'CSRF token required'));
  next();
}
export function logout(req: Request, res: Response) {
  const token = req.cookies?.dcpi_session;
  if (typeof token === 'string') sessions.delete(digest(token));
  res.clearCookie('dcpi_session', { path: '/' });
  res.status(204).end();
}
