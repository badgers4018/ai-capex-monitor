import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { stateDir, closePools, pools } from '../app/server/core.js';
const creds = readFileSync(resolve(stateDir, 'access.md'), 'utf8');
const password = /^admin: (.+)$/m.exec(creds)?.[1];
if (!password) throw new Error('Local admin credentials absent');
const base = 'http://127.0.0.1:3001';
try {
  const login = await fetch(base + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password }),
  });
  if (!login.ok) throw new Error('Local login failed');
  const user = await login.json();
  const cookie = login.headers.get('set-cookie')!.split(';')[0];
  const get = async (path: string) => {
    const r = await fetch(base + path, { headers: { Cookie: cookie } });
    if (!r.ok) throw new Error('Verification HTTP ' + r.status);
    return r.json();
  };
  const list = await get('/api/v1/projects?kind=data_center_campus&status=Planned&limit=1');
  if (!list.data.length) throw new Error('No planned source campus available');
  const record = await get('/api/v1/projects/' + list.data[0].id);
  const claim = record.claims.find(
    (x: any) =>
      x.predicate === 'status.entitlement' &&
      x.value_json?.raw === 'Planned' &&
      x.value_json?.code === 'proposed',
  );
  if (
    !claim ||
    !claim.evidence?.some((e: any) => e.quotation.includes('"ProjectStatus":"Planned"'))
  )
    throw new Error('Exact source quote/mapping did not verify; no review performed');
  if (!claim.selected) {
    const r = await fetch(base + '/api/v1/reviews/' + claim.id, {
      method: 'POST',
      headers: { Cookie: cookie, 'Content-Type': 'application/json', 'X-CSRF-Token': user.csrf },
      body: JSON.stringify({
        decision: 'accepted',
        rationale:
          'Local implementation verification: exact county ProjectStatus Planned supports reported proposed entitlement as observed today only; no construction start, owner, purpose or spent capital is inferred.',
      }),
    });
    if (!r.ok) throw new Error('Review verification failed');
  }
  const after = await get('/api/v1/projects/' + record.id);
  if (after.reviewed_facts['status.entitlement']?.value?.code !== 'proposed')
    throw new Error('Selected fact not returned by API');
  const counts = (
    await pools.read.query(
      "SELECT (SELECT count(*)::int FROM dc.project WHERE project_type='data_center_campus') AS source_campuses,(SELECT count(*)::int FROM dc.project WHERE project_type='unresolved_site') AS unresolved_containers,(SELECT count(*)::int FROM dc.building) AS buildings,(SELECT count(*)::int FROM dc.regulatory_case) AS cases,(SELECT count(*)::int FROM dc.change_event WHERE emit_alert) AS emitted_alerts",
    )
  ).rows[0];
  const evidence = {
    verified_at: new Date().toISOString(),
    record_id: record.id,
    assertion_id: claim.id,
    selected_value: 'proposed',
    basis: 'county-reported entitlement only, observed on verification day',
    source_hash: claim.evidence[0].hash,
    counts,
    ui_loopback: 'http://127.0.0.1:5173',
    production_deployed: false,
  };
  writeFileSync(
    resolve(stateDir, 'real-record-verification.json'),
    JSON.stringify(evidence, null, 2) + '\n',
    { mode: 0o600 },
  );
  console.log(JSON.stringify(evidence, null, 2));
} finally {
  await closePools();
}
