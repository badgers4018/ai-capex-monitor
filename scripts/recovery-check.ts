import { config } from 'dotenv';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';
config({ path: '.local/env', quiet: true } as any);
const u = new URL(process.env.DATABASE_OWNER_URL!);
const env = {
  ...process.env,
  PGHOST: u.hostname,
  PGPORT: u.port || '5432',
  PGUSER: decodeURIComponent(u.username),
  PGPASSWORD: decodeURIComponent(u.password),
  PGDATABASE: u.pathname.slice(1),
};
const dir = resolve('.local/backups');
mkdirSync(dir, { recursive: true, mode: 0o700 });
const file = resolve(dir, 'local-' + Date.now() + '.dump');
execFileSync('pg_dump', ['-Fc', '-f', file], { env });
const db = 'dcpi_restore_' + randomBytes(4).toString('hex');
execFileSync('sudo', ['-u', 'postgres', 'createdb', '-O', decodeURIComponent(u.username), db]);
const countSQL =
  'SELECT (SELECT count(*)::int FROM dc.project) AS projects,(SELECT count(*)::int FROM dc.building) AS buildings,(SELECT count(*)::int FROM dc.source_record_version) AS versions,(SELECT count(*)::int FROM dc.assertion) AS assertions';
try {
  execFileSync('pg_restore', ['--no-owner', '--no-acl', '--exit-on-error', '-d', db, file], {
    env: { ...env, PGDATABASE: db },
  });
  const before = new pg.Client({ connectionString: u.toString() });
  const restored = new URL(u);
  restored.pathname = '/' + db;
  const after = new pg.Client({ connectionString: restored.toString() });
  await before.connect();
  await after.connect();
  try {
    const b = (await before.query(countSQL)).rows[0],
      a = (await after.query(countSQL)).rows[0];
    if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error('Restore count mismatch');
    console.log(
      JSON.stringify(
        { backup: file, restore_verified: true, counts: a, production_backup_policy: false },
        null,
        2,
      ),
    );
  } finally {
    await before.end();
    await after.end();
  }
} finally {
  execFileSync('sudo', ['-u', 'postgres', 'dropdb', '--force', db]);
}
