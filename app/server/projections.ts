import { pools, transaction, assertUuid, ServiceError, type DB } from './core.js';
export type Cutoff = { valid: string; known: string };
export function cutoffs(valid?: string, known?: string): Cutoff {
  const today = new Date().toISOString().slice(0, 10);
  if (valid && (!/^\d{4}-\d{2}-\d{2}$/.test(valid) || !Number.isFinite(Date.parse(valid))))
    throw new ServiceError(400, 'Invalid effective date');
  if (known && !Number.isFinite(Date.parse(known)))
    throw new ServiceError(400, 'Invalid knowledge date');
  return {
    valid: valid || today,
    known: known ? new Date(known).toISOString() : new Date().toISOString(),
  };
}
export const projectSQL = `SELECT p.id,o.label,o.identity_state,p.project_type,p.location_precision,
 (SELECT count(*)::int FROM dc.building b WHERE b.project_id=p.id) AS building_count,
 COALESCE((SELECT jsonb_object_agg(f.predicate,jsonb_build_object('value',a.value_json,'selection_id',f.id,'assertion_id',f.assertion_id,'valid_time_basis',f.valid_time_basis)) FROM dc.fact_selection f JOIN dc.attribute_claim a ON a.assertion_id=f.assertion_id WHERE f.subject_id=p.id AND f.valid_during @> $1::date AND f.system_during @> $2::timestamptz),'{}') AS reviewed_facts,
 (SELECT jsonb_build_object('status',v.payload->'attributes'->>'ProjectStatus','last_edit',v.source_modified_at,'url',sr.original_url) FROM dc.source_mapping m JOIN dc.source_record sr ON sr.id=m.source_record_id JOIN LATERAL(SELECT payload,source_modified_at FROM dc.source_record_version WHERE source_record_id=sr.id AND retrieved_at<=$2::timestamptz ORDER BY revision DESC LIMIT 1)v ON true WHERE m.object_id=p.id LIMIT 1) AS source_reported,
 (SELECT count(*)::int FROM dc.assertion a WHERE a.subject_id=p.id AND a.first_recorded_at<=$2::timestamptz AND NOT EXISTS(SELECT 1 FROM dc.assertion_review r WHERE r.assertion_id=a.id)) AS pending_claims
 FROM dc.project p JOIN dc.tracked_object o ON o.id=p.id WHERE o.identity_state<>'merged' AND o.created_at<=$2::timestamptz`;
export async function projects(
  filters: { q?: string; status?: string; kind?: string; page?: number; limit?: number },
  at: Cutoff,
) {
  const page = filters.page || 1,
    limit = filters.limit || 50;
  return transaction(
    pools.read,
    async (db) => {
      const where =
        " AND ($3='' OR o.label ILIKE '%'||$3||'%') AND ($4='' OR p.project_type=$4) AND ($5='' OR EXISTS(SELECT 1 FROM dc.source_mapping m JOIN LATERAL(SELECT payload FROM dc.source_record_version WHERE source_record_id=m.source_record_id AND retrieved_at<=$2::timestamptz ORDER BY revision DESC LIMIT 1)v ON true WHERE m.object_id=p.id AND v.payload->'attributes'->>'ProjectStatus'=$5))";
      const params = [
        at.valid,
        at.known,
        filters.q || '',
        filters.kind || '',
        filters.status || '',
      ];
      const data = await db.query(
        projectSQL + where + ' ORDER BY o.label,p.id LIMIT $6 OFFSET $7',
        [...params, limit, (page - 1) * limit],
      );
      const total = (
        await db.query('SELECT count(*)::int AS n FROM (' + projectSQL + where + ')x', params)
      ).rows[0].n;
      return {
        data: data.rows,
        total,
        page,
        limit,
        valid_as_of: at.valid,
        known_as_of: at.known,
        structural_metadata_basis: 'current_snapshot',
        policy_version: 'manual-review-v1',
      };
    },
    true,
  );
}
export async function evidenceClaims(db: DB, id: string, at: Cutoff) {
  return (
    await db.query(
      `SELECT a.id,a.predicate,a.valid_during,a.first_recorded_at,a.confidence,a.extraction_method,x.value_json,
 (SELECT decision FROM dc.assertion_review WHERE assertion_id=a.id AND recorded_at<=$2::timestamptz ORDER BY recorded_at DESC,id DESC LIMIT 1) AS review_decision,
 (SELECT jsonb_agg(jsonb_build_object('evidence_id',e.id,'quotation',e.quotation,'locator',e.locator,'original_url',sr.original_url,'hash',v.content_sha256,'retrieved_at',v.retrieved_at)) FROM dc.assertion_evidence ae JOIN dc.evidence e ON e.id=ae.evidence_id JOIN dc.source_record_version v ON v.id=e.version_id JOIN dc.source_record sr ON sr.id=v.source_record_id WHERE ae.assertion_id=a.id AND ae.recorded_at<=$2::timestamptz AND e.created_at<=$2::timestamptz AND v.retrieved_at<=$2::timestamptz) AS evidence,
 EXISTS(SELECT 1 FROM dc.fact_selection f WHERE f.assertion_id=a.id AND f.valid_during @> $3::date AND f.system_during @> $2::timestamptz) AS selected
 FROM dc.assertion a LEFT JOIN dc.attribute_claim x ON x.assertion_id=a.id WHERE a.subject_id=$1 AND a.first_recorded_at<=$2::timestamptz ORDER BY a.first_recorded_at DESC,a.predicate`,
      [id, at.known, at.valid],
    )
  ).rows;
}
export async function projectDetail(id: string, at: Cutoff) {
  assertUuid(id);
  return transaction(
    pools.read,
    async (db) => {
      const project = (await db.query(projectSQL + ' AND p.id=$3', [at.valid, at.known, id]))
        .rows[0];
      if (!project) throw new ServiceError(404, 'Project not found');
      const buildings = (
        await db.query(
          `SELECT b.id,o.label,b.phase_id,
   (SELECT v.payload->'attributes' FROM dc.source_mapping m JOIN LATERAL(SELECT payload FROM dc.source_record_version WHERE source_record_id=m.source_record_id AND retrieved_at<=$2::timestamptz ORDER BY revision DESC LIMIT 1)v ON true WHERE m.object_id=b.id) AS source_attributes
   FROM dc.building b JOIN dc.tracked_object o ON o.id=b.id WHERE b.project_id=$1 AND o.created_at<=$2::timestamptz ORDER BY o.label`,
          [id, at.known],
        )
      ).rows;
      for (const b of buildings) b.claims = await evidenceClaims(db, b.id, at);
      const claims = await evidenceClaims(db, id, at);
      const cases = (
        await db.query(
          `SELECT DISTINCT c.id,o.label,c.case_family FROM dc.case_target ct JOIN dc.regulatory_case c ON c.id=ct.case_id JOIN dc.tracked_object o ON o.id=c.id WHERE ct.target_id=$1 OR ct.target_id IN(SELECT id FROM dc.building WHERE project_id=$1)`,
          [id],
        )
      ).rows;
      const participants = (
        await db.query(
          `SELECT pc.role,pc.entity_id,o.label FROM dc.fact_selection f JOIN dc.participation_claim pc ON pc.assertion_id=f.assertion_id JOIN dc.tracked_object o ON o.id=pc.entity_id WHERE f.subject_id=$1 AND f.valid_during @> $2::date AND f.system_during @> $3::timestamptz`,
          [id, at.valid, at.known],
        )
      ).rows;
      const capital = (
        await db.query(
          `SELECT c.*,a.id FROM dc.capital_claim c JOIN dc.assertion a ON a.id=c.assertion_id JOIN dc.fact_selection f ON f.assertion_id=a.id WHERE a.subject_id=$1 AND f.valid_during @> $2::date AND f.system_during @> $3::timestamptz`,
          [id, at.valid, at.known],
        )
      ).rows;
      const issues = (
        await db.query(
          'SELECT id,issue_kind,status,details FROM dc.review_issue WHERE subject_id=$1',
          [id],
        )
      ).rows;
      return {
        ...project,
        buildings,
        claims,
        cases,
        participants,
        capital,
        issues,
        valid_as_of: at.valid,
        known_as_of: at.known,
        structural_metadata_basis: 'current_snapshot',
        parent_resolution: 'unknown_unless_evidenced',
      };
    },
    true,
  );
}
export async function caseList(q = '', limit = 100, offset = 0, at = cutoffs()) {
  const data = await pools.read.query(
    `SELECT c.id,o.label,c.case_family,a.name AS authority,
 (SELECT jsonb_agg(jsonb_build_object('namespace',n.namespace_key,'identifier',i.raw_value)) FROM dc.case_identifier i JOIN dc.case_namespace n ON n.id=i.namespace_id WHERE i.case_id=c.id) AS identifiers,
 (SELECT count(*)::int FROM dc.case_target WHERE case_id=c.id) AS targets
 FROM dc.regulatory_case c JOIN dc.tracked_object o ON o.id=c.id JOIN dc.authority a ON a.id=c.authority_id WHERE o.created_at<=$2::timestamptz AND o.label ILIKE '%'||$1||'%' ORDER BY o.label LIMIT $3 OFFSET $4`,
    [q, at.known, limit, offset],
  );
  return data.rows;
}
export async function caseDetail(id: string, at: Cutoff) {
  assertUuid(id);
  return transaction(
    pools.read,
    async (db) => {
      const c = (
        await db.query(
          'SELECT c.id,o.label,c.case_family FROM dc.regulatory_case c JOIN dc.tracked_object o ON o.id=c.id WHERE c.id=$1',
          [id],
        )
      ).rows[0];
      if (!c) throw new ServiceError(404, 'Permit/plan not found');
      return {
        ...c,
        claims: await evidenceClaims(db, id, at),
        targets: (
          await db.query(
            'SELECT target_id,target_kind,scope_kind FROM dc.case_target WHERE case_id=$1',
            [id],
          )
        ).rows,
      };
    },
    true,
  );
}
export async function sources() {
  return (
    await pools.read
      .query(`SELECT s.id,s.name,s.publisher,s.access_status,s.redistribution_policy,s.endpoint_url,
 (SELECT jsonb_agg(jsonb_build_object('scope',r.scope_key,'status',r.status,'finished',r.finished_at,'count',r.fetched_record_count,'error',r.error_detail,'baseline',r.is_baseline)) FROM dc.ingestion_run r WHERE r.id IN(SELECT DISTINCT ON(scope_key) id FROM dc.ingestion_run WHERE feed_id=s.id ORDER BY scope_key,started_at DESC)) AS scopes,
 (SELECT max(finished_at) FROM dc.ingestion_run WHERE feed_id=s.id AND status='succeeded') AS last_success,
 (SELECT count(*)::int FROM dc.source_record WHERE feed_id=s.id) AS records,
 CASE WHEN s.access_status<>'approved' THEN s.access_status WHEN EXISTS(SELECT 1 FROM dc.ingestion_run r WHERE r.feed_id=s.id AND r.status='failed' AND NOT EXISTS(SELECT 1 FROM dc.ingestion_run newer WHERE newer.feed_id=s.id AND newer.scope_key=r.scope_key AND newer.started_at>r.started_at)) THEN 'failed' WHEN NOT EXISTS(SELECT 1 FROM dc.ingestion_run WHERE feed_id=s.id AND status='succeeded') THEN 'not_ingested' WHEN (SELECT max(finished_at) FROM dc.ingestion_run WHERE feed_id=s.id AND status='succeeded')<clock_timestamp()-interval '48 hours' THEN 'stale' ELSE 'local_ingestion_verified_not_scheduled' END AS health
 FROM dc.source_feed s ORDER BY s.name`)
  ).rows;
}
export async function reviewQueue(q = '', limit = 100, offset = 0) {
  return (
    await pools.read.query(
      `SELECT a.id,a.subject_id,a.predicate,a.first_recorded_at,o.label,o.kind,x.value_json,r.decision,
 COALESCE(x.value_json,(SELECT to_jsonb(c)||jsonb_build_object('parent_label',p.label) FROM dc.company_relationship_claim c JOIN dc.tracked_object p ON p.id=c.parent_entity_id WHERE c.assertion_id=a.id),(SELECT to_jsonb(c) FROM dc.participation_claim c WHERE c.assertion_id=a.id)) AS payload,
 (SELECT jsonb_agg(jsonb_build_object('quotation',e.quotation,'locator',e.locator,'url',sr.original_url,'retrieved_at',v.retrieved_at)) FROM dc.assertion_evidence ae JOIN dc.evidence e ON e.id=ae.evidence_id JOIN dc.source_record_version v ON v.id=e.version_id JOIN dc.source_record sr ON sr.id=v.source_record_id WHERE ae.assertion_id=a.id) AS evidence
 FROM dc.assertion a JOIN dc.tracked_object o ON o.id=a.subject_id LEFT JOIN dc.attribute_claim x ON x.assertion_id=a.id LEFT JOIN LATERAL(SELECT decision FROM dc.assertion_review WHERE assertion_id=a.id ORDER BY recorded_at DESC,id DESC LIMIT 1)r ON true WHERE (r.decision IS NULL OR r.decision='needs_review') AND o.label ILIKE '%'||$1||'%' ORDER BY a.first_recorded_at,a.id LIMIT $2 OFFSET $3`,
      [q, limit, offset],
    )
  ).rows;
}
export async function reviewClaim(id: string, decision: string, actor: string, rationale: string) {
  assertUuid(id);
  try {
    return await transaction(
      pools.review,
      async (db) =>
        (
          await db.query('SELECT dc.review_claim($1,$2,$3,$4) AS selection_id', [
            id,
            decision,
            actor,
            rationale,
          ])
        ).rows[0],
    );
  } catch (e: any) {
    if (['23514', 'P0002', '23P01'].includes(e.code))
      throw new ServiceError(
        409,
        'Review conflicts with evidence, prior selection, or temporal rules',
      );
    throw e;
  }
}
export async function entities(q = '', limit = 100, offset = 0) {
  return (
    await pools.read.query(
      "SELECT e.id,o.label,e.entity_type FROM dc.company_entity e JOIN dc.tracked_object o ON o.id=e.id WHERE o.label ILIKE '%'||$1||'%' ORDER BY o.label LIMIT $2 OFFSET $3",
      [q, limit, offset],
    )
  ).rows;
}
export async function entityDetail(id: string, at: Cutoff) {
  assertUuid(id);
  const entity = (
    await pools.read.query(
      'SELECT e.id,o.label,e.entity_type FROM dc.company_entity e JOIN dc.tracked_object o ON o.id=e.id WHERE e.id=$1',
      [id],
    )
  ).rows[0];
  if (!entity) throw new ServiceError(404, 'Company not found');
  return {
    ...entity,
    parent_resolution: 'unknown_unless_evidenced',
    control_paths: (
      await pools.read.query('SELECT * FROM dc.control_paths($1,$2,$3,32)', [
        id,
        at.valid,
        at.known,
      ])
    ).rows,
    mappings: (
      await pools.read.query(
        'SELECT monitor_key,valid_during,evidence_id FROM dc.app_entity_mapping WHERE entity_id=$1 AND valid_during @> $2::date AND recorded_at<=$3::timestamptz',
        [id, at.valid, at.known],
      )
    ).rows,
    valid_as_of: at.valid,
    known_as_of: at.known,
  };
}
export async function changes(limit = 100, offset = 0) {
  return (
    await pools.read.query(
      'SELECT ce.id,ce.subject_id,ce.event_type,ce.event_date,ce.observed_at,ce.emit_alert,ce.details,o.label FROM dc.change_event ce JOIN dc.tracked_object o ON o.id=ce.subject_id ORDER BY ce.observed_at DESC LIMIT $1 OFFSET $2',
      [limit, offset],
    )
  ).rows;
}
