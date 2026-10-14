import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { probeSource } from '../app/server/adapters.js';
import { ingestSource } from '../app/server/ingestion.js';
import { exportReports, weeklyAppendix } from '../app/server/reports.js';
import { cutoffs } from '../app/server/projections.js';
import { closePools, stateDir } from '../app/server/core.js';
const [command, key, ...args] = process.argv.slice(2);
try {
  if (command === 'probe')
    console.log(JSON.stringify(await probeSource(key || 'pwc_dc_inventory'), null, 2));
  else if (command === 'ingest')
    console.log(
      JSON.stringify(
        await ingestSource(key || 'pwc_dc_inventory', { baseline: args.includes('--baseline') }),
        null,
        2,
      ),
    );
  else if (command === 'export')
    console.log(JSON.stringify(await exportReports(cutoffs(key, args[0])), null, 2));
  else if (command === 'weekly') {
    const md = await weeklyAppendix(key || new Date().toISOString().slice(0, 10));
    const dir = resolve(stateDir, 'appendices');
    mkdirSync(dir, { recursive: true, mode: 0o700 });
    const file = resolve(dir, (key || 'current') + '.md');
    writeFileSync(file, md, { mode: 0o600 });
    console.log('Appendix:', file);
  } else if (command === 'schema-tests') {
    const db = 'dcpi_reference_test_' + randomBytes(4).toString('hex');
    execFileSync('sudo', ['-u', 'postgres', 'createdb', db]);
    try {
      for (const file of ['001_schema.sql', '002_tests.sql', '003_queries.sql']) {
        const out = execFileSync(
          'sudo',
          ['-u', 'postgres', 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-d', db],
          {
            input: readFileSync('docs/data-center-permit-intelligence/' + file),
            encoding: 'utf8',
            maxBuffer: 4 * 1024 * 1024,
          },
        );
        console.log(out);
      }
    } finally {
      execFileSync('sudo', ['-u', 'postgres', 'dropdb', db]);
    }
  } else
    throw new Error(
      'Use probe SOURCE | ingest SOURCE [--baseline] | export [VALID_DATE KNOWN_AT] | weekly YYYY-MM-DD | schema-tests',
    );
} catch (e: any) {
  console.error('Command failed:', e.message);
  process.exitCode = 1;
} finally {
  await closePools();
}
