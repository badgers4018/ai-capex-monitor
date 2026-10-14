import { config } from 'dotenv';
import { execFileSync } from 'node:child_process';
import { randomBytes, scryptSync } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
config({ path: '.local/env', quiet: true } as any);
const base = new URL(process.env.DATABASE_OWNER_URL!);
const db = 'dcpi_tests_' + randomBytes(4).toString('hex');
const dir = resolve('.local', 'tests', db);
mkdirSync(dir, { recursive: true, mode: 0o700 });
const password = 'Only-for-isolated-TEST-DB-123!';
const salt = randomBytes(16).toString('hex');
writeFileSync(
  resolve(dir, 'users.json'),
  JSON.stringify(
    ['admin', 'reviewer', 'viewer'].map((role) => ({
      username: 'TEST_' + role,
      role,
      salt,
      hash: scryptSync(password, salt, 64).toString('hex'),
    })),
  ),
  { mode: 0o600 },
);
const env = {
  ...process.env,
  LOCAL_STATE_DIR: dir,
  NODE_ENV: 'test',
  TEST_LOCAL_PASSWORD: password,
};
for (const kind of ['OWNER', 'READ', 'REVIEW', 'INGEST']) {
  const u = new URL(process.env[`DATABASE_${kind}_URL`]!);
  u.pathname = '/' + db;
  (env as any)[`DATABASE_${kind}_URL`] = u.toString();
}
execFileSync('sudo', ['-u', 'postgres', 'createdb', '-O', decodeURIComponent(base.username), db]);
try {
  execFileSync('pnpm', ['migrate'], { env, stdio: 'inherit' });
  execFileSync('pnpm', process.argv.includes('--e2e') ? ['test:e2e'] : ['test'], {
    env,
    stdio: 'inherit',
  });
} finally {
  execFileSync('sudo', ['-u', 'postgres', 'dropdb', '--force', db]);
}
