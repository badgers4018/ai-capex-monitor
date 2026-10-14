import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { config } from 'dotenv';
import pg from 'pg';
config({ path: '.local/env', quiet: true } as any);
const { Client } = pg;
if (!process.env.DATABASE_OWNER_URL) throw new Error('Run pnpm setup:local first.');
const c = new Client({ connectionString: process.env.DATABASE_OWNER_URL });
await c.connect();
try {
  await c.query('SELECT pg_advisory_lock(764391099)');
  await c.query(
    'CREATE TABLE IF NOT EXISTS public.dcpi_migration(version text PRIMARY KEY,sha256 text NOT NULL,applied_at timestamptz NOT NULL DEFAULT clock_timestamp())',
  );
  const files = [
    ['001_schema', 'docs/data-center-permit-intelligence/001_schema.sql'],
    ...readdirSync('migrations')
      .filter((x) => x.endsWith('.sql'))
      .sort()
      .map((x) => [x, 'migrations/' + x]),
  ];
  for (const [name, path] of files) {
    const text = readFileSync(path, 'utf8');
    const hash = createHash('sha256').update(text).digest('hex');
    const prior = await c.query('SELECT sha256 FROM public.dcpi_migration WHERE version=$1', [
      name,
    ]);
    if (prior.rows.length) {
      if (prior.rows[0].sha256 !== hash) throw new Error('Migration checksum mismatch: ' + name);
      continue;
    }
    if (name === '001_schema') {
      const existing = await c.query("SELECT to_regnamespace('dc') AS ns");
      if (existing.rows[0].ns)
        throw new Error('Existing dc schema has no baseline; refuse bootstrap.');
      await c.query(text);
      await c.query('INSERT INTO public.dcpi_migration VALUES($1,$2,clock_timestamp())', [
        name,
        hash,
      ]);
    } else {
      await c.query('BEGIN');
      try {
        await c.query(text);
        await c.query('INSERT INTO public.dcpi_migration VALUES($1,$2,clock_timestamp())', [
          name,
          hash,
        ]);
        await c.query('COMMIT');
      } catch (e) {
        await c.query('ROLLBACK');
        throw e;
      }
    }
    console.log('Applied', name);
  }
  const ident = (s: string) => '"' + s.replaceAll('"', '""') + '"';
  for (const kind of ['ingest', 'read', 'review']) {
    const u = new URL(process.env[`DATABASE_${kind.toUpperCase()}_URL`]!);
    const r = ident(decodeURIComponent(u.username));
    await c.query(
      `GRANT USAGE ON SCHEMA dc TO ${r}; GRANT SELECT ON ALL TABLES IN SCHEMA dc TO ${r}; GRANT EXECUTE ON FUNCTION dc.control_paths(uuid,date,timestamptz,integer) TO ${r};`,
    );
    if (kind === 'ingest') {
      const tables = [
        'jurisdiction',
        'jurisdiction_identifier',
        'authority',
        'authority_jurisdiction',
        'source_feed',
        'feed_coverage',
        'ingestion_run',
        'feed_checkpoint',
        'source_record',
        'source_record_version',
        'record_observation',
        'evidence',
        'tracked_object',
        'project',
        'building',
        'parcel',
        'project_jurisdiction',
        'project_parcel',
        'object_alias',
        'case_namespace',
        'regulatory_case',
        'case_identifier',
        'case_target',
        'source_object_link',
        'assertion',
        'assertion_evidence',
        'attribute_claim',
        'metric_claim',
        'review_issue',
        'source_mapping',
        'collector_lease',
        'export_run',
        'report_artifact',
      ];
      await c.query(
        `GRANT INSERT ON ${tables.map((t) => 'dc.' + t).join(',')} TO ${r}; GRANT UPDATE ON dc.ingestion_run,dc.feed_checkpoint,dc.source_mapping,dc.collector_lease,dc.source_feed TO ${r}; GRANT DELETE ON dc.collector_lease TO ${r};`,
      );
      await c.query(`GRANT UPDATE(id) ON dc.source_record TO ${r};`); // FOR UPDATE requires one UPDATE privilege; identity guard forbids changing id.
    }
    if (kind === 'review')
      await c.query(
        `GRANT EXECUTE ON FUNCTION dc.review_claim(uuid,text,text,text) TO ${r}; GRANT EXECUTE ON FUNCTION dc.propose_company_fact(jsonb,text) TO ${r}; GRANT EXECUTE ON FUNCTION dc.confirm_candidate(uuid,text,text) TO ${r};`,
      );
  }
  console.log('Migrations and scoped role grants verified.');
} finally {
  await c.query('SELECT pg_advisory_unlock(764391099)');
  await c.end();
}
