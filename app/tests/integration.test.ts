import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';
import supertest from 'supertest';
import ExcelJS from 'exceljs';
import { pools, closePools, archive, transaction, sourceConfig, stateDir } from '../server/core.js';
import { ingestSource, registerSources } from '../server/ingestion.js';
import {
  projectDetail,
  projects,
  cutoffs,
  reviewClaim,
  reviewQueue,
} from '../server/projections.js';
import { exportReports, weeklyAppendix } from '../server/reports.js';
import { createApp } from '../server/api.js';
if (!/^\/dcpi_tests_[0-9a-f]+$/.test(new URL(process.env.DATABASE_OWNER_URL!).pathname))
  throw new Error('Integration tests require pnpm test:local isolated database');
const owner = new pg.Pool({
  connectionString: process.env.DATABASE_OWNER_URL,
  options: '-c search_path=dc,public -c timezone=UTC',
});
const source = sourceConfig('pwc_dc_inventory');
const campusID = '{11111111-1111-4111-8111-111111111111}',
  buildingID = '{22222222-2222-4222-8222-222222222222}';
let status = 'Planned',
  fail = false,
  omit = false;
function fixture(layer: any) {
  const feature =
    layer.scope === 'campuses'
      ? {
          attributes: {
            GlobalID: campusID,
            CampusName: 'TEST Evidence Campus',
            CaseNumber: 'TEST-PLAN-1',
            ProjectStatus: status,
            LastEditDate: null,
          },
        }
      : {
          attributes: {
            GlobalID: buildingID,
            BuildingName: 'TEST Building 1',
            BuildingStatus: 'Completed',
            GPIN: 'TEST-GPIN-1',
            PermitCase: 'TEST-BLD-1',
            PermitStatus: 'Finaled',
            PlanningCaseNumber: 'TEST-PLAN-1',
            Address: 'TEST address',
            YearBuilt: 2020,
            OCCDate: null,
            LastEditDate: null,
          },
        };
  const raw = archive(
    Buffer.from(JSON.stringify({ features: omit && layer.scope === 'buildings' ? [] : [feature] })),
  );
  return {
    scope: layer.scope,
    layerId: layer.id,
    metadata: {},
    metadataHash: raw.hash,
    schemaFingerprint: 'TEST-fixture-not-live',
    expected: omit && layer.scope === 'buildings' ? 0 : 1,
    features:
      omit && layer.scope === 'buildings'
        ? []
        : [
            {
              feature,
              archiveHash: raw.hash,
              archiveUri: raw.uri,
              locator: { json_pointer: '/features/0/attributes', fixture: true },
            },
          ],
  };
}
async function collector(layer: any) {
  if (fail) throw new Error('TEST simulated 403');
  return fixture(layer);
}
let projectId = '',
  firstAssertion = '';
beforeAll(async () => {
  await registerSources();
  await ingestSource('pwc_dc_inventory', { baseline: true, collector });
  projectId = (
    await owner.query("SELECT id FROM dc.tracked_object WHERE label='TEST Evidence Campus'")
  ).rows[0].id;
  firstAssertion = (
    await owner.query(
      "SELECT id FROM dc.assertion WHERE subject_id=$1 AND predicate='status.construction' ORDER BY first_recorded_at DESC LIMIT 1",
      [projectId],
    )
  ).rows[0].id;
});
afterAll(async () => {
  await closePools();
  await owner.end();
});
describe('ingestion/evidence integrity', () => {
  it('keeps campus/building/case grains distinct with exact explicit link', async () => {
    expect((await owner.query('SELECT count(*)::int n FROM dc.project')).rows[0].n).toBe(1);
    expect((await projectDetail(projectId, cutoffs())).buildings).toHaveLength(1);
    expect((await owner.query('SELECT count(*)::int n FROM dc.regulatory_case')).rows[0].n).toBe(2);
  });
  it('suppresses baseline alerts and does not auto-select claims', async () => {
    expect((await owner.query('SELECT count(*)::int n FROM dc.change_event')).rows[0].n).toBe(0);
    expect((await owner.query('SELECT count(*)::int n FROM dc.fact_selection')).rows[0].n).toBe(0);
  });
  it('archives exact source bytes using matching hashes', async () => {
    const r = (
      await owner.query('SELECT content_sha256,storage_uri FROM dc.source_record_version LIMIT 1')
    ).rows[0];
    const bytes = readFileSync(resolve(stateDir, r.storage_uri));
    const { createHash } = await import('node:crypto');
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(r.content_sha256);
  });
  it('replays identical source with zero duplicate objects/assertions/events', async () => {
    const before = (await owner.query('SELECT count(*)::int n FROM dc.assertion')).rows[0].n;
    const r = await ingestSource('pwc_dc_inventory', { collector });
    expect(r.results.every((x) => x.created === 0 && x.changed === 0)).toBe(true);
    expect((await owner.query('SELECT count(*)::int n FROM dc.assertion')).rows[0].n).toBe(before);
  });
  it('preserves A to B to A revisions', async () => {
    status = 'Under Construction';
    await ingestSource('pwc_dc_inventory', { collector });
    status = 'Planned';
    await ingestSource('pwc_dc_inventory', { collector });
    const rows = (
      await owner.query(
        "SELECT revision,content_sha256 FROM dc.source_record_version WHERE source_record_id=(SELECT id FROM dc.source_record WHERE native_key='10:11111111-1111-4111-8111-111111111111') ORDER BY revision",
      )
    ).rows;
    expect(rows).toHaveLength(3);
    expect(rows[0].content_sha256).toBe(rows[2].content_sha256);
  });
  it('does not advance checkpoints on collector failure', async () => {
    const before = (
      await owner.query('SELECT scope_key,revision FROM dc.feed_checkpoint ORDER BY scope_key')
    ).rows;
    fail = true;
    await expect(ingestSource('pwc_dc_inventory', { collector })).rejects.toThrow('simulated');
    fail = false;
    expect(
      (await owner.query('SELECT scope_key,revision FROM dc.feed_checkpoint ORDER BY scope_key'))
        .rows,
    ).toEqual(before);
  });
  it('records missing rows without canceling or deleting a building', async () => {
    omit = true;
    const r = await ingestSource('pwc_dc_inventory', { collector });
    omit = false;
    expect(r.results.find((x) => x.scope === 'buildings')?.missing).toBe(1);
    expect((await owner.query('SELECT count(*)::int n FROM dc.building')).rows[0].n).toBe(1);
    expect(
      (
        await owner.query(
          "SELECT count(*)::int n FROM dc.attribute_claim WHERE value_json->>'code'='canceled'",
        )
      ).rows[0].n,
    ).toBe(0);
  });
  it('rejects concurrent active leases', async () => {
    const feed = (await owner.query("SELECT id FROM dc.source_feed WHERE name='pwc_dc_inventory'"))
      .rows[0].id;
    await owner.query(
      "INSERT INTO dc.collector_lease VALUES($1,'all',$2,clock_timestamp()+interval '1 minute')",
      [feed, randomUUID()],
    );
    try {
      await expect(ingestSource('pwc_dc_inventory', { collector })).rejects.toThrow('leased');
    } finally {
      await owner.query('DELETE FROM dc.collector_lease WHERE feed_id=$1', [feed]);
    }
  });
  it('recovers an expired lease', async () => {
    const feed = (await owner.query("SELECT id FROM dc.source_feed WHERE name='pwc_dc_inventory'"))
      .rows[0].id;
    await owner.query(
      "INSERT INTO dc.collector_lease VALUES($1,'all',$2,clock_timestamp()-interval '1 minute')",
      [feed, randomUUID()],
    );
    const r = await ingestSource('pwc_dc_inventory', { collector });
    expect(r.results).toHaveLength(2);
  });
  it('does not infer capacity/capital/parents/AI or start from year built', async () => {
    expect((await owner.query('SELECT count(*)::int n FROM dc.metric_claim')).rows[0].n).toBe(0);
    expect((await owner.query('SELECT count(*)::int n FROM dc.capital_claim')).rows[0].n).toBe(0);
    expect(
      (
        await owner.query(
          "SELECT count(*)::int n FROM dc.assertion WHERE predicate IN('purpose','date.construction_start','entity.relationship')",
        )
      ).rows[0].n,
    ).toBe(0);
    expect(
      (
        await owner.query(
          "SELECT count(*)::int n FROM dc.assertion WHERE predicate='date.year_built'",
        )
      ).rows[0].n,
    ).toBe(1);
  });
  it('keeps blocked and unverified sources disabled', async () => {
    await expect(ingestSource('va_deq_issued_dc_air')).rejects.toThrow('blocked/unverified');
    await expect(ingestSource('loudoun_landmarc')).rejects.toThrow('blocked/unverified');
  });
});
describe('controlled review and temporal history', () => {
  it('accepts a cited county claim with server identity/time', async () => {
    const r = await reviewClaim(
      firstAssertion,
      'accepted',
      'TEST_reviewer',
      'County structured field supports this reported state only',
    );
    expect(r.selection_id).toBeTruthy();
    expect(
      (await projectDetail(projectId, cutoffs())).reviewed_facts['status.construction'].value.code,
    ).toBe('unknown');
  });
  it('rejects duplicate selection of an already selected claim', async () =>
    await expect(
      reviewClaim(
        firstAssertion,
        'accepted',
        'TEST_reviewer',
        'This is an attempted duplicate review',
      ),
    ).rejects.toThrow('conflicts'));
  it('rejects/retracts a selected assertion while preserving older knowledge', async () => {
    await new Promise((r) => setTimeout(r, 5));
    const known = new Date().toISOString();
    await new Promise((r) => setTimeout(r, 5));
    await reviewClaim(
      firstAssertion,
      'rejected',
      'TEST_reviewer',
      'Keep the old selection in history; require updated review',
    );
    expect(
      (await projectDetail(projectId, cutoffs())).reviewed_facts['status.construction'],
    ).toBeUndefined();
    expect(
      (await projectDetail(projectId, cutoffs(undefined, known))).reviewed_facts[
        'status.construction'
      ],
    ).toBeDefined();
  });
  it('returns unknown parent rather than inventing companies', async () =>
    expect((await projectDetail(projectId, cutoffs())).parent_resolution).toBe(
      'unknown_unless_evidenced',
    ));
  it('exposes exact citations and source record locators', async () => {
    const d = await projectDetail(projectId, cutoffs());
    expect(d.claims[0].evidence[0].locator.json_pointer).toContain('/features/0');
    expect(d.claims[0].evidence[0].hash).toHaveLength(64);
  });
  it('server-stamps a forged ingestion knowledge timestamp', async () => {
    const subject = projectId,
      assertion = randomUUID();
    await transaction(pools.ingest, async (db) => {
      await db.query('SET CONSTRAINTS ALL DEFERRED');
      await db.query(
        "INSERT INTO dc.assertion(id,subject_id,predicate,first_recorded_at,extraction_method,extractor_version,confidence,idempotency_key) VALUES($1,$2,'purpose','1900-01-01Z','source_field','TEST','unknown',$3)",
        [assertion, subject, assertion],
      );
      await db.query('INSERT INTO dc.attribute_claim VALUES($1,$2)', [
        assertion,
        JSON.stringify('TEST unknown purpose'),
      ]);
    });
    const a = (
      await owner.query('SELECT first_recorded_at FROM dc.assertion WHERE id=$1', [assertion])
    ).rows[0];
    expect(a.first_recorded_at.getUTCFullYear()).toBeGreaterThan(2020);
  });
  it('forbids direct runtime selection/ledger mutation', async () => {
    await expect(
      pools.ingest.query("UPDATE dc.assertion SET confidence='low' WHERE id=$1", [firstAssertion]),
    ).rejects.toMatchObject({ code: '42501' });
    await expect(
      pools.review.query('DELETE FROM dc.fact_selection WHERE assertion_id=$1', [firstAssertion]),
    ).rejects.toMatchObject({ code: '42501' });
  });
  it('bounds pagination and queries without SQL injection', async () => {
    const r = await projects({ q: "' OR 1=1 --" }, cutoffs());
    expect(r.total).toBe(0);
  });
});
describe('authenticated API and report integration', () => {
  const app = createApp();
  const agents = new Map<string, any>();
  const csrfTokens = new Map<string, string>();
  async function agent(role: string) {
    if (agents.has(role)) return agents.get(role);
    const a = supertest.agent(app);
    const r = await a
      .post('/auth/login')
      .set('Host', '127.0.0.1')
      .send({ username: 'TEST_' + role, password: process.env.TEST_LOCAL_PASSWORD });
    expect(r.status).toBe(200);
    agents.set(role, a);
    csrfTokens.set(role, r.body.csrf);
    return a;
  }
  it('requires authentication on data routes', async () =>
    expect((await supertest(app).get('/api/v1/projects').set('Host', '127.0.0.1')).status).toBe(
      401,
    ));
  it('rejects nonloopback hostnames', async () =>
    expect((await supertest(app).get('/health').set('Host', 'public.example')).status).toBe(403));
  it('viewer reads projects but cannot view review queue', async () => {
    const a = await agent('viewer');
    expect((await a.get('/api/v1/projects').set('Host', '127.0.0.1')).status).toBe(200);
    expect((await a.get('/api/v1/reviews').set('Host', '127.0.0.1')).status).toBe(403);
  });
  it('viewer cannot submit review even with valid CSRF', async () => {
    const a = await agent('viewer');
    expect(
      (
        await a
          .post('/api/v1/reviews/' + firstAssertion)
          .set('Host', '127.0.0.1')
          .set('X-CSRF-Token', csrfTokens.get('viewer'))
          .send({ decision: 'accepted', rationale: 'TEST attempted viewer write' })
      ).status,
    ).toBe(403);
  });
  it('requires a CSRF token for reviewer writes', async () => {
    const a = await agent('reviewer');
    expect(
      (
        await a
          .post('/api/v1/reviews/' + firstAssertion)
          .set('Host', '127.0.0.1')
          .send({ decision: 'accepted', rationale: 'TEST no csrf' })
      ).status,
    ).toBe(403);
  });
  it('rejects forged reviewer/timestamps in request bodies', async () => {
    const a = await agent('reviewer');
    expect(
      (
        await a
          .post('/api/v1/reviews/' + firstAssertion)
          .set('Host', '127.0.0.1')
          .set('X-CSRF-Token', csrfTokens.get('reviewer'))
          .send({
            decision: 'accepted',
            rationale: 'TEST forged knowledge',
            recorded_at: '1900-01-01',
            reviewer: 'someone_else',
          })
      ).status,
    ).toBe(400);
  });
  it('rejects untrusted request origins', async () => {
    const a = await agent('reviewer');
    expect(
      (
        await a
          .post('/api/v1/exports')
          .set('Host', '127.0.0.1')
          .set('Origin', 'https://evil.example')
          .set('X-CSRF-Token', csrfTokens.get('reviewer'))
          .send({})
      ).status,
    ).toBe(403);
  });
  it('validates malformed IDs and pagination', async () => {
    const a = await agent('viewer');
    expect((await a.get('/api/v1/projects/bad-id').set('Host', '127.0.0.1')).status).toBe(400);
    expect((await a.get('/api/v1/projects?limit=5000').set('Host', '127.0.0.1')).status).toBe(400);
  });
  it('reviewer cannot trigger ingestion', async () => {
    const a = await agent('reviewer');
    expect(
      (
        await a
          .post('/api/v1/sources/pwc_dc_inventory/ingest')
          .set('Host', '127.0.0.1')
          .set('X-CSRF-Token', csrfTokens.get('reviewer'))
          .send({})
      ).status,
    ).toBe(403);
  });
  it('admin cannot activate blocked sources', async () => {
    const a = await agent('admin');
    expect(
      (
        await a
          .post('/api/v1/sources/va_deq_issued_dc_air/ingest')
          .set('Host', '127.0.0.1')
          .set('X-CSRF-Token', csrfTokens.get('admin'))
          .send({})
      ).status,
    ).toBe(409);
  });
  it('saves an unreviewed parent citation without auto-selecting it', async () => {
    const a = await agent('reviewer');
    const r = await a
      .post('/api/v1/company-proposals')
      .set('Host', '127.0.0.1')
      .set('X-CSRF-Token', csrfTokens.get('reviewer'))
      .send({
        fact_kind: 'relationship',
        entity_name: 'TEST Site LLC',
        parent_name: 'TEST Parent Corp',
        relationship_kind: 'controls',
        source_url: 'https://example.invalid/TEST-disclosure',
        quotation: 'TEST fixture states explicit control of TEST Site LLC by TEST Parent Corp',
        valid_from: '2026-01-01',
      });
    expect(r.status).toBe(201);
    expect(r.body.state).toBe('needs_review');
    expect(
      (
        await owner.query('SELECT count(*)::int n FROM dc.fact_selection WHERE assertion_id=$1', [
          r.body.assertion_id,
        ])
      ).rows[0].n,
    ).toBe(0);
  });
  it('keeps original weekly tape unchanged and adds a separate appendix', async () => {
    const a = await agent('viewer');
    const r = await a.get('/api/v1/weekly/2026-10-11.md').set('Host', '127.0.0.1');
    expect(r.status).toBe(200);
    expect(r.body.content).toBe(readFileSync('weekly/2026-10-11.md', 'utf8'));
    expect(await weeklyAppendix('2026-10-11')).toContain(
      'Existing financial book and eight-line tape unchanged',
    );
  });
  it('generates XLSX/Markdown from a single matching snapshot', async () => {
    const r = await exportReports(cutoffs());
    const md = readFileSync(resolve(stateDir, 'exports', r.id, 'projects.md'), 'utf8');
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(resolve(stateDir, 'exports', r.id, 'projects.xlsx'));
    expect(wb.getWorksheet('Projects')!.rowCount - 1).toBe(r.row_count);
    expect(md).toContain('Project/container rows: ' + r.row_count);
    for (const row of (await projects({ limit: 50 }, cutoffs())).data) expect(md).toContain(row.id);
    expect(md).toContain('No combined capital total');
  });
  it('bounds evidence export paths against traversal', async () => {
    const a = await agent('viewer');
    expect(
      (await a.get('/api/v1/exports/not-a-uuid/markdown').set('Host', '127.0.0.1')).status,
    ).toBe(400);
  });
  it('invalidates sessions at logout', async () => {
    const a = await agent('viewer');
    expect(
      (
        await a
          .post('/auth/logout')
          .set('Host', '127.0.0.1')
          .set('X-CSRF-Token', csrfTokens.get('viewer'))
          .send({})
      ).status,
    ).toBe(204);
    expect((await a.get('/api/v1/projects').set('Host', '127.0.0.1')).status).toBe(401);
  });
});

describe('identity and company-control integration', () => {
  let relationshipAssertion = '',
    child = '',
    parent = '';
  it('confirms only source-backed identity and records an audit event', async () => {
    await pools.review.query('SELECT dc.confirm_candidate($1,$2,$3)', [
      projectId,
      'TEST_reviewer',
      'TEST verifies the explicit source identity only, not owner/status/capital',
    ]);
    expect(
      (await owner.query('SELECT identity_state FROM dc.tracked_object WHERE id=$1', [projectId]))
        .rows[0].identity_state,
    ).toBe('confirmed');
    expect(
      (
        await owner.query(
          "SELECT count(*)::int n FROM dc.change_event WHERE subject_id=$1 AND event_type='identity.confirmed'",
          [projectId],
        )
      ).rows[0].n,
    ).toBe(1);
  });
  it('rejects repeat identity confirmation', async () => {
    await expect(
      pools.review.query('SELECT dc.confirm_candidate($1,$2,$3)', [
        projectId,
        'TEST_reviewer',
        'TEST duplicate identity action',
      ]),
    ).rejects.toMatchObject({ code: '23514' });
  });
  it('proposes and reviews an explicit control path without treating name as identity', async () => {
    const payload = {
      fact_kind: 'relationship',
      entity_name: 'TEST Control Site',
      parent_name: 'TEST Control Parent',
      relationship_kind: 'controls',
      source_url: 'https://example.invalid/TEST-control',
      quotation: 'TEST-only disclosure explicitly establishes the parent control relationship',
      valid_from: new Date().toISOString().slice(0, 10),
    };
    relationshipAssertion = (
      await pools.review.query('SELECT dc.propose_company_fact($1,$2) AS id', [
        JSON.stringify(payload),
        'TEST_reviewer',
      ])
    ).rows[0].id;
    const row = (
      await owner.query(
        'SELECT child_entity_id,parent_entity_id FROM dc.company_relationship_claim WHERE assertion_id=$1',
        [relationshipAssertion],
      )
    ).rows[0];
    child = row.child_entity_id;
    parent = row.parent_entity_id;
    await reviewClaim(
      relationshipAssertion,
      'accepted',
      'TEST_reviewer',
      'TEST quotation explicitly states control; no percentage heuristic used',
    );
    expect(
      (
        await owner.query(
          'SELECT * FROM dc.control_paths($1,CURRENT_DATE,statement_timestamp(),32)',
          [child],
        )
      ).rows[0].ancestor_id,
    ).toBe(parent);
  });
  it('does not promote equity ownership to a control parent', async () => {
    const payload = {
      fact_kind: 'relationship',
      entity_name: 'TEST Minority Investee',
      parent_id: parent,
      relationship_kind: 'equity_owner',
      source_url: 'https://example.invalid/TEST-equity',
      quotation:
        'TEST-only disclosure reports equity ownership but makes no assertion about control',
      valid_from: new Date().toISOString().slice(0, 10),
    };
    const id = (
      await pools.review.query('SELECT dc.propose_company_fact($1,$2) AS id', [
        JSON.stringify(payload),
        'TEST_reviewer',
      ])
    ).rows[0].id;
    await reviewClaim(
      id,
      'accepted',
      'TEST_reviewer',
      'TEST evidence establishes equity ownership only, not control',
    );
    const entity = (
      await owner.query(
        'SELECT child_entity_id FROM dc.company_relationship_claim WHERE assertion_id=$1',
        [id],
      )
    ).rows[0].child_entity_id;
    expect(
      (
        await owner.query(
          'SELECT * FROM dc.control_paths($1,CURRENT_DATE,statement_timestamp(),32)',
          [entity],
        )
      ).rows,
    ).toHaveLength(0);
  });
  it('rejects overlapping control cycles at the controlled review boundary', async () => {
    const payload = {
      fact_kind: 'relationship',
      entity_id: parent,
      parent_id: child,
      relationship_kind: 'controls',
      source_url: 'https://example.invalid/TEST-cycle',
      quotation:
        'TEST-only deliberately contradictory cycle proposal must be rejected by temporal graph integrity',
      valid_from: new Date().toISOString().slice(0, 10),
    };
    const id = (
      await pools.review.query('SELECT dc.propose_company_fact($1,$2) AS id', [
        JSON.stringify(payload),
        'TEST_reviewer',
      ])
    ).rows[0].id;
    await expect(
      reviewClaim(id, 'accepted', 'TEST_reviewer', 'TEST attempted overlapping control cycle'),
    ).rejects.toThrow('conflicts');
  });
});
