-- Data Center Intelligence v1.0 | PostgreSQL 16+ | 2026-10-13
-- Bootstrap a NEW database/schema. Not an idempotent migration and not a deployment.
-- No source credentials or real company/project records are included.
BEGIN;
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE SCHEMA dc;
SET search_path = dc, public;

CREATE TABLE jurisdiction (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (btrim(name) <> ''),
  jurisdiction_type text NOT NULL CHECK (jurisdiction_type IN ('federal','state','county','municipality','special_district','tribal')),
  country_code text NOT NULL DEFAULT 'US' CHECK (country_code ~ '^[A-Z]{2}$'),
  timezone text, -- IANA label; validation by ingestion configuration
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE jurisdiction_identifier (
  jurisdiction_id uuid NOT NULL REFERENCES jurisdiction(id),
  scheme text NOT NULL,
  value text NOT NULL CHECK (btrim(value) <> ''),
  PRIMARY KEY (scheme, value), -- e.g. census_county_fips, not unqualified 'FIPS'
  UNIQUE (jurisdiction_id, scheme)
);
CREATE TABLE jurisdiction_relation (
  from_id uuid NOT NULL REFERENCES jurisdiction(id),
  to_id uuid NOT NULL REFERENCES jurisdiction(id),
  relation text NOT NULL CHECK (relation IN ('within','overlaps')),
  PRIMARY KEY (from_id,to_id,relation),
  CHECK (from_id <> to_id)
);
CREATE TABLE authority (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  authority_type text NOT NULL CHECK (authority_type IN ('planning','building','environmental','utility_regulator','other')),
  homepage_url text
);
CREATE TABLE authority_jurisdiction (
  authority_id uuid NOT NULL REFERENCES authority(id),
  jurisdiction_id uuid NOT NULL REFERENCES jurisdiction(id),
  PRIMARY KEY (authority_id,jurisdiction_id)
);
CREATE TABLE source_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  publisher text NOT NULL,
  authority_id uuid REFERENCES authority(id),
  feed_type text NOT NULL CHECK (feed_type IN ('api','gis','bulk_export','document_index','browser_portal','licensed_feed','manual')),
  endpoint_url text NOT NULL,
  terms_url text,
  access_status text NOT NULL DEFAULT 'unverified' CHECK (access_status IN ('unverified','approved','blocked','disabled')),
  redistribution_policy text NOT NULL DEFAULT 'review_required',
  credential_reference text, -- secret-manager reference only, NEVER a token
  adapter_version text,
  schema_fingerprint text,
  expected_refresh interval CHECK (expected_refresh > interval '0 seconds'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE feed_coverage (
  feed_id uuid NOT NULL REFERENCES source_feed(id),
  jurisdiction_id uuid NOT NULL REFERENCES jurisdiction(id),
  record_family text NOT NULL,
  history_start date,
  completeness text NOT NULL DEFAULT 'unknown' CHECK (completeness IN ('unknown','partial','evaluated_sample','agency_stated')),
  notes text,
  PRIMARY KEY (feed_id,jurisdiction_id,record_family)
);
CREATE TABLE ingestion_run (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id uuid NOT NULL REFERENCES source_feed(id),
  scope_key text NOT NULL DEFAULT 'default',
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running','succeeded','failed','partial')),
  is_baseline boolean NOT NULL DEFAULT false,
  started_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  finished_at timestamptz,
  coverage_complete boolean NOT NULL DEFAULT false,
  source_release text,
  expected_record_count bigint CHECK (expected_record_count >= 0),
  fetched_record_count bigint NOT NULL DEFAULT 0 CHECK (fetched_record_count >= 0),
  error_code text,
  error_detail text,
  UNIQUE (id,feed_id),
  CHECK (finished_at IS NULL OR finished_at >= started_at),
  CHECK (status <> 'succeeded' OR (finished_at IS NOT NULL AND coverage_complete)),
  CHECK (NOT coverage_complete OR expected_record_count IS NULL OR expected_record_count = fetched_record_count)
);
CREATE TABLE feed_checkpoint (
  feed_id uuid NOT NULL REFERENCES source_feed(id),
  scope_key text NOT NULL,
  cursor_value jsonb NOT NULL,
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
  committed_run_id uuid NOT NULL,
  committed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (feed_id,scope_key),
  FOREIGN KEY (committed_run_id,feed_id) REFERENCES ingestion_run(id,feed_id)
);
CREATE TABLE source_record (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id uuid NOT NULL REFERENCES source_feed(id),
  collection_epoch text NOT NULL DEFAULT 'initial', -- change only on genuine identifier reset
  native_key text NOT NULL CHECK (btrim(native_key) <> ''),
  record_kind text NOT NULL,
  original_url text NOT NULL,
  first_seen_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (feed_id,collection_epoch,native_key),
  UNIQUE (id,feed_id)
);
CREATE TABLE source_record_version (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_record_id uuid NOT NULL REFERENCES source_record(id),
  revision bigint NOT NULL CHECK (revision > 0),
  content_sha256 text NOT NULL CHECK (content_sha256 ~ '^[0-9a-f]{64}$'),
  retrieved_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  source_published_at timestamptz,
  source_modified_at timestamptz,
  http_status integer CHECK (http_status BETWEEN 100 AND 599),
  payload jsonb,
  storage_uri text,
  mime_type text,
  UNIQUE (source_record_id,revision),
  UNIQUE (id,source_record_id),
  CHECK (payload IS NOT NULL OR storage_uri IS NOT NULL)
  -- NOT UNIQUE(record,hash): A -> B -> A is three valid versions.
);
CREATE TABLE record_observation (
  run_id uuid NOT NULL,
  feed_id uuid NOT NULL,
  source_record_id uuid NOT NULL,
  version_id uuid NOT NULL,
  presence text NOT NULL DEFAULT 'present' CHECK (presence IN ('present','missing')),
  observed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (run_id,source_record_id),
  FOREIGN KEY (run_id,feed_id) REFERENCES ingestion_run(id,feed_id),
  FOREIGN KEY (source_record_id,feed_id) REFERENCES source_record(id,feed_id),
  FOREIGN KEY (version_id,source_record_id) REFERENCES source_record_version(id,source_record_id)
  -- Missing means missing from a COMPLETE reconciliation, not project canceled.
);
CREATE TABLE evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES source_record_version(id),
  locator jsonb NOT NULL DEFAULT '{}'::jsonb, -- JSON pointer, page, table/row, or geometry feature
  quotation text,
  origin_group_key text, -- identify syndicated/mirrored evidence; not independent corroboration
  original_publisher_url text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

-- A real FK target for all evidence subjects; no dangling polymorphic IDs.
CREATE TABLE tracked_object (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('project','phase','building','parcel','entity','case')),
  label text NOT NULL,
  identity_state text NOT NULL DEFAULT 'candidate' CHECK (identity_state IN ('candidate','confirmed','merged')),
  redirect_id uuid,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (id,kind),
  FOREIGN KEY (redirect_id,kind) REFERENCES tracked_object(id,kind),
  CHECK (redirect_id IS NULL OR redirect_id <> id),
  CHECK ((identity_state = 'merged') = (redirect_id IS NOT NULL))
);
CREATE TABLE company_entity (
  id uuid PRIMARY KEY,
  object_kind text GENERATED ALWAYS AS ('entity'::text) STORED,
  entity_type text NOT NULL CHECK (entity_type IN ('corporation','llc','partnership','fund','trust','government','other','unknown')),
  incorporation_jurisdiction_id uuid REFERENCES jurisdiction(id),
  FOREIGN KEY (id,object_kind) REFERENCES tracked_object(id,kind)
);
CREATE TABLE entity_identifier_namespace (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace_key text NOT NULL UNIQUE,
  identifier_kind text NOT NULL CHECK (identifier_kind IN ('sec_cik','lei','state_registration','other')),
  issuer_name text NOT NULL,
  issuer_jurisdiction_id uuid REFERENCES jurisdiction(id),
  normalization_policy text NOT NULL,
  UNIQUE NULLS NOT DISTINCT (identifier_kind,issuer_name,issuer_jurisdiction_id),
  CHECK (identifier_kind<>'state_registration' OR issuer_jurisdiction_id IS NOT NULL)
);
CREATE TABLE entity_identifier (
  entity_id uuid NOT NULL REFERENCES company_entity(id),
  namespace_id uuid NOT NULL REFERENCES entity_identifier_namespace(id),
  normalized_value text NOT NULL CHECK (btrim(normalized_value) <> ''),
  raw_value text NOT NULL,
  evidence_id uuid NOT NULL REFERENCES evidence(id),
  PRIMARY KEY (namespace_id,normalized_value),
  UNIQUE (entity_id,namespace_id,normalized_value)
);
CREATE TABLE project (
  id uuid PRIMARY KEY,
  object_kind text GENERATED ALWAYS AS ('project'::text) STORED,
  project_type text NOT NULL DEFAULT 'data_center_campus' CHECK (project_type IN ('data_center_campus','standalone_facility','conversion','unresolved_site')),
  latitude numeric(10,7) CHECK (latitude BETWEEN -90 AND 90),
  longitude numeric(10,7) CHECK (longitude BETWEEN -180 AND 180),
  location_precision text NOT NULL DEFAULT 'unknown' CHECK (location_precision IN ('unknown','locality','address','parcel','site_geometry')),
  FOREIGN KEY (id,object_kind) REFERENCES tracked_object(id,kind),
  CHECK ((latitude IS NULL) = (longitude IS NULL))
);
CREATE TABLE phase (
  id uuid PRIMARY KEY,
  object_kind text GENERATED ALWAYS AS ('phase'::text) STORED,
  project_id uuid NOT NULL REFERENCES project(id),
  phase_key text NOT NULL,
  FOREIGN KEY (id,object_kind) REFERENCES tracked_object(id,kind),
  UNIQUE (project_id,phase_key),
  UNIQUE (id,project_id)
);
CREATE TABLE building (
  id uuid PRIMARY KEY,
  object_kind text GENERATED ALWAYS AS ('building'::text) STORED,
  project_id uuid NOT NULL REFERENCES project(id),
  phase_id uuid,
  internal_building_key text NOT NULL,
  FOREIGN KEY (id,object_kind) REFERENCES tracked_object(id,kind),
  FOREIGN KEY (phase_id,project_id) REFERENCES phase(id,project_id),
  UNIQUE (project_id,internal_building_key)
  -- phase nullable: a building need not have a known phase. Cross-phase packages use case_target.
);
CREATE TABLE parcel (
  id uuid PRIMARY KEY,
  object_kind text GENERATED ALWAYS AS ('parcel'::text) STORED,
  jurisdiction_id uuid NOT NULL REFERENCES jurisdiction(id),
  registry_namespace text NOT NULL,
  native_parcel_key text NOT NULL,
  identifier_epoch text NOT NULL DEFAULT 'initial',
  FOREIGN KEY (id,object_kind) REFERENCES tracked_object(id,kind),
  UNIQUE (jurisdiction_id,registry_namespace,identifier_epoch,native_parcel_key)
);
CREATE TABLE project_jurisdiction (
  project_id uuid NOT NULL REFERENCES project(id),
  jurisdiction_id uuid NOT NULL REFERENCES jurisdiction(id),
  role text NOT NULL CHECK (role IN ('physical_location','permitting','service_area')),
  PRIMARY KEY (project_id,jurisdiction_id,role)
);
CREATE TABLE project_parcel (
  project_id uuid NOT NULL REFERENCES project(id),
  parcel_id uuid NOT NULL REFERENCES parcel(id),
  valid_during daterange NOT NULL CHECK (NOT isempty(valid_during)),
  evidence_id uuid NOT NULL REFERENCES evidence(id),
  PRIMARY KEY (project_id,parcel_id,valid_during)
);
CREATE TABLE parcel_lineage (
  predecessor_id uuid NOT NULL REFERENCES parcel(id),
  successor_id uuid NOT NULL REFERENCES parcel(id),
  change_kind text NOT NULL CHECK (change_kind IN ('split','consolidation','renumbered')),
  effective_date date,
  evidence_id uuid NOT NULL REFERENCES evidence(id),
  PRIMARY KEY (predecessor_id,successor_id),
  CHECK (predecessor_id <> successor_id)
);
CREATE TABLE object_alias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id uuid NOT NULL REFERENCES tracked_object(id),
  alias text NOT NULL,
  normalized_alias text NOT NULL,
  alias_kind text NOT NULL CHECK (alias_kind IN ('legal_name','former_name','marketing_name','project_code','address','source_name')),
  evidence_id uuid NOT NULL REFERENCES evidence(id),
  UNIQUE (object_id,alias_kind,normalized_alias)
  -- Names/addresses are searchable aliases, never globally unique identity keys.
);
CREATE TABLE case_namespace (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  authority_id uuid NOT NULL REFERENCES authority(id),
  namespace_key text NOT NULL, -- includes program/series/year if numbers are reused
  normalization_policy text NOT NULL,
  UNIQUE (authority_id,namespace_key)
);
CREATE TABLE regulatory_case (
  id uuid PRIMARY KEY,
  object_kind text GENERATED ALWAYS AS ('case'::text) STORED,
  authority_id uuid NOT NULL REFERENCES authority(id),
  case_family text NOT NULL CHECK (case_family IN ('planning','zoning','site_plan','building','grading','electrical','mechanical','fire','air','water','utility','inspection','occupancy','other')),
  FOREIGN KEY (id,object_kind) REFERENCES tracked_object(id,kind),
  UNIQUE (id,authority_id)
  -- A permit/planning application can exist BEFORE any project has been matched.
);
CREATE TABLE case_identifier (
  namespace_id uuid NOT NULL REFERENCES case_namespace(id),
  normalized_value text NOT NULL CHECK (btrim(normalized_value) <> ''),
  raw_value text NOT NULL,
  case_id uuid NOT NULL REFERENCES regulatory_case(id),
  evidence_id uuid NOT NULL REFERENCES evidence(id),
  PRIMARY KEY (namespace_id,normalized_value)
);
CREATE TABLE case_relationship (
  from_case_id uuid NOT NULL REFERENCES regulatory_case(id),
  to_case_id uuid NOT NULL REFERENCES regulatory_case(id),
  relation text NOT NULL CHECK (relation IN ('amends','supersedes','trade_of','inspection_of','related_to')),
  evidence_id uuid NOT NULL REFERENCES evidence(id),
  PRIMARY KEY (from_case_id,to_case_id,relation),
  CHECK (from_case_id <> to_case_id)
);
CREATE TABLE case_target (
  case_id uuid NOT NULL REFERENCES regulatory_case(id),
  target_id uuid NOT NULL,
  target_kind text NOT NULL CHECK (target_kind IN ('project','phase','building','parcel')),
  scope_kind text NOT NULL CHECK (scope_kind IN ('covers','references','partial_work')),
  evidence_id uuid NOT NULL REFERENCES evidence(id),
  PRIMARY KEY (case_id,target_id,scope_kind),
  FOREIGN KEY (target_id,target_kind) REFERENCES tracked_object(id,kind)
);
CREATE TABLE source_object_link (
  source_record_id uuid NOT NULL REFERENCES source_record(id),
  object_id uuid NOT NULL REFERENCES tracked_object(id),
  link_role text NOT NULL CHECK (link_role IN ('canonical_record','mentions','applicant','location')),
  method text NOT NULL,
  evidence_id uuid NOT NULL REFERENCES evidence(id),
  PRIMARY KEY (source_record_id,object_id,link_role)
);

-- Immutable proposals; contradictory proposals are allowed and retained.
CREATE TABLE predicate_definition (
  code text PRIMARY KEY,
  storage_kind text NOT NULL CHECK (storage_kind IN ('attribute','metric','capital','relationship','participation')),
  description text NOT NULL
);
CREATE TABLE assertion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES tracked_object(id),
  predicate text NOT NULL REFERENCES predicate_definition(code),
  valid_during daterange CHECK (valid_during IS NULL OR NOT isempty(valid_during)),
  first_recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  extraction_method text NOT NULL CHECK (extraction_method IN ('source_field','document_rule','model','analyst')),
  extractor_version text NOT NULL,
  confidence text NOT NULL CHECK (confidence IN ('high','medium','low','unknown')),
  idempotency_key text NOT NULL UNIQUE,
  UNIQUE (id,subject_id,predicate)
);
CREATE TABLE assertion_evidence (
  assertion_id uuid NOT NULL REFERENCES assertion(id),
  evidence_id uuid NOT NULL REFERENCES evidence(id),
  stance text NOT NULL DEFAULT 'supports' CHECK (stance IN ('supports','contradicts','context')),
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (assertion_id,evidence_id,stance)
);
CREATE TABLE assertion_review (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  assertion_id uuid NOT NULL REFERENCES assertion(id),
  decision text NOT NULL CHECK (decision IN ('accepted','rejected','needs_review')),
  reviewer text NOT NULL,
  rationale text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE attribute_claim (
  assertion_id uuid PRIMARY KEY REFERENCES assertion(id),
  value_json jsonb NOT NULL CHECK (jsonb_typeof(value_json) IN ('string','number','boolean','object','array'))
  -- Date values: {earliest,latest,precision,basis}; statuses retain dimension and code.
);
CREATE TABLE unit_definition (
  code text PRIMARY KEY,
  dimension text NOT NULL,
  factor_to_base numeric NOT NULL CHECK (factor_to_base > 0)
);
CREATE TABLE metric_definition (
  code text PRIMARY KEY,
  dimension text NOT NULL,
  canonical_unit text NOT NULL REFERENCES unit_definition(code),
  description text NOT NULL
);
CREATE TABLE metric_claim (
  assertion_id uuid PRIMARY KEY REFERENCES assertion(id),
  metric_code text NOT NULL REFERENCES metric_definition(code),
  reported_value numeric NOT NULL CHECK (reported_value >= 0),
  reported_unit text NOT NULL REFERENCES unit_definition(code),
  normalized_value numeric NOT NULL,
  canonical_unit text NOT NULL REFERENCES unit_definition(code),
  scope_basis text NOT NULL,
  qualifier text NOT NULL DEFAULT 'reported' CHECK (qualifier IN ('reported','estimated','at_least','up_to'))
);
CREATE TABLE capital_claim (
  assertion_id uuid PRIMARY KEY REFERENCES assertion(id),
  amount_low numeric(24,2) NOT NULL CHECK (amount_low >= 0),
  amount_high numeric(24,2) NOT NULL CHECK (amount_high >= amount_low),
  currency_code text NOT NULL CHECK (currency_code ~ '^[A-Z]{3}$'),
  basis text NOT NULL CHECK (basis IN ('permit_work_valuation','site_investment','corporate_capex_plan','equity_raised','debt_committed','acquisition_consideration','lease_commitment','modeled_capex')),
  geographic_scope text NOT NULL CHECK (geographic_scope IN ('site','us_only','global','mixed','unknown')),
  spend_period daterange CHECK (spend_period IS NULL OR NOT isempty(spend_period)),
  price_basis text NOT NULL DEFAULT 'nominal_reported',
  inclusions jsonb NOT NULL DEFAULT '{}'::jsonb,
  aggregation_state text NOT NULL DEFAULT 'not_cleared' CHECK (aggregation_state IN ('not_cleared','scope_reviewed','nonadditive'))
  -- No default SUM view: reviewed scope != automatic permission to add.
);
CREATE TABLE company_relationship_claim (
  assertion_id uuid PRIMARY KEY REFERENCES assertion(id),
  child_entity_id uuid NOT NULL REFERENCES company_entity(id),
  parent_entity_id uuid NOT NULL REFERENCES company_entity(id),
  relationship_kind text NOT NULL CHECK (relationship_kind IN ('equity_owner','voting_owner','controls','consolidates','managed_by')),
  economic_percent numeric(7,4) CHECK (economic_percent BETWEEN 0 AND 100),
  voting_percent numeric(7,4) CHECK (voting_percent BETWEEN 0 AND 100),
  share_class text,
  denominator_basis text,
  CHECK (child_entity_id <> parent_entity_id)
  -- Equity owners can be multiple. controls is explicit evidence, not a >50% heuristic.
);
CREATE TABLE participation_claim (
  assertion_id uuid PRIMARY KEY REFERENCES assertion(id),
  entity_id uuid NOT NULL REFERENCES company_entity(id),
  target_id uuid NOT NULL REFERENCES tracked_object(id),
  role text NOT NULL CHECK (role IN ('landowner','asset_owner','developer','operator','tenant','applicant','contractor','lender','sponsor','registered_agent')),
  ownership_percent numeric(7,4) CHECK (ownership_percent BETWEEN 0 AND 100)
);

-- Accepted projections are bitemporal. Never overwrite old values to repair history.
CREATE TABLE fact_selection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES tracked_object(id),
  predicate text NOT NULL,
  slot_key text NOT NULL DEFAULT 'default',
  assertion_id uuid NOT NULL,
  valid_during daterange NOT NULL CHECK (NOT isempty(valid_during)),
  valid_time_basis text NOT NULL CHECK (valid_time_basis IN ('evidenced','observed_asof','inferred_carry_forward')),
  system_during tstzrange NOT NULL DEFAULT tstzrange(clock_timestamp(),NULL,'[)'),
  policy_version text NOT NULL,
  selected_by text NOT NULL,
  FOREIGN KEY (assertion_id,subject_id,predicate) REFERENCES assertion(id,subject_id,predicate),
  CHECK (NOT isempty(system_during) AND NOT lower_inf(system_during) AND lower_inc(system_during) AND NOT upper_inc(system_during)),
  EXCLUDE USING gist (subject_id WITH =, predicate WITH =, slot_key WITH =,
                     valid_during WITH &&, system_during WITH &&)
    DEFERRABLE INITIALLY IMMEDIATE
);
CREATE TABLE capital_claim_link (
  from_assertion_id uuid NOT NULL REFERENCES capital_claim(assertion_id),
  to_assertion_id uuid NOT NULL REFERENCES capital_claim(assertion_id),
  relation text NOT NULL CHECK (relation IN ('contains','overlaps','duplicates','replaces')),
  evidence_id uuid NOT NULL REFERENCES evidence(id),
  PRIMARY KEY (from_assertion_id,to_assertion_id,relation),
  CHECK (from_assertion_id <> to_assertion_id)
);
CREATE TABLE review_issue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES tracked_object(id),
  source_record_id uuid REFERENCES source_record(id),
  issue_kind text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','dismissed')),
  proposed_match_id uuid REFERENCES tracked_object(id),
  details jsonb NOT NULL,
  resolution text,
  opened_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  resolved_at timestamptz
);
CREATE TABLE merge_decision (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_object_id uuid NOT NULL REFERENCES tracked_object(id),
  into_object_id uuid NOT NULL REFERENCES tracked_object(id),
  evidence_id uuid NOT NULL REFERENCES evidence(id),
  reviewer text NOT NULL,
  rationale text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CHECK (from_object_id <> into_object_id)
);
CREATE TABLE change_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES tracked_object(id),
  event_type text NOT NULL,
  event_date date,
  observed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  old_selection_id uuid REFERENCES fact_selection(id),
  new_selection_id uuid REFERENCES fact_selection(id),
  evidence_id uuid NOT NULL REFERENCES evidence(id),
  dedupe_key text NOT NULL UNIQUE,
  emit_alert boolean NOT NULL DEFAULT false,
  details jsonb NOT NULL
);
CREATE TABLE notification_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES change_event(id),
  destination_key text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','leased','sent','failed')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_attempt_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  lease_until timestamptz,
  provider_message_id text,
  last_error text,
  UNIQUE (event_id,destination_key)
  -- At-least-once delivery; use provider idempotency when supported.
);
CREATE TABLE export_run (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  valid_as_of date NOT NULL,
  known_as_of timestamptz NOT NULL,
  policy_version text NOT NULL,
  database_snapshot_reference text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  artifact_manifest jsonb NOT NULL,
  coverage_manifest jsonb NOT NULL
);

INSERT INTO predicate_definition VALUES
 ('project.classification','attribute','Evidence-backed project classification'),
 ('entity.control_resolution','attribute','Explicit controller-resolution state; absence of edges is unknown'),
 ('name.legal','attribute','Historical legal name; object label is a display cache'),
 ('name.project','attribute','Historical project name'),
 ('location.address','attribute','Evidence-backed address with location precision'),
 ('purpose','attribute','Stated workload; unknown is not AI'),
 ('status.entitlement','attribute','Entitlement state, independently of construction'),
 ('status.construction','attribute','Construction state; permit issued is not construction begun'),
 ('status.power','attribute','Power-service state'),
 ('status.operations','attribute','Commissioning and operating state'),
 ('case.status','attribute','Normalized case state plus raw source status'),
 ('date.announcement','attribute','Date range, precision and actual/expected/reported basis'),
 ('date.construction_start','attribute','Actual or expected construction-start date'),
 ('date.occupancy','attribute','Date range, precision and actual/expected/reported basis'),
 ('date.operational','attribute','Actual or expected operation milestone'),
 ('date.expected_completion','attribute','Forecast completion range, not actual completion'),
 ('measurement','metric','Dimension-checked metric with explicit scope'),
 ('capital.amount','capital','Scoped capital or financing claim'),
 ('entity.relationship','relationship','Directed parent/owner/control claim'),
 ('entity.participation','participation','Entity role at a site, parcel, building or case');
INSERT INTO unit_definition VALUES ('MW','power',1),('kW','power',0.001),('sqm','area',1),('sqft','area',0.09290304),('acre','area',4046.8564224);
INSERT INTO metric_definition VALUES
 ('power.it_planned','power','MW','Planned IT load'),
 ('power.it_operational','power','MW','Operational IT load'),
 ('power.facility_total','power','MW','Total facility load'),
 ('power.utility_requested','power','MW','Requested utility service'),
 ('power.utility_contracted','power','MW','Contracted service where evidenced'),
 ('power.energized','power','MW','Energized service where evidenced'),
 ('power.generator_nameplate','power','MW','Generator nameplate, not IT load'),
 ('area.gfa_planned','area','sqm','Planned gross floor area'),
 ('area.gfa_permitted','area','sqm','Permitted gross floor area'),
 ('area.gfa_completed','area','sqm','Completed gross floor area');

-- Integrity and projection procedures.
CREATE FUNCTION prevent_ledger_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION '% is append-only; supersede with new records', TG_TABLE_NAME USING ERRCODE='23514'; END $$;
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['source_record_version','record_observation','evidence','assertion','assertion_evidence','assertion_review','attribute_claim','metric_claim','capital_claim','company_relationship_claim','participation_claim','capital_claim_link','merge_decision','change_event'] LOOP
  EXECUTE format('CREATE TRIGGER immutable_%I BEFORE UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION prevent_ledger_mutation()',t,t);
 END LOOP;
END $$;

CREATE FUNCTION check_checkpoint() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE r ingestion_run; old_run ingestion_run; BEGIN
 SELECT * INTO STRICT r FROM ingestion_run WHERE id=NEW.committed_run_id;
 IF r.status <> 'succeeded' OR NOT r.coverage_complete OR r.scope_key <> NEW.scope_key THEN
  RAISE EXCEPTION 'Checkpoint requires a complete successful run for the same scope' USING ERRCODE='23514';
 END IF;
 IF TG_OP='INSERT' AND NEW.revision<>1 THEN
  RAISE EXCEPTION 'Initial checkpoint revision must be one' USING ERRCODE='23514';
 END IF;
 IF TG_OP='UPDATE' AND NEW.revision <> OLD.revision+1 THEN
  RAISE EXCEPTION 'Checkpoint revision must advance exactly once' USING ERRCODE='23514';
 END IF;
 IF TG_OP='UPDATE' THEN
  SELECT * INTO STRICT old_run FROM ingestion_run WHERE id=OLD.committed_run_id;
  IF NEW.committed_run_id=OLD.committed_run_id OR r.started_at<=old_run.started_at THEN
   RAISE EXCEPTION 'Checkpoint replacement must use a later successful run' USING ERRCODE='23514';
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER checkpoint_guard BEFORE INSERT OR UPDATE ON feed_checkpoint FOR EACH ROW EXECUTE FUNCTION check_checkpoint();
CREATE TRIGGER checkpoint_no_delete BEFORE DELETE ON feed_checkpoint FOR EACH ROW EXECUTE FUNCTION prevent_ledger_mutation();

CREATE FUNCTION freeze_finished_run() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='DELETE' OR OLD.status<>'running' THEN
  RAISE EXCEPTION 'Finished ingestion runs are immutable; start a new run' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER finished_run_guard BEFORE UPDATE OR DELETE ON ingestion_run FOR EACH ROW EXECUTE FUNCTION freeze_finished_run();

CREATE FUNCTION check_case_namespace() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF (SELECT authority_id FROM case_namespace WHERE id=NEW.namespace_id) IS DISTINCT FROM
    (SELECT authority_id FROM regulatory_case WHERE id=NEW.case_id) THEN
  RAISE EXCEPTION 'Case identifier belongs to another issuing authority' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER namespace_guard BEFORE INSERT OR UPDATE ON case_identifier FOR EACH ROW EXECUTE FUNCTION check_case_namespace();

CREATE FUNCTION normalize_metric() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE m metric_definition; u unit_definition; base unit_definition; BEGIN
 SELECT * INTO STRICT m FROM metric_definition WHERE code=NEW.metric_code;
 SELECT * INTO STRICT u FROM unit_definition WHERE code=NEW.reported_unit;
 SELECT * INTO STRICT base FROM unit_definition WHERE code=m.canonical_unit;
 IF u.dimension <> m.dimension OR base.dimension <> m.dimension THEN
  RAISE EXCEPTION 'Incompatible metric and unit dimensions' USING ERRCODE='23514';
 END IF;
 NEW.normalized_value := NEW.reported_value*u.factor_to_base/base.factor_to_base;
 NEW.canonical_unit := m.canonical_unit;
 RETURN NEW;
END $$;
CREATE TRIGGER metric_normalization BEFORE INSERT ON metric_claim FOR EACH ROW EXECUTE FUNCTION normalize_metric();

CREATE FUNCTION check_assertion_payload() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE k text; count_payload integer; valid_payload boolean; BEGIN
 SELECT storage_kind INTO STRICT k FROM predicate_definition WHERE code=NEW.predicate;
 SELECT (SELECT count(*) FROM attribute_claim WHERE assertion_id=NEW.id)
      + (SELECT count(*) FROM metric_claim WHERE assertion_id=NEW.id)
      + (SELECT count(*) FROM capital_claim WHERE assertion_id=NEW.id)
      + (SELECT count(*) FROM company_relationship_claim WHERE assertion_id=NEW.id)
      + (SELECT count(*) FROM participation_claim WHERE assertion_id=NEW.id) INTO count_payload;
 valid_payload := CASE k
   WHEN 'attribute' THEN EXISTS(SELECT 1 FROM attribute_claim WHERE assertion_id=NEW.id)
   WHEN 'metric' THEN EXISTS(SELECT 1 FROM metric_claim WHERE assertion_id=NEW.id)
   WHEN 'capital' THEN EXISTS(SELECT 1 FROM capital_claim WHERE assertion_id=NEW.id)
   WHEN 'relationship' THEN EXISTS(SELECT 1 FROM company_relationship_claim WHERE assertion_id=NEW.id AND child_entity_id=NEW.subject_id)
   WHEN 'participation' THEN EXISTS(SELECT 1 FROM participation_claim WHERE assertion_id=NEW.id AND target_id=NEW.subject_id)
   ELSE false END;
 IF count_payload<>1 OR NOT valid_payload THEN
  RAISE EXCEPTION 'Assertion must have exactly one compatible typed payload' USING ERRCODE='23514';
 END IF;
 RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER assertion_payload_guard AFTER INSERT ON assertion
 DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_assertion_payload();

CREATE FUNCTION check_subtype_payload() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE a assertion; k text; wanted text; BEGIN
 SELECT * INTO STRICT a FROM assertion WHERE id=NEW.assertion_id;
 SELECT storage_kind INTO STRICT k FROM predicate_definition WHERE code=a.predicate;
 wanted := CASE TG_TABLE_NAME WHEN 'attribute_claim' THEN 'attribute' WHEN 'metric_claim' THEN 'metric'
 WHEN 'capital_claim' THEN 'capital' WHEN 'company_relationship_claim' THEN 'relationship' WHEN 'participation_claim' THEN 'participation' END;
 IF k<>wanted THEN RAISE EXCEPTION 'Wrong typed payload for predicate' USING ERRCODE='23514'; END IF;
 IF TG_TABLE_NAME='company_relationship_claim' AND (to_jsonb(NEW)->>'child_entity_id')::uuid<>a.subject_id THEN
  RAISE EXCEPTION 'Relationship subject must be the child entity' USING ERRCODE='23514';
 END IF;
 IF TG_TABLE_NAME='participation_claim' THEN
  IF (to_jsonb(NEW)->>'target_id')::uuid<>a.subject_id OR
     (SELECT kind FROM tracked_object WHERE id=a.subject_id)='entity' THEN
   RAISE EXCEPTION 'Participation subject must be a non-entity target' USING ERRCODE='23514';
  END IF;
 END IF;
 RETURN NEW;
END $$;
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['attribute_claim','metric_claim','capital_claim','company_relationship_claim','participation_claim'] LOOP
  EXECUTE format('CREATE TRIGGER typed_%I BEFORE INSERT ON %I FOR EACH ROW EXECUTE FUNCTION check_subtype_payload()',t,t);
 END LOOP;
END $$;

CREATE FUNCTION check_selection() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE a assertion; decision text; expected_slot text; BEGIN
 IF TG_OP='UPDATE' THEN
  IF (to_jsonb(NEW)-'system_during') IS DISTINCT FROM (to_jsonb(OLD)-'system_during') OR
     NOT upper_inf(OLD.system_during) OR upper_inf(NEW.system_during) OR
     lower(OLD.system_during) IS DISTINCT FROM lower(NEW.system_during) OR
     upper(NEW.system_during) <= lower(NEW.system_during) THEN
   RAISE EXCEPTION 'Only closing an open system interval is allowed' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
 END IF;
 IF NOT upper_inf(NEW.system_during) THEN
  RAISE EXCEPTION 'New selections must have open knowledge intervals; close them separately' USING ERRCODE='23514';
 END IF;
 SELECT * INTO STRICT a FROM assertion WHERE id=NEW.assertion_id;
 SELECT r.decision INTO decision FROM assertion_review r WHERE r.assertion_id=a.id
   AND r.recorded_at<=lower(NEW.system_during) ORDER BY r.recorded_at DESC,r.id DESC LIMIT 1;
 IF decision IS DISTINCT FROM 'accepted' OR NOT EXISTS
   (SELECT 1 FROM assertion_evidence ae JOIN evidence e ON e.id=ae.evidence_id
    JOIN source_record_version v ON v.id=e.version_id
    WHERE ae.assertion_id=a.id AND ae.stance='supports'
      AND ae.recorded_at<=lower(NEW.system_during)
      AND e.created_at<=lower(NEW.system_during)
      AND v.retrieved_at<=lower(NEW.system_during)) THEN
  RAISE EXCEPTION 'Selection needs supporting evidence and acceptance at knowledge time' USING ERRCODE='23514';
 END IF;
 IF lower(NEW.system_during)<a.first_recorded_at THEN
  RAISE EXCEPTION 'Selection cannot predate recorded knowledge' USING ERRCODE='23514';
 END IF;
 IF NEW.valid_time_basis='evidenced' AND (a.valid_during IS NULL OR NOT (NEW.valid_during <@ a.valid_during)) THEN
  RAISE EXCEPTION 'Selected effective period exceeds evidenced validity' USING ERRCODE='23514';
 END IF;
 IF NEW.valid_time_basis='observed_asof' AND
   (lower_inf(NEW.valid_during) OR upper_inf(NEW.valid_during) OR upper(NEW.valid_during)-lower(NEW.valid_during)<>1) THEN
  RAISE EXCEPTION 'Observed-asof validity must be a single calendar day' USING ERRCODE='23514';
 END IF;
 expected_slot := 'default';
 IF a.predicate='measurement' THEN SELECT metric_code INTO expected_slot FROM metric_claim WHERE assertion_id=a.id;
 ELSIF a.predicate='capital.amount' THEN expected_slot := a.id::text; -- multiple scoped disclosures; not auto-added
 ELSIF a.predicate='entity.relationship' THEN
   SELECT relationship_kind||':'||parent_entity_id::text||':'||coalesce(share_class,'all') INTO expected_slot
   FROM company_relationship_claim WHERE assertion_id=a.id;
 ELSIF a.predicate='entity.participation' THEN
   SELECT role||':'||entity_id::text INTO expected_slot FROM participation_claim WHERE assertion_id=a.id;
 END IF;
 IF NEW.slot_key IS DISTINCT FROM expected_slot THEN
  RAISE EXCEPTION 'Invalid slot: expected %',expected_slot USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER selection_guard BEFORE INSERT OR UPDATE ON fact_selection FOR EACH ROW EXECUTE FUNCTION check_selection();
CREATE TRIGGER selection_no_delete BEFORE DELETE ON fact_selection FOR EACH ROW EXECUTE FUNCTION prevent_ledger_mutation();

CREATE FUNCTION apply_review_retraction() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.recorded_at<(SELECT first_recorded_at FROM assertion WHERE id=NEW.assertion_id) OR EXISTS
   (SELECT 1 FROM assertion_review r WHERE r.assertion_id=NEW.assertion_id AND r.id<>NEW.id AND r.recorded_at>NEW.recorded_at) THEN
  RAISE EXCEPTION 'Reviews must follow assertion knowledge and prior reviews' USING ERRCODE='23514';
 END IF;
 IF NEW.decision<>'accepted' THEN
  IF EXISTS(SELECT 1 FROM fact_selection WHERE assertion_id=NEW.assertion_id
    AND upper_inf(system_during) AND lower(system_during)>=NEW.recorded_at) THEN
   RAISE EXCEPTION 'Retraction must follow the selected knowledge interval start' USING ERRCODE='23514';
  END IF;
  UPDATE fact_selection SET system_during=tstzrange(lower(system_during),NEW.recorded_at,'[)')
   WHERE assertion_id=NEW.assertion_id AND upper_inf(system_during);
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER review_retraction AFTER INSERT ON assertion_review FOR EACH ROW EXECUTE FUNCTION apply_review_retraction();

-- Canonical controls must not cycle at any jointly overlapping valid/system time.
-- A global transaction lock deliberately serializes rare control-graph edits.
CREATE FUNCTION lock_control_graph() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.predicate='entity.relationship' AND EXISTS
   (SELECT 1 FROM company_relationship_claim WHERE assertion_id=NEW.assertion_id AND relationship_kind='controls') THEN
  PERFORM pg_advisory_xact_lock(764391021);
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER control_write_lock BEFORE INSERT OR UPDATE ON fact_selection FOR EACH ROW EXECUTE FUNCTION lock_control_graph();
CREATE FUNCTION reject_control_cycle() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE c company_relationship_claim; bad boolean; BEGIN
 IF NEW.predicate<>'entity.relationship' THEN RETURN NULL; END IF;
 SELECT * INTO c FROM company_relationship_claim WHERE assertion_id=NEW.assertion_id;
 IF c.relationship_kind<>'controls' THEN RETURN NULL; END IF;
 -- Read FINAL selection state, since an interval may have been closed after NEW was inserted.
 WITH RECURSIVE walk(node,vr,sr,path) AS (
  SELECT c.parent_entity_id,f.valid_during,f.system_during,ARRAY[c.child_entity_id,c.parent_entity_id]
    FROM fact_selection f WHERE f.id=NEW.id
  UNION ALL
  SELECT edge.parent_entity_id,w.vr*f.valid_during,w.sr*f.system_during,w.path||edge.parent_entity_id
    FROM walk w JOIN company_relationship_claim edge ON edge.child_entity_id=w.node AND edge.relationship_kind='controls'
    JOIN fact_selection f ON f.assertion_id=edge.assertion_id
    WHERE w.vr && f.valid_during AND w.sr && f.system_during
      AND (edge.parent_entity_id=c.child_entity_id OR NOT edge.parent_entity_id=ANY(w.path))
      AND w.node<>c.child_entity_id
 ) SELECT EXISTS(SELECT 1 FROM walk WHERE node=c.child_entity_id) INTO bad;
 IF bad THEN RAISE EXCEPTION 'Selected control graph contains a temporal cycle' USING ERRCODE='23514'; END IF;
 RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER control_cycle_guard AFTER INSERT ON fact_selection
 DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION reject_control_cycle();

CREATE FUNCTION check_redirect() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE bad boolean; BEGIN
 IF NEW.redirect_id IS NULL THEN RETURN NEW; END IF;
 PERFORM pg_advisory_xact_lock(764391022);
 WITH RECURSIVE redirects(id,path) AS (
  SELECT NEW.redirect_id,ARRAY[NEW.redirect_id]
  UNION ALL SELECT t.redirect_id,r.path||t.redirect_id FROM redirects r JOIN tracked_object t ON t.id=r.id
  WHERE t.redirect_id IS NOT NULL AND NOT t.redirect_id=ANY(r.path)
 ) SELECT EXISTS(SELECT 1 FROM redirects WHERE id=NEW.id) INTO bad;
 IF bad THEN RAISE EXCEPTION 'Identity redirect cycle' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER redirect_guard BEFORE INSERT OR UPDATE ON tracked_object FOR EACH ROW EXECUTE FUNCTION check_redirect();

-- Object registry/subtype integrity at commit. Insert registry and subtype in one transaction.
CREATE FUNCTION check_object_subtype() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE found boolean; obj tracked_object; table_name text; BEGIN
 SELECT * INTO obj FROM tracked_object WHERE id=NEW.id;
 table_name := CASE obj.kind WHEN 'entity' THEN 'company_entity' WHEN 'case' THEN 'regulatory_case' ELSE obj.kind END;
 EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE id=$1)',table_name) INTO found USING obj.id;
 IF NOT found THEN RAISE EXCEPTION 'Object requires a % subtype row',obj.kind USING ERRCODE='23514'; END IF;
 RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER object_subtype_guard AFTER INSERT ON tracked_object
 DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_object_subtype();

DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['tracked_object','project','phase','building','parcel','company_entity','regulatory_case'] LOOP
  EXECUTE format('CREATE TRIGGER no_delete_%I BEFORE DELETE ON %I FOR EACH ROW EXECUTE FUNCTION prevent_ledger_mutation()',t,t);
END LOOP;
END $$;

CREATE FUNCTION guard_identity_columns() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE column_name text; BEGIN
 FOREACH column_name IN ARRAY TG_ARGV LOOP
  IF (to_jsonb(NEW)->column_name) IS DISTINCT FROM (to_jsonb(OLD)->column_name) THEN
   RAISE EXCEPTION '% identity column % is immutable',TG_TABLE_NAME,column_name USING ERRCODE='23514';
  END IF;
 END LOOP;
 RETURN NEW;
END $$;
CREATE TRIGGER source_identity_guard BEFORE UPDATE ON source_record FOR EACH ROW
 EXECUTE FUNCTION guard_identity_columns('id','feed_id','collection_epoch','native_key','first_seen_at');
CREATE TRIGGER case_identity_guard BEFORE UPDATE ON regulatory_case FOR EACH ROW
 EXECUTE FUNCTION guard_identity_columns('id','authority_id');
CREATE TRIGGER namespace_identity_guard BEFORE UPDATE ON case_namespace FOR EACH ROW
 EXECUTE FUNCTION guard_identity_columns('id','authority_id','namespace_key','normalization_policy');
CREATE TRIGGER building_identity_guard BEFORE UPDATE ON building FOR EACH ROW
 EXECUTE FUNCTION guard_identity_columns('id','project_id');
CREATE TRIGGER phase_identity_guard BEFORE UPDATE ON phase FOR EACH ROW
 EXECUTE FUNCTION guard_identity_columns('id','project_id');
CREATE TRIGGER object_identity_guard BEFORE UPDATE ON tracked_object FOR EACH ROW
 EXECUTE FUNCTION guard_identity_columns('id','kind','created_at');
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['entity_identifier_namespace','entity_identifier','case_identifier','unit_definition','metric_definition','predicate_definition'] LOOP
  EXECUTE format('CREATE TRIGGER semantic_%I BEFORE UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION prevent_ledger_mutation()',t,t);
 END LOOP;
END $$;

-- Operational indexes. GiST exclusion indexes already cover temporal slot lookup.
CREATE INDEX source_version_time ON source_record_version(source_record_id,retrieved_at DESC);
CREATE INDEX source_record_feed ON source_record(feed_id);
CREATE INDEX run_health ON ingestion_run(feed_id,started_at DESC);
CREATE INDEX observation_record ON record_observation(source_record_id,observed_at DESC);
CREATE INDEX evidence_version ON evidence(version_id);
CREATE INDEX assertion_subject ON assertion(subject_id,predicate,first_recorded_at DESC);
CREATE INDEX review_latest ON assertion_review(assertion_id,recorded_at DESC,id DESC);
CREATE INDEX selection_assertion ON fact_selection(assertion_id);
CREATE INDEX selected_current ON fact_selection(subject_id,predicate) WHERE upper_inf(system_during);
CREATE INDEX relationship_child ON company_relationship_claim(child_entity_id,relationship_kind);
CREATE INDEX relationship_parent ON company_relationship_claim(parent_entity_id,relationship_kind);
CREATE INDEX participation_entity ON participation_claim(entity_id,role);
CREATE INDEX alias_lookup ON object_alias(normalized_alias);
CREATE INDEX case_target_lookup ON case_target(target_id);
CREATE INDEX project_parcel_lookup ON project_parcel(parcel_id);
CREATE INDEX review_open ON review_issue(opened_at) WHERE status='open';
CREATE INDEX outbox_due ON notification_outbox(next_attempt_at) WHERE status IN ('pending','failed');
CREATE INDEX event_time ON change_event(observed_at DESC);

CREATE VIEW v_source_health AS
 SELECT s.id,s.name,s.access_status,s.expected_refresh,
   max(r.finished_at) FILTER(WHERE r.status='succeeded') AS last_success_at,
   max(r.started_at) AS last_attempt_at,
   (array_agg(r.status ORDER BY r.started_at DESC) FILTER(WHERE r.id IS NOT NULL))[1] AS last_run_status
 FROM source_feed s LEFT JOIN ingestion_run r ON r.feed_id=s.id GROUP BY s.id;
CREATE VIEW v_current_facts AS
 SELECT f.*,o.kind,o.label FROM fact_selection f JOIN tracked_object o ON o.id=f.subject_id
 WHERE f.system_during @> statement_timestamp() AND f.valid_during @> CURRENT_DATE
   AND o.identity_state<>'merged';
CREATE VIEW v_current_controls AS
 SELECT f.subject_id AS child_entity_id,c.parent_entity_id,f.valid_during,f.system_during,
        f.valid_time_basis,f.id AS selection_id,c.assertion_id
 FROM v_current_facts f JOIN company_relationship_claim c ON c.assertion_id=f.assertion_id
 WHERE c.relationship_kind='controls';

-- Cycle-safe paths, not a misleading single 'ultimate parent' column.
CREATE FUNCTION control_paths(p_child uuid,p_valid_date date,p_known_at timestamptz,p_max_depth integer DEFAULT 32)
RETURNS TABLE (ancestor_id uuid,depth integer,entity_path uuid[],selection_path uuid[],terminal_reason text)
LANGUAGE sql STABLE AS $$
 WITH RECURSIVE edges AS (
  SELECT c.child_entity_id,c.parent_entity_id,f.id FROM company_relationship_claim c
  JOIN fact_selection f ON f.assertion_id=c.assertion_id
  WHERE c.relationship_kind='controls' AND f.valid_time_basis<>'inferred_carry_forward'
    AND f.valid_during @> p_valid_date AND f.system_during @> p_known_at
 ), walk(node,depth,path,sels) AS (
  SELECT p_child,0,ARRAY[p_child],ARRAY[]::uuid[]
  UNION ALL SELECT e.parent_entity_id,w.depth+1,w.path||e.parent_entity_id,w.sels||e.id
   FROM walk w JOIN edges e ON e.child_entity_id=w.node
   WHERE w.depth<least(greatest(p_max_depth,1),128) AND NOT e.parent_entity_id=ANY(w.path)
 ) SELECT w.node,w.depth,w.path,w.sels,
   CASE WHEN w.depth>=least(greatest(p_max_depth,1),128) THEN 'depth_limit'
        WHEN NOT EXISTS(SELECT 1 FROM edges e WHERE e.child_entity_id=w.node) THEN 'no_further_evidenced_parent'
        ELSE 'intermediate' END
 FROM walk w WHERE w.depth>0
$$;

-- No grants are made. Production must split owner, ingest, reviewer, export and notifier roles.
-- Revoke direct DELETE on canonical tables and direct ledger UPDATE/DELETE from runtime roles.
-- Structural aliases/links are current identity metadata, not fully bitemporal fact history.
COMMIT;
