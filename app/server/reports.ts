import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ExcelJS from 'exceljs';
import { pools, transaction, stateDir, sha, assertUuid, ServiceError } from './core.js';
import { projectSQL, type Cutoff } from './projections.js';
const escape = (v: any) =>
  String(v ?? 'Unknown')
    .replace(/[\r\n]+/g, ' ')
    .replaceAll('|', '\\|');
export async function exportReports(at: Cutoff) {
  const id = randomUUID();
  const snapshot = await transaction(
    pools.read,
    async (db) => {
      const ref = (await db.query('SELECT pg_current_snapshot()::text AS reference')).rows[0]
        .reference;
      const rows = (await db.query(projectSQL + ' ORDER BY o.label,p.id', [at.valid, at.known]))
        .rows;
      const coverage = (
        await db.query(
          'SELECT name,publisher,access_status,redistribution_policy FROM dc.source_feed ORDER BY name',
        )
      ).rows;
      const disclosed = (
        await db.query(
          'SELECT a.subject_id,c.basis,c.amount_low,c.amount_high,c.currency_code,c.geographic_scope,c.aggregation_state FROM dc.capital_claim c JOIN dc.assertion a ON a.id=c.assertion_id JOIN dc.fact_selection f ON f.assertion_id=a.id WHERE f.valid_during @> $1::date AND f.system_during @> $2::timestamptz',
          [at.valid, at.known],
        )
      ).rows;
      return { rows, coverage, disclosed, ref };
    },
    true,
  );
  const mapped = snapshot.rows.map((r: any) => ({
    id: r.id,
    name: r.label,
    kind: r.project_type,
    buildings: r.building_count,
    source_status: r.source_reported?.status || 'Unknown',
    reviewed_construction: r.reviewed_facts['status.construction']?.value?.code || 'Unknown',
    source_url: r.source_reported?.url || '',
    pending: r.pending_claims,
  }));
  const wb = new ExcelJS.Workbook();
  wb.creator = 'AI Capex Monitor';
  wb.created = new Date(at.known);
  const info = wb.addWorksheet('Methodology');
  info.addRows([
    ['Permit Intelligence — Local Registry'],
    ['Export ID', id],
    ['Effective cutoff', at.valid],
    ['Knowledge cutoff', at.known],
    ['Policy', 'manual-review-v1'],
    ['Snapshot', snapshot.ref],
    ['Rows', mapped.length],
    [
      'Basis',
      'Candidate campuses and unresolved site containers, separately identified. Source status is not reviewed status.',
    ],
    ['Coverage', 'County current inventory only; no national completeness.'],
    ['Capital', 'Disclosures remain separate; no combined sum.'],
    ['History', 'Fact cutoffs are bitemporal; structural membership uses this export snapshot.'],
    ['Runtime', 'Local verified ingestion only; not a scheduled production service.'],
  ]);
  info.getColumn(1).width = 24;
  info.getColumn(2).width = 100;
  const ws = wb.addWorksheet('Projects', { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = [
    { header: 'Project ID', key: 'id', width: 38 },
    { header: 'Project / container', key: 'name', width: 48 },
    { header: 'Grain', key: 'kind', width: 26 },
    { header: 'Buildings', key: 'buildings', width: 12 },
    { header: 'County-reported status', key: 'source_status', width: 28 },
    { header: 'Reviewed construction', key: 'reviewed_construction', width: 28 },
    { header: 'Source URL', key: 'source_url', width: 70 },
    { header: 'Pending claims', key: 'pending', width: 16 },
  ];
  ws.addRows(mapped);
  ws.autoFilter = { from: 'A1', to: 'H1' };
  const cap = wb.addWorksheet('Capital Disclosures');
  cap.columns = [
    'subject_id',
    'basis',
    'amount_low',
    'amount_high',
    'currency_code',
    'geographic_scope',
    'aggregation_state',
  ].map((key) => ({ header: key, key, width: 28 }));
  cap.addRows(snapshot.disclosed);
  if (!snapshot.disclosed.length)
    cap.addRow({ basis: 'No reviewed capital disclosures. No value inferred from permits.' });
  const src = wb.addWorksheet('Source Coverage');
  src.columns = ['name', 'publisher', 'access_status', 'redistribution_policy'].map((key) => ({
    header: key,
    key,
    width: 45,
  }));
  src.addRows(snapshot.coverage);
  for (const sheet of wb.worksheets) {
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF23352E' } };
    sheet.getRow(1).height = 26;
    sheet.eachRow((r, n) => {
      r.alignment = { vertical: 'top', wrapText: true };
      if (n > 1 && n % 2 === 0)
        r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F4F0' } };
    });
  }
  const table = [
    '| Project ID | Project / container | Grain | Buildings | County-reported status | Reviewed construction | Source URL | Pending claims |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...mapped.map(
      (r) =>
        '| ' +
        [
          r.id,
          r.name,
          r.kind,
          r.buildings,
          r.source_status,
          r.reviewed_construction,
          r.source_url,
          r.pending,
        ]
          .map(escape)
          .join(' | ') +
        ' |',
    ),
  ].join('\n');
  const capitalKeys = [
    'subject_id',
    'basis',
    'amount_low',
    'amount_high',
    'currency_code',
    'geographic_scope',
    'aggregation_state',
  ];
  const capitalTable = snapshot.disclosed.length
    ? [
        '| ' + capitalKeys.join(' | ') + ' |',
        '| ' + capitalKeys.map(() => '---').join(' | ') + ' |',
        ...snapshot.disclosed.map(
          (c: any) => '| ' + capitalKeys.map((k) => escape(c[k])).join(' | ') + ' |',
        ),
      ].join('\n')
    : 'No reviewed capital disclosures. No amounts inferred from permits.';
  const md = `# AI Capex Monitor — Permit Intelligence\n\nExport ID: ${id}  \nEffective cutoff: ${at.valid}  \nKnowledge cutoff: ${at.known}  \nPolicy: manual-review-v1  \nSnapshot: ${snapshot.ref}  \nProject/container rows: ${mapped.length}\n\n**Coverage:** county current inventory only, not national completeness. Candidate campuses and unresolved building containers remain distinct. Source-reported status is not reviewed status. No combined capital total. Structural membership belongs to this export snapshot. Local ingestion is not a production schedule.\n\n${table}\n\n## Sources\n\n${snapshot.coverage.map((s: any) => `- ${escape(s.name)}: ${escape(s.access_status)}; ${escape(s.redistribution_policy)}`).join('\n')}\n\n## Capital\n\n${capitalTable}\n\nDisclosures remain separate by basis and scope; no combined total.\n`;
  const dir = resolve(stateDir, 'exports', id);
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const bytes = Buffer.from(await wb.xlsx.writeBuffer());
  writeFileSync(resolve(dir, 'projects.xlsx'), bytes, { mode: 0o600 });
  writeFileSync(resolve(dir, 'projects.md'), md, { mode: 0o600 });
  const artifacts = [
    {
      kind: 'xlsx',
      file_name: 'projects.xlsx',
      content_sha256: sha(bytes),
      row_count: mapped.length,
    },
    {
      kind: 'markdown',
      file_name: 'projects.md',
      content_sha256: sha(md),
      row_count: mapped.length,
    },
  ];
  const manifest = {
    id,
    valid_as_of: at.valid,
    known_as_of: at.known,
    policy_version: 'manual-review-v1',
    database_snapshot_reference: snapshot.ref,
    row_count: mapped.length,
    artifacts,
    coverage: snapshot.coverage,
  };
  writeFileSync(resolve(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', {
    mode: 0o600,
  });
  await transaction(pools.ingest, async (db) => {
    await db.query(
      'INSERT INTO dc.export_run(id,valid_as_of,known_as_of,policy_version,database_snapshot_reference,artifact_manifest,coverage_manifest) VALUES($1,$2,$3,$4,$5,$6,$7)',
      [
        id,
        at.valid,
        at.known,
        'manual-review-v1',
        snapshot.ref,
        JSON.stringify(artifacts),
        JSON.stringify(snapshot.coverage),
      ],
    );
    for (const a of artifacts)
      await db.query(
        'INSERT INTO dc.report_artifact(export_id,kind,file_name,content_sha256,row_count) VALUES($1,$2,$3,$4,$5)',
        [id, a.kind, a.file_name, a.content_sha256, a.row_count],
      );
  });
  return {
    ...manifest,
    downloads: artifacts.map((a) => ({ kind: a.kind, url: `/api/v1/exports/${id}/${a.kind}` })),
  };
}
export function artifactFile(id: string, kind: string) {
  assertUuid(id);
  if (!['xlsx', 'markdown'].includes(kind)) throw new ServiceError(400, 'Unknown report format');
  return resolve(stateDir, 'exports', id, kind === 'xlsx' ? 'projects.xlsx' : 'projects.md');
}
export async function weeklyAppendix(weekEnd: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekEnd) || !Number.isFinite(Date.parse(weekEnd)))
    throw new ServiceError(400, 'Invalid week end');
  const until = new Date(weekEnd + 'T00:00:00Z');
  until.setUTCDate(until.getUTCDate() + 1);
  const from = new Date(until);
  from.setUTCDate(from.getUTCDate() - 7);
  const events = (
    await pools.read.query(
      `SELECT ce.event_type,ce.event_date,ce.observed_at,ce.details,o.label,sr.original_url FROM dc.change_event ce JOIN dc.tracked_object o ON o.id=ce.subject_id LEFT JOIN dc.evidence e ON e.id=ce.evidence_id LEFT JOIN dc.source_record_version v ON v.id=e.version_id LEFT JOIN dc.source_record sr ON sr.id=v.source_record_id WHERE ce.observed_at>=$1 AND ce.observed_at<$2 ORDER BY ce.observed_at`,
      [from.toISOString(), until.toISOString()],
    )
  ).rows;
  return `# Permit Intelligence Appendix — week ending ${weekEnd}\n\nAdditive research evidence only. Existing financial book and eight-line tape unchanged. Observed-week filter: ${from.toISOString()} to ${until.toISOString()} (exclusive). Local county coverage; DEQ/Loudoun pending; source failures are not cancellations. Notifications disabled.\n\n${events.length ? events.map((e) => `- **${escape(e.label)}** — ${escape(e.event_type)}; effective ${e.event_date?.toISOString?.().slice(0, 10) || escape(e.event_date)}; observed ${e.observed_at.toISOString()}; source ${escape(e.original_url)}`).join('\n') : 'No reviewed events in this observation week. Baseline ingestion does not emit new-project alerts.'}\n`;
}
export function weeklyTape(name: string) {
  if (!/^\d{4}-\d{2}-\d{2}\.md$/.test(name)) throw new ServiceError(400, 'Invalid report name');
  try {
    return readFileSync(resolve('weekly', name), 'utf8');
  } catch {
    throw new ServiceError(404, 'Weekly tape not found');
  }
}
