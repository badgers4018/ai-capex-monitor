import { config } from 'dotenv';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import pg from 'pg';
config({ path: '.local/env', quiet: true } as any);
export const stateDir = resolve(process.env.LOCAL_STATE_DIR || '.local');
export const locked = JSON.parse(readFileSync('config/sources.lock.json', 'utf8'));
export const pools = {
  read: new pg.Pool({
    connectionString: process.env.DATABASE_READ_URL,
    max: 5,
    options: '-c search_path=dc,public -c timezone=UTC',
  }),
  review: new pg.Pool({
    connectionString: process.env.DATABASE_REVIEW_URL,
    max: 3,
    options: '-c search_path=dc,public -c timezone=UTC',
  }),
  ingest: new pg.Pool({
    connectionString: process.env.DATABASE_INGEST_URL,
    max: 3,
    options: '-c search_path=dc,public -c timezone=UTC',
  }),
};
export type DB = pg.PoolClient;
export class ServiceError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function transaction<T>(
  pool: pg.Pool,
  fn: (db: DB) => Promise<T>,
  readOnly = false,
): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query(readOnly ? 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY' : 'BEGIN');
    const result = await fn(c);
    await c.query('COMMIT');
    return result;
  } catch (e) {
    await c.query('ROLLBACK');
    throw e;
  } finally {
    c.release();
  }
}
export function sha(text: string | Buffer) {
  return createHash('sha256').update(text).digest('hex');
}
export function archive(bytes: Buffer, extension = 'json') {
  const hash = sha(bytes);
  const dir = resolve(stateDir, 'raw');
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const file = resolve(dir, `${hash}.${extension}`);
  try {
    writeFileSync(file, bytes, { flag: 'wx', mode: 0o600 });
  } catch (e: any) {
    if (e.code !== 'EEXIST') throw e;
  }
  return { hash, uri: `raw/${hash}.${extension}` };
}
export async function closePools() {
  await Promise.all(Object.values(pools).map((p) => p.end()));
}
export function sourceConfig(key: string) {
  const s = locked.sources.find((x: any) => x.key === key);
  if (!s) throw new ServiceError(404, 'Unknown source');
  return s;
}
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function assertUuid(s: string) {
  if (!UUID.test(s)) throw new ServiceError(400, 'Invalid object ID');
  return s;
}
