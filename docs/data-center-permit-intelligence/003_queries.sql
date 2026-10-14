-- Runnable examples. Replace fixture UUIDs with actual IDs after ingestion.
-- psql -X -v ON_ERROR_STOP=1 -d YOUR_DB -f 003_queries.sql
\set ON_ERROR_STOP on
SET search_path=dc,public;
\set valid_date '2026-10-13'
\set known_at '2026-10-13 23:59:59+00'
\set entity_id '00000000-0000-0000-0000-000000000201'
\set project_id '00000000-0000-0000-0000-000000000101'

-- 1. Exactly one project row: aggregate each one-to-many branch BEFORE joining.
-- Includes projection evidence IDs; resolver policies govern carry-forward facts.
WITH selected AS (
 SELECT * FROM fact_selection
 WHERE valid_during @> :'valid_date'::date AND system_during @> :'known_at'::timestamptz
), states AS (
 SELECT f.subject_id,jsonb_object_agg(f.predicate,jsonb_build_object(
   'value',a.value_json,'assertion_id',f.assertion_id,'selection_id',f.id,
   'valid_time_basis',f.valid_time_basis)) AS dimensions
 FROM selected f JOIN attribute_claim a ON a.assertion_id=f.assertion_id
 WHERE f.predicate IN ('status.entitlement','status.construction','status.power','status.operations','purpose')
 GROUP BY f.subject_id
), roles AS (
 SELECT f.subject_id,jsonb_agg(jsonb_build_object('role',r.role,'entity_id',r.entity_id,
   'entity_name',e.label,'assertion_id',r.assertion_id)) AS participants
 FROM selected f JOIN participation_claim r ON r.assertion_id=f.assertion_id
 JOIN tracked_object e ON e.id=r.entity_id GROUP BY f.subject_id
), jurisdictions AS (
 SELECT pj.project_id,jsonb_agg(jsonb_build_object('jurisdiction',j.name,'role',pj.role)) AS jurisdictions
 FROM project_jurisdiction pj JOIN jurisdiction j ON j.id=pj.jurisdiction_id GROUP BY pj.project_id
), buildings AS (
 SELECT project_id,count(*) AS building_count FROM building b JOIN tracked_object o ON o.id=b.id
 WHERE o.identity_state<>'merged' GROUP BY project_id
)
SELECT p.id,o.label,p.latitude,p.longitude,p.location_precision,
 coalesce(s.dimensions,'{}'::jsonb) AS statuses_and_purpose,
 coalesce(r.participants,'[]'::jsonb) AS participants,
 coalesce(j.jurisdictions,'[]'::jsonb) AS jurisdictions,
 coalesce(b.building_count,0) AS building_count
FROM project p JOIN tracked_object o ON o.id=p.id
LEFT JOIN states s ON s.subject_id=p.id LEFT JOIN roles r ON r.subject_id=p.id
LEFT JOIN jurisdictions j ON j.project_id=p.id LEFT JOIN buildings b ON b.project_id=p.id
WHERE o.identity_state<>'merged';
-- Caution: project membership/labels above are current structural metadata;
-- historical export uses a DB snapshot or explicit future identity-history tables.

-- 2. Cases affecting a campus/building/phase, deduplicated at case grain.
WITH project_targets AS (
 SELECT :'project_id'::uuid AS id UNION SELECT id FROM building WHERE project_id=:'project_id'::uuid
 UNION SELECT id FROM phase WHERE project_id=:'project_id'::uuid
), cases AS (
 SELECT DISTINCT ct.case_id FROM case_target ct JOIN project_targets t ON t.id=ct.target_id
), ids AS (
 SELECT ci.case_id,jsonb_agg(jsonb_build_object('namespace',n.namespace_key,'identifier',ci.raw_value)) AS identifiers
 FROM case_identifier ci JOIN case_namespace n ON n.id=ci.namespace_id GROUP BY ci.case_id
)
SELECT c.id,a.name AS issuing_authority,c.case_family,i.identifiers,
 x.value_json AS status_payload,f.assertion_id AS status_assertion
FROM cases q JOIN regulatory_case c ON c.id=q.case_id JOIN authority a ON a.id=c.authority_id
LEFT JOIN ids i ON i.case_id=c.id
LEFT JOIN fact_selection f ON f.subject_id=c.id AND f.predicate='case.status'
 AND f.valid_during @> :'valid_date'::date AND f.system_during @> :'known_at'::timestamptz
LEFT JOIN attribute_claim x ON x.assertion_id=f.assertion_id;

-- 3. Parent CONTROL paths at effective date T using knowledge K.
-- No parent row means UNKNOWN, not 'independent' or 'ultimate parent proven'.
SELECT p.*,o.label AS ancestor_label FROM control_paths(
 :'entity_id'::uuid,:'valid_date'::date,:'known_at'::timestamptz) p
JOIN tracked_object o ON o.id=p.ancestor_id ORDER BY depth,ancestor_id;

-- 4. Power/area metrics retain metric code and scope; no generator-to-IT conversion.
SELECT f.subject_id,o.kind,o.label,m.metric_code,m.reported_value,m.reported_unit,
 m.normalized_value,m.canonical_unit,m.scope_basis,m.qualifier,f.valid_time_basis,f.assertion_id
FROM fact_selection f JOIN metric_claim m ON m.assertion_id=f.assertion_id
JOIN tracked_object o ON o.id=f.subject_id
WHERE f.valid_during @> :'valid_date'::date AND f.system_during @> :'known_at'::timestamptz
 AND o.identity_state<>'merged';

-- 5. Capital disclosure ledger: intentionally NOT a SUM.
SELECT a.id AS assertion_id,o.kind,o.label,c.basis,c.geographic_scope,
 c.amount_low,c.amount_high,c.currency_code,c.spend_period,c.aggregation_state,
 (SELECT jsonb_agg(jsonb_build_object('relation',l.relation,'other_claim',l.to_assertion_id))
  FROM capital_claim_link l WHERE l.from_assertion_id=a.id) AS overlap_links
FROM capital_claim c JOIN assertion a ON a.id=c.assertion_id JOIN tracked_object o ON o.id=a.subject_id
WHERE a.first_recorded_at<=:'known_at'::timestamptz;
-- This query is ALL known disclosures, not only accepted/current disclosures.
-- Filter through fact_selection for canonical reporting and resolve replaces/duplicates separately.

-- 6. Exact source lineage for selected facts.
SELECT f.id AS selection_id,a.id AS assertion_id,ae.stance,e.quotation,e.locator,
 sr.original_url,srv.revision,srv.content_sha256,srv.retrieved_at,srv.source_modified_at
FROM fact_selection f JOIN assertion a ON a.id=f.assertion_id
JOIN assertion_evidence ae ON ae.assertion_id=a.id JOIN evidence e ON e.id=ae.evidence_id
JOIN source_record_version srv ON srv.id=e.version_id JOIN source_record sr ON sr.id=srv.source_record_id
WHERE f.subject_id=:'project_id'::uuid AND f.valid_during @> :'valid_date'::date
 AND f.system_during @> :'known_at'::timestamptz
 AND ae.recorded_at<=:'known_at'::timestamptz
 AND e.created_at<=:'known_at'::timestamptz
 AND srv.retrieved_at<=:'known_at'::timestamptz;

-- 7. Health: attempted collection is not successful collection.
SELECT * FROM v_source_health;
