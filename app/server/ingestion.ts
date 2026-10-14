import { randomUUID } from 'node:crypto';
import { collectLayer, normalizedKey, statusClaims, type LayerSnapshot } from './adapters.js';
import { pools, transaction, sourceConfig, sha, ServiceError, type DB } from './core.js';
const FIPS = '51153';
export async function ensureFeed(db: DB, key: string) {
  const source = sourceConfig(key);
  let row = (await db.query('SELECT * FROM dc.source_feed WHERE name=$1', [key])).rows[0];
  if (!row && key !== 'pwc_dc_inventory')
    return (
      await db.query(
        'INSERT INTO dc.source_feed(name,publisher,feed_type,endpoint_url,access_status,redistribution_policy) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
        [
          key,
          source.publisher,
          key === 'loudoun_landmarc' ? 'browser_portal' : 'document_index',
          source.canonical_url,
          source.access_status,
          source.redistribution_policy,
        ],
      )
    ).rows[0];
  if (!row) {
    let j = (
      await db.query(
        'SELECT jurisdiction_id AS id FROM dc.jurisdiction_identifier WHERE scheme=$1 AND value=$2',
        ['us_census_county_fips', FIPS],
      )
    ).rows[0];
    if (!j) {
      j = (
        await db.query(
          "INSERT INTO dc.jurisdiction(name,jurisdiction_type,timezone) VALUES('Prince William County, Virginia','county','America/New_York') RETURNING id",
        )
      ).rows[0];
      await db.query('INSERT INTO dc.jurisdiction_identifier VALUES($1,$2,$3)', [
        j.id,
        'us_census_county_fips',
        FIPS,
      ]);
    }
    const a = (
      await db.query(
        "INSERT INTO dc.authority(name,authority_type,homepage_url) VALUES($1,'building',$2) RETURNING id",
        [source.authority || source.publisher, source.canonical_url],
      )
    ).rows[0];
    await db.query('INSERT INTO dc.authority_jurisdiction VALUES($1,$2)', [a.id, j.id]);
    row = (
      await db.query(
        "INSERT INTO dc.source_feed(name,publisher,authority_id,feed_type,endpoint_url,access_status,redistribution_policy,adapter_version,expected_refresh) VALUES($1,$2,$3,$4,$5,$6,$7,$8,interval '1 day') RETURNING *",
        [
          key,
          source.publisher,
          a.id,
          key === 'pwc_dc_inventory' ? 'gis' : 'document_index',
          source.service_url || source.canonical_url,
          source.access_status,
          source.redistribution_policy,
          source.adapter_version || null,
        ],
      )
    ).rows[0];
    await db.query(
      "INSERT INTO dc.feed_coverage(feed_id,jurisdiction_id,record_family,completeness,notes) VALUES($1,$2,$3,'partial','Current inventory snapshot only; no historical knowledge or national completeness')",
      [row.id, j.id, key === 'pwc_dc_inventory' ? 'campus_and_building_inventory' : 'pending'],
    );
  }
  return row;
}
export async function registerSources() {
  await transaction(pools.ingest, async (db) => {
    await db.query('SELECT pg_advisory_xact_lock(764391081)');
    for (const key of ['pwc_dc_inventory', 'va_deq_issued_dc_air', 'loudoun_landmarc'])
      await ensureFeed(db, key);
  });
}
export async function createObject(db: DB, kind: string, label: string, projectId?: string) {
  const o = (
    await db.query('INSERT INTO dc.tracked_object(kind,label) VALUES($1,$2) RETURNING id', [
      kind,
      label,
    ])
  ).rows[0];
  if (kind === 'project')
    await db.query('INSERT INTO dc.project(id,project_type) VALUES($1,$2)', [
      o.id,
      projectId ? 'unresolved_site' : 'data_center_campus',
    ]);
  else if (kind === 'building')
    await db.query(
      'INSERT INTO dc.building(id,project_id,internal_building_key) VALUES($1,$2,$3)',
      [o.id, projectId!, o.id],
    );
  return o.id as string;
}
export async function addAttribute(
  db: DB,
  subject: string,
  predicate: string,
  value: any,
  evidence: string,
  key: string,
  method = 'source_field',
  valid?: string,
) {
  const prior = (await db.query('SELECT id FROM dc.assertion WHERE idempotency_key=$1', [key]))
    .rows[0];
  if (prior) return prior.id;
  const a = (
    await db.query(
      'INSERT INTO dc.assertion(subject_id,predicate,valid_during,extraction_method,extractor_version,confidence,idempotency_key) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      [subject, predicate, valid || null, method, 'pwc-arcgis-v1', 'high', key],
    )
  ).rows[0];
  await db.query('INSERT INTO dc.attribute_claim VALUES($1,$2)', [a.id, JSON.stringify(value)]);
  await db.query('INSERT INTO dc.assertion_evidence(assertion_id,evidence_id) VALUES($1,$2)', [
    a.id,
    evidence,
  ]);
  return a.id as string;
}
async function normalize(
  db: DB,
  feed: any,
  snap: LayerSnapshot,
  item: LayerSnapshot['features'][number],
  record: any,
  ev: string,
  versionId: string,
) {
  const a = item.feature.attributes;
  const kind = snap.scope === 'campuses' ? 'project' : 'building';
  const label = kind === 'project' ? a.CampusName : a.BuildingName;
  let mapping = (
    await db.query('SELECT * FROM dc.source_mapping WHERE source_record_id=$1', [record.id])
  ).rows[0];
  if (!mapping) {
    let project: string | undefined;
    if (kind === 'building' && a.PlanningCaseNumber) {
      const matches = (
        await db.query(
          "SELECT DISTINCT m.object_id FROM dc.source_mapping m JOIN dc.source_record sr ON sr.id=m.source_record_id JOIN LATERAL (SELECT payload FROM dc.source_record_version WHERE source_record_id=sr.id ORDER BY revision DESC LIMIT 1) v ON true WHERE sr.feed_id=$1 AND sr.record_kind='project' AND v.payload->'attributes'->>'CaseNumber'=$2",
          [feed.id, a.PlanningCaseNumber],
        )
      ).rows;
      if (matches.length === 1) project = matches[0].object_id;
    }
    if (kind === 'building' && !project) {
      project = await createObject(db, 'project', 'Unresolved campus · ' + label, 'unresolved');
      await db.query(
        "INSERT INTO dc.review_issue(subject_id,source_record_id,issue_kind,details) VALUES($1,$2,'campus_link_unknown',$3)",
        [
          project,
          record.id,
          JSON.stringify({
            reason: 'No unique explicit planning-case link',
            building_global_id: a.GlobalID,
          }),
        ],
      );
    }
    const object = await createObject(db, kind, label, project);
    const j = (
      await db.query(
        'SELECT jurisdiction_id FROM dc.jurisdiction_identifier WHERE scheme=$1 AND value=$2',
        ['us_census_county_fips', FIPS],
      )
    ).rows[0];
    if (kind === 'project')
      await db.query("INSERT INTO dc.project_jurisdiction VALUES($1,$2,'physical_location')", [
        object,
        j.jurisdiction_id,
      ]);
    else if (project)
      await db.query(
        "INSERT INTO dc.project_jurisdiction VALUES($1,$2,'physical_location') ON CONFLICT DO NOTHING",
        [project, j.jurisdiction_id],
      );
    if (kind === 'building' && item.feature.geometry) {
      const g = item.feature.geometry;
      if (
        Number.isFinite(g.x) &&
        Number.isFinite(g.y) &&
        g.x >= -180 &&
        g.x <= 180 &&
        g.y >= -90 &&
        g.y <= 90
      )
        await addAttribute(
          db,
          object,
          'location.address',
          { address: a.Address, longitude: g.x, latitude: g.y, precision: 'source_building_point' },
          ev,
          `loc:${versionId}:${object}`,
        );
    }
    await db.query(
      "INSERT INTO dc.source_object_link(source_record_id,object_id,link_role,method,evidence_id) VALUES($1,$2,'canonical_record','exact-layer-globalid',$3)",
      [record.id, object, ev],
    );
    if (kind === 'building' && a.GPIN) {
      let parcel = (
        await db.query(
          "SELECT id FROM dc.parcel WHERE jurisdiction_id=$1 AND registry_namespace='pwc_gpin' AND native_parcel_key=$2",
          [j.jurisdiction_id, a.GPIN],
        )
      ).rows[0];
      if (!parcel) {
        const po = (
          await db.query(
            "INSERT INTO dc.tracked_object(kind,label) VALUES('parcel',$1) RETURNING id",
            [a.GPIN],
          )
        ).rows[0];
        await db.query(
          "INSERT INTO dc.parcel(id,jurisdiction_id,registry_namespace,native_parcel_key) VALUES($1,$2,'pwc_gpin',$3)",
          [po.id, j.jurisdiction_id, a.GPIN],
        );
        parcel = po;
      }
      // An observed site/parcel relationship is effective only on the current observation date.
      await db.query(
        "INSERT INTO dc.project_parcel VALUES($1,$2,daterange(CURRENT_DATE,CURRENT_DATE+1,'[)'),$3) ON CONFLICT DO NOTHING",
        [project, parcel.id, ev],
      );
    }
    mapping = { object_id: object };
  }
  const object = mapping.object_id;
  const statusRaw = kind === 'project' ? a.ProjectStatus : a.BuildingStatus;
  const statuses = statusClaims(statusRaw, sourceConfig('pwc_dc_inventory'));
  await addAttribute(
    db,
    object,
    'name.project',
    { name: label, source_reported: true },
    ev,
    `name:${versionId}:${object}`,
  );
  if (kind === 'building' && a.Address)
    await addAttribute(
      db,
      object,
      'location.address',
      { address: a.Address, precision: 'source_address' },
      ev,
      `address:${versionId}:${object}`,
    );
  await addAttribute(
    db,
    object,
    'status.construction',
    { code: statuses.construction, raw: statusRaw, source_reported: true },
    ev,
    `construction:${versionId}:${object}`,
  );
  await addAttribute(
    db,
    object,
    'status.entitlement',
    { code: statuses.entitlement, raw: statusRaw, source_reported: true },
    ev,
    `entitlement:${versionId}:${object}`,
  );
  if (kind === 'building' && a.YearBuilt)
    await addAttribute(
      db,
      object,
      'date.year_built',
      {
        earliest: `${a.YearBuilt}-01-01`,
        latest: `${a.YearBuilt}-12-31`,
        precision: 'year',
        basis: 'source_year_built_not_start',
        not_a_start_date: true,
      },
      ev,
      `year-built:${versionId}:${object}`,
    );
  if (kind === 'building' && a.OCCDate)
    await addAttribute(
      db,
      object,
      'date.occupancy',
      {
        earliest: new Date(a.OCCDate).toISOString().slice(0, 10),
        latest: new Date(a.OCCDate).toISOString().slice(0, 10),
        precision: 'day',
        basis: 'reported_occupancy_not_operations',
      },
      ev,
      `occupancy:${versionId}:${object}`,
    );
  for (const [number, family, namespace, status] of [
    [
      kind === 'project' ? a.CaseNumber : a.PlanningCaseNumber,
      'planning',
      'planning',
      kind === 'project' ? a.ProjectStatus : null,
    ],
    [kind === 'building' ? a.PermitCase : null, 'building', 'building', a.PermitStatus],
  ] as any[]) {
    if (!number) continue;
    let ns = (
      await db.query(
        'SELECT id FROM dc.case_namespace WHERE authority_id=$1 AND namespace_key=$2',
        [feed.authority_id, namespace],
      )
    ).rows[0];
    if (!ns)
      ns = (
        await db.query(
          'INSERT INTO dc.case_namespace(authority_id,namespace_key,normalization_policy) VALUES($1,$2,$3) RETURNING id',
          [feed.authority_id, namespace, 'trim-uppercase-preserve-punctuation'],
        )
      ).rows[0];
    const value = String(number).trim().toUpperCase();
    let c = (
      await db.query(
        'SELECT case_id AS id FROM dc.case_identifier WHERE namespace_id=$1 AND normalized_value=$2',
        [ns.id, value],
      )
    ).rows[0];
    if (!c) {
      c = (
        await db.query("INSERT INTO dc.tracked_object(kind,label) VALUES('case',$1) RETURNING id", [
          value,
        ])
      ).rows[0];
      await db.query(
        'INSERT INTO dc.regulatory_case(id,authority_id,case_family) VALUES($1,$2,$3)',
        [c.id, feed.authority_id, family],
      );
      await db.query('INSERT INTO dc.case_identifier VALUES($1,$2,$3,$4,$5)', [
        ns.id,
        value,
        number,
        c.id,
        ev,
      ]);
    }
    await db.query(
      "INSERT INTO dc.case_target(case_id,target_id,target_kind,scope_kind,evidence_id) VALUES($1,$2,$3,'references',$4) ON CONFLICT DO NOTHING",
      [c.id, object, kind, ev],
    );
    if (status)
      await addAttribute(
        db,
        c.id,
        'case.status',
        { code: status, raw: status, source_reported: true },
        ev,
        `case:${versionId}:${c.id}:${status}`,
      );
  }
  const semantic = sha(JSON.stringify(a));
  await db.query(
    'INSERT INTO dc.source_mapping(source_record_id,object_id,semantic_hash) VALUES($1,$2,$3) ON CONFLICT(source_record_id) DO UPDATE SET semantic_hash=EXCLUDED.semantic_hash,updated_at=clock_timestamp()',
    [record.id, object, semantic],
  );
  return object;
}
export async function applySnapshot(db: DB, feed: any, snap: LayerSnapshot, runId: string) {
  await db.query('SET CONSTRAINTS ALL DEFERRED');
  let changed = 0,
    created = 0;
  for (const item of snap.features) {
    const a = item.feature.attributes;
    const key = `${snap.layerId}:${normalizedKey(a.GlobalID)}`;
    let record = (
      await db.query(
        'SELECT * FROM dc.source_record WHERE feed_id=$1 AND native_key=$2 FOR UPDATE',
        [feed.id, key],
      )
    ).rows[0];
    if (!record) {
      record = (
        await db.query(
          'INSERT INTO dc.source_record(feed_id,native_key,record_kind,original_url) VALUES($1,$2,$3,$4) RETURNING *',
          [
            feed.id,
            key,
            snap.scope === 'campuses' ? 'project' : 'building',
            `${sourceConfig('pwc_dc_inventory').service_url}/${snap.layerId}/query?where=GlobalID%3D%27${encodeURIComponent(a.GlobalID)}%27&outFields=*&f=json`,
          ],
        )
      ).rows[0];
      created++;
    }
    const prior = (
      await db.query(
        'SELECT * FROM dc.source_record_version WHERE source_record_id=$1 ORDER BY revision DESC LIMIT 1',
        [record.id],
      )
    ).rows[0];
    const payload = { ...item.feature, _archive_hash: item.archiveHash, _locator: item.locator };
    const featureHash = sha(JSON.stringify(item.feature));
    let version = prior;
    if (!prior || prior.content_sha256 !== item.archiveHash) {
      const priorFeature = prior?.payload
        ? {
            attributes: prior.payload.attributes,
            ...(prior.payload.geometry ? { geometry: prior.payload.geometry } : {}),
          }
        : null;
      const semanticChanged = !priorFeature || sha(JSON.stringify(priorFeature)) !== featureHash;
      version = (
        await db.query(
          'INSERT INTO dc.source_record_version(source_record_id,revision,content_sha256,payload,storage_uri,mime_type,source_modified_at) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',
          [
            record.id,
            (prior?.revision || 0) + 1,
            item.archiveHash,
            JSON.stringify(payload),
            item.archiveUri,
            'application/json',
            a.LastEditDate ? new Date(a.LastEditDate) : null,
          ],
        )
      ).rows[0];
      const ev = (
        await db.query(
          'INSERT INTO dc.evidence(version_id,locator,quotation,original_publisher_url) VALUES($1,$2,$3,$4) RETURNING id',
          [
            version.id,
            JSON.stringify({ ...item.locator, archive_sha256: item.archiveHash }),
            JSON.stringify(a),
            record.original_url,
          ],
        )
      ).rows[0];
      if (semanticChanged) {
        await normalize(db, feed, snap, item, record, ev.id, version.id);
        changed++;
      }
    }
    await db.query(
      'INSERT INTO dc.record_observation(run_id,feed_id,source_record_id,version_id) VALUES($1,$2,$3,$4)',
      [runId, feed.id, record.id, version.id],
    );
  }
  // Missing records are observed, never converted to canceled projects or rejected claims.
  const seen = snap.features.map(
    (x) => `${snap.layerId}:${normalizedKey(x.feature.attributes.GlobalID)}`,
  );
  const missing = await db.query(
    'SELECT sr.id,v.id AS version_id FROM dc.source_record sr JOIN LATERAL(SELECT id FROM dc.source_record_version WHERE source_record_id=sr.id ORDER BY revision DESC LIMIT 1)v ON true WHERE sr.feed_id=$1 AND sr.native_key LIKE $2 AND NOT(sr.native_key=ANY($3::text[]))',
    [feed.id, snap.layerId + ':%', seen],
  );
  for (const m of missing.rows)
    await db.query(
      "INSERT INTO dc.record_observation(run_id,feed_id,source_record_id,version_id,presence) VALUES($1,$2,$3,$4,'missing')",
      [runId, feed.id, m.id, m.version_id],
    );
  return { created, changed, missing: missing.rowCount || 0 };
}
export async function ingestSource(
  key: string,
  options: { baseline?: boolean; collector?: (layer: any) => Promise<LayerSnapshot> } = {},
) {
  const source = sourceConfig(key);
  if (key !== 'pwc_dc_inventory' || source.access_status !== 'approved')
    throw new ServiceError(409, 'Source is blocked/unverified; activation gate not cleared');
  await registerSources();
  const token = randomUUID();
  const feed = (await pools.ingest.query('SELECT * FROM dc.source_feed WHERE name=$1', [key]))
    .rows[0];
  const lease = await pools.ingest.query(
    "INSERT INTO dc.collector_lease(feed_id,scope_key,token,expires_at) VALUES($1,'all',$2,clock_timestamp()+interval '10 minutes') ON CONFLICT(feed_id,scope_key) DO UPDATE SET token=EXCLUDED.token,expires_at=EXCLUDED.expires_at WHERE dc.collector_lease.expires_at<clock_timestamp() RETURNING token",
    [feed.id, token],
  );
  if (!lease.rowCount) throw new ServiceError(409, 'Source ingestion already leased');
  const results = [];
  try {
    for (const layer of source.layers) {
      const previous = (
        await pools.ingest.query(
          'SELECT revision FROM dc.feed_checkpoint WHERE feed_id=$1 AND scope_key=$2',
          [feed.id, layer.scope],
        )
      ).rows[0];
      const run = (
        await pools.ingest.query(
          'INSERT INTO dc.ingestion_run(feed_id,scope_key,is_baseline) VALUES($1,$2,$3) RETURNING id',
          [feed.id, layer.scope, Boolean(options.baseline) || !previous],
        )
      ).rows[0];
      try {
        const snap = await (options.collector
          ? options.collector(layer)
          : collectLayer(layer, source));
        const result = await transaction(pools.ingest, async (db) => {
          const owner = await db.query(
            "SELECT token FROM dc.collector_lease WHERE feed_id=$1 AND scope_key='all' AND token=$2 AND expires_at>clock_timestamp() FOR UPDATE",
            [feed.id, token],
          );
          if (!owner.rowCount) throw new ServiceError(409, 'Ingestion lease expired');
          const cp = (
            await db.query(
              'SELECT revision FROM dc.feed_checkpoint WHERE feed_id=$1 AND scope_key=$2 FOR UPDATE',
              [feed.id, layer.scope],
            )
          ).rows[0];
          if ((cp?.revision || 0) !== (previous?.revision || 0))
            throw new ServiceError(409, 'Checkpoint compare-and-swap conflict');
          const applied = await applySnapshot(db, feed, snap, run.id);
          await db.query(
            "UPDATE dc.ingestion_run SET status='succeeded',finished_at=clock_timestamp(),coverage_complete=true,expected_record_count=$2,fetched_record_count=$2,source_release=$3 WHERE id=$1",
            [run.id, snap.expected, snap.schemaFingerprint],
          );
          await db.query(
            'INSERT INTO dc.feed_checkpoint(feed_id,scope_key,cursor_value,committed_run_id) VALUES($1,$2,$3,$4) ON CONFLICT(feed_id,scope_key) DO UPDATE SET cursor_value=EXCLUDED.cursor_value,revision=dc.feed_checkpoint.revision+1,committed_run_id=EXCLUDED.committed_run_id,committed_at=clock_timestamp()',
            [
              feed.id,
              layer.scope,
              JSON.stringify({
                snapshot_count: snap.expected,
                adapter_version: source.adapter_version,
                schema_fingerprint: snap.schemaFingerprint,
              }),
              run.id,
            ],
          );
          return { ...applied, count: snap.expected, scope: layer.scope, run_id: run.id };
        });
        results.push(result);
      } catch (e: any) {
        await pools.ingest.query(
          "UPDATE dc.ingestion_run SET status='failed',finished_at=clock_timestamp(),error_code=$2,error_detail=$3 WHERE id=$1",
          [run.id, String(e.status || 'collector_error'), String(e.message).slice(0, 1000)],
        );
        throw e;
      }
    }
  } finally {
    await pools.ingest.query(
      "DELETE FROM dc.collector_lease WHERE feed_id=$1 AND scope_key='all' AND token=$2",
      [feed.id, token],
    );
  }
  return { key, results, production_scheduled: false, notifications_enabled: false };
}
