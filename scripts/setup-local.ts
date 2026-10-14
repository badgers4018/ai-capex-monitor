import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { randomBytes, scryptSync } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const dir = resolve('.local');
mkdirSync(dir, { recursive: true, mode: 0o700 });
if (existsSync(resolve(dir, 'env'))) {
  console.log('Existing local config retained. Run pnpm migrate.');
  process.exit(0);
}
const suffix = randomBytes(4).toString('hex');
const db = `dcpi_${suffix}`;
const roles = ['owner', 'ingest', 'read', 'review'] as const;
const credentials = Object.fromEntries(
  roles.map((r) => [r, { name: `dcpi_${suffix}_${r}`, password: randomBytes(24).toString('hex') }]),
);
const sql = roles
  .map((r) => `CREATE ROLE ${credentials[r].name} LOGIN PASSWORD '${credentials[r].password}';`)
  .join('\n');
execFileSync('sudo', ['-u', 'postgres', 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-c', sql], {
  stdio: ['ignore', 'pipe', 'pipe'],
});
execFileSync('sudo', ['-u', 'postgres', 'createdb', '-O', credentials.owner.name, db], {
  stdio: ['ignore', 'pipe', 'pipe'],
});
const urls = roles.map(
  (r) =>
    `DATABASE_${r.toUpperCase()}_URL=postgresql://${credentials[r].name}:${credentials[r].password}@127.0.0.1:5432/${db}`,
);
writeFileSync(resolve(dir, 'env'), urls.join('\n') + '\nAPI_PORT=3001\nLOCAL_STATE_DIR=.local\n', {
  mode: 0o600,
});
const users = ['admin', 'reviewer', 'viewer'].map((username) => {
  const password = randomBytes(12).toString('base64url');
  const salt = randomBytes(16).toString('hex');
  return {
    username,
    role: username === 'reviewer' ? 'reviewer' : username,
    salt,
    hash: scryptSync(password, salt, 64).toString('hex'),
    password,
  };
});
writeFileSync(
  resolve(dir, 'users.json'),
  JSON.stringify(
    users.map(({ password, ...u }) => u),
    null,
    2,
  ),
  { mode: 0o600 },
);
writeFileSync(
  resolve(dir, 'access.md'),
  '# Private local access\n\nLoopback only. Do not commit this file.\n\n' +
    users.map((u) => `${u.username}: ${u.password}`).join('\n') +
    '\n',
  { mode: 0o600 },
);
console.log(
  'Created isolated local database and generated credentials in ignored .local/. No credentials printed. Run pnpm migrate.',
);
