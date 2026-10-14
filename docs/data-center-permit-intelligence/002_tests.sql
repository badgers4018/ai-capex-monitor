-- Synthetic fixtures ONLY. No real companies, permits, or investment data.
-- Run AFTER 001_schema.sql in a disposable database. All fixtures are rolled back.
\set ON_ERROR_STOP on
BEGIN;
SET search_path=dc,public;
CREATE TEMP TABLE test_result(name text PRIMARY KEY);
CREATE FUNCTION pg_temp.ok(condition boolean, name text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF condition IS DISTINCT FROM true THEN RAISE EXCEPTION 'FAIL: %',name; END IF;
 INSERT INTO test_result VALUES(name); RAISE NOTICE 'PASS: %',name;
END $$;

INSERT INTO jurisdiction(id,name,jurisdiction_type) VALUES
 ('00000000-0000-0000-0000-000000000001','TEST County A','county'),
 ('00000000-0000-0000-0000-000000000002','TEST County B','county');
INSERT INTO authority(id,name,authority_type) VALUES
 ('00000000-0000-0000-0000-000000000011','TEST Authority A','building'),
 ('00000000-0000-0000-0000-000000000012','TEST Authority B','building');
INSERT INTO source_feed(id,name,publisher,feed_type,endpoint_url) VALUES
 ('00000000-0000-0000-0000-000000000021','TEST Feed A','synthetic','manual','https://example.invalid/a'),
 ('00000000-0000-0000-0000-000000000022','TEST Feed B','synthetic','manual','https://example.invalid/b');
INSERT INTO source_record(id,feed_id,native_key,record_kind,original_url) VALUES
 ('00000000-0000-0000-0000-000000000031','00000000-0000-0000-0000-000000000021','same-key','test','https://example.invalid/a/1'),
 ('00000000-0000-0000-0000-000000000032','00000000-0000-0000-0000-000000000022','same-key','test','https://example.invalid/b/1');
INSERT INTO source_record_version(id,source_record_id,revision,content_sha256,payload,retrieved_at) VALUES
 ('00000000-0000-0000-0000-000000000041','00000000-0000-0000-0000-000000000031',1,repeat('a',64),'{}','2024-01-01Z'),
 ('00000000-0000-0000-0000-000000000042','00000000-0000-0000-0000-000000000031',2,repeat('b',64),'{}','2024-01-02Z'),
 ('00000000-0000-0000-0000-000000000043','00000000-0000-0000-0000-000000000031',3,repeat('a',64),'{}','2024-01-03Z');
INSERT INTO evidence(id,version_id,quotation,created_at) VALUES
 ('00000000-0000-0000-0000-000000000051','00000000-0000-0000-0000-000000000041','TEST-only evidence, not a real source claim','2024-01-01Z');
INSERT INTO tracked_object(id,kind,label,identity_state) VALUES
 ('00000000-0000-0000-0000-000000000101','project','TEST Campus A','confirmed'),
 ('00000000-0000-0000-0000-000000000102','project','TEST Campus B','confirmed'),
 ('00000000-0000-0000-0000-000000000111','phase','TEST Phase A','confirmed'),
 ('00000000-0000-0000-0000-000000000121','building','TEST Building 1','confirmed'),
 ('00000000-0000-0000-0000-000000000122','building','TEST Building 2','confirmed'),
 ('00000000-0000-0000-0000-000000000201','entity','TEST Site LLC','confirmed'),
 ('00000000-0000-0000-0000-000000000202','entity','TEST Parent A','confirmed'),
 ('00000000-0000-0000-0000-000000000203','entity','TEST Parent B','confirmed'),
 ('00000000-0000-0000-0000-000000000204','entity','TEST Top Parent','confirmed'),
 ('00000000-0000-0000-0000-000000000301','case','TEST Permit A','confirmed'),
 ('00000000-0000-0000-0000-000000000302','case','TEST Permit B','confirmed');
INSERT INTO project(id) VALUES ('00000000-0000-0000-0000-000000000101'),('00000000-0000-0000-0000-000000000102');
INSERT INTO phase(id,project_id,phase_key) VALUES ('00000000-0000-0000-0000-000000000111','00000000-0000-0000-0000-000000000101','p1');
INSERT INTO building(id,project_id,phase_id,internal_building_key) VALUES
 ('00000000-0000-0000-0000-000000000121','00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000111','b1'),
 ('00000000-0000-0000-0000-000000000122','00000000-0000-0000-0000-000000000101',NULL,'b2');
INSERT INTO company_entity(id,entity_type) VALUES
 ('00000000-0000-0000-0000-000000000201','llc'),('00000000-0000-0000-0000-000000000202','corporation'),
 ('00000000-0000-0000-0000-000000000203','corporation'),('00000000-0000-0000-0000-000000000204','corporation');
INSERT INTO regulatory_case(id,authority_id,case_family) VALUES
 ('00000000-0000-0000-0000-000000000301','00000000-0000-0000-0000-000000000011','building'),
 ('00000000-0000-0000-0000-000000000302','00000000-0000-0000-0000-000000000012','building');
INSERT INTO case_namespace(id,authority_id,namespace_key,normalization_policy) VALUES
 ('00000000-0000-0000-0000-000000000061','00000000-0000-0000-0000-000000000011','building-2026','preserve punctuation; normalize case'),
 ('00000000-0000-0000-0000-000000000062','00000000-0000-0000-0000-000000000012','building-2026','preserve punctuation; normalize case');
INSERT INTO case_identifier VALUES
 ('00000000-0000-0000-0000-000000000061','BP-001','BP-001','00000000-0000-0000-0000-000000000301','00000000-0000-0000-0000-000000000051'),
 ('00000000-0000-0000-0000-000000000062','BP-001','BP-001','00000000-0000-0000-0000-000000000302','00000000-0000-0000-0000-000000000051');
SET CONSTRAINTS ALL IMMEDIATE;
SELECT pg_temp.ok((SELECT count(*)=2 FROM source_record WHERE native_key='same-key'),'source IDs are scoped by feed');
SELECT pg_temp.ok((SELECT count(*)=3 FROM source_record_version),'A to B to A creates three revisions');
SELECT pg_temp.ok((SELECT count(*)=2 FROM case_identifier WHERE normalized_value='BP-001'),'same permit number in different authorities is allowed');
SELECT pg_temp.ok((SELECT count(*)=2 FROM building WHERE project_id='00000000-0000-0000-0000-000000000101'),'campus and building grains stay separate');
DO $$ BEGIN
 BEGIN INSERT INTO case_identifier VALUES('00000000-0000-0000-0000-000000000061','BP-001','BP-001','00000000-0000-0000-0000-000000000301','00000000-0000-0000-0000-000000000051');
 RAISE EXCEPTION 'FAIL duplicate namespace'; EXCEPTION WHEN unique_violation THEN PERFORM pg_temp.ok(true,'duplicate case identity is rejected'); END;
 BEGIN INSERT INTO case_identifier VALUES('00000000-0000-0000-0000-000000000061','OTHER','OTHER','00000000-0000-0000-0000-000000000302','00000000-0000-0000-0000-000000000051');
 RAISE EXCEPTION 'FAIL cross authority'; EXCEPTION WHEN check_violation THEN PERFORM pg_temp.ok(true,'case namespace must match issuing authority'); END;
 BEGIN UPDATE building SET project_id='00000000-0000-0000-0000-000000000102' WHERE id='00000000-0000-0000-0000-000000000121';
 RAISE EXCEPTION 'FAIL cross project'; EXCEPTION WHEN foreign_key_violation OR check_violation THEN PERFORM pg_temp.ok(true,'building cannot attach to another project phase'); END;
 BEGIN UPDATE source_record_version SET payload='{"changed":true}' WHERE id='00000000-0000-0000-0000-000000000041';
 RAISE EXCEPTION 'FAIL mutable raw version'; EXCEPTION WHEN check_violation THEN PERFORM pg_temp.ok(true,'raw versions are immutable'); END;
 BEGIN INSERT INTO tracked_object(kind,label) VALUES('building','TEST Orphan');
 RAISE EXCEPTION 'FAIL orphan object'; EXCEPTION WHEN check_violation THEN PERFORM pg_temp.ok(true,'object registry requires subtype'); END;
 BEGIN DELETE FROM building WHERE id='00000000-0000-0000-0000-000000000121';
 RAISE EXCEPTION 'FAIL deleted subtype'; EXCEPTION WHEN check_violation THEN PERFORM pg_temp.ok(true,'subtype deletion cannot orphan object registry'); END;
 BEGIN UPDATE regulatory_case SET authority_id='00000000-0000-0000-0000-000000000012' WHERE id='00000000-0000-0000-0000-000000000301';
 RAISE EXCEPTION 'FAIL changed authority'; EXCEPTION WHEN check_violation THEN PERFORM pg_temp.ok(true,'issuing authority cannot be rewritten'); END;
END $$;
INSERT INTO entity_identifier_namespace(id,namespace_key,identifier_kind,issuer_name,issuer_jurisdiction_id,normalization_policy) VALUES
 ('00000000-0000-0000-0000-000000000071','TEST-registry-A','state_registration','TEST Secretary A','00000000-0000-0000-0000-000000000001','exact'),
 ('00000000-0000-0000-0000-000000000072','TEST-registry-B','state_registration','TEST Secretary B','00000000-0000-0000-0000-000000000002','exact');
INSERT INTO entity_identifier VALUES
 ('00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000071','12345','12345','00000000-0000-0000-0000-000000000051'),
 ('00000000-0000-0000-0000-000000000202','00000000-0000-0000-0000-000000000072','12345','12345','00000000-0000-0000-0000-000000000051');
SELECT pg_temp.ok((SELECT count(*)=2 FROM entity_identifier WHERE normalized_value='12345'),'same company registry number in different issuers is allowed');

-- Helper constructs an accepted assertion with its typed payload atomically.
CREATE FUNCTION pg_temp.claim(s uuid,p text,v jsonb,vr daterange DEFAULT '[2025-01-01,)'::daterange)
RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE a uuid:=gen_random_uuid(); k text; BEGIN
 SET CONSTRAINTS assertion_payload_guard DEFERRED;
 INSERT INTO assertion(id,subject_id,predicate,valid_during,first_recorded_at,extraction_method,extractor_version,confidence,idempotency_key)
 VALUES(a,s,p,vr,'2024-01-01Z','analyst','test-v1','high',a::text);
 SELECT storage_kind INTO k FROM predicate_definition WHERE code=p;
 IF k='attribute' THEN INSERT INTO attribute_claim VALUES(a,v);
 ELSIF k='relationship' THEN INSERT INTO company_relationship_claim(assertion_id,child_entity_id,parent_entity_id,relationship_kind,economic_percent)
  VALUES(a,s,(v->>'parent')::uuid,v->>'kind',(v->>'percent')::numeric);
 ELSIF k='metric' THEN INSERT INTO metric_claim(assertion_id,metric_code,reported_value,reported_unit,normalized_value,canonical_unit,scope_basis)
  VALUES(a,v->>'metric',(v->>'value')::numeric,v->>'unit',0,'MW','TEST stated scope');
 ELSIF k='capital' THEN INSERT INTO capital_claim(assertion_id,amount_low,amount_high,currency_code,basis,geographic_scope)
  VALUES(a,(v->>'amount')::numeric,(v->>'amount')::numeric,'USD',v->>'basis',v->>'scope');
 ELSIF k='participation' THEN INSERT INTO participation_claim(assertion_id,entity_id,target_id,role)
  VALUES(a,(v->>'entity')::uuid,s,v->>'role'); END IF;
 INSERT INTO assertion_evidence(assertion_id,evidence_id,recorded_at) VALUES(a,'00000000-0000-0000-0000-000000000051','2024-01-02Z');
 INSERT INTO assertion_review(assertion_id,decision,reviewer,rationale,recorded_at) VALUES(a,'accepted','TEST reviewer','synthetic test','2024-01-02Z');
 SET CONSTRAINTS assertion_payload_guard IMMEDIATE;
 RETURN a;
END $$;
CREATE FUNCTION pg_temp.select_claim(a uuid,slot text,vr daterange,sr tstzrange DEFAULT '[2026-01-01,)'::tstzrange,basis text DEFAULT 'evidenced')
RETURNS uuid LANGUAGE plpgsql AS $$ DECLARE f uuid; BEGIN
 INSERT INTO fact_selection(subject_id,predicate,slot_key,assertion_id,valid_during,system_during,valid_time_basis,policy_version,selected_by)
 SELECT subject_id,predicate,slot,a,vr,sr,basis,'TEST policy','TEST reviewer' FROM assertion WHERE id=a RETURNING id INTO f;
 RETURN f;
END $$;
CREATE TEMP TABLE fixtures(key text PRIMARY KEY,id uuid);
INSERT INTO fixtures VALUES
 ('construction_old',pg_temp.claim('00000000-0000-0000-0000-000000000121','status.construction','"permitted"')),
 ('construction_new',pg_temp.claim('00000000-0000-0000-0000-000000000121','status.construction','"under_construction"'));
SELECT pg_temp.select_claim(id,'default','[2025-01-01,)') FROM fixtures WHERE key='construction_old';
DO $$ DECLARE a uuid; BEGIN
 SELECT id INTO a FROM fixtures WHERE key='construction_new';
 BEGIN PERFORM pg_temp.select_claim(a,'default','[2025-06-01,)');
 RAISE EXCEPTION 'FAIL overlapping selected facts'; EXCEPTION WHEN exclusion_violation THEN PERFORM pg_temp.ok(true,'conflicting selected temporal slots are rejected'); END;
 BEGIN PERFORM pg_temp.select_claim(a,'fake_slot','[2025-01-01,)');
 RAISE EXCEPTION 'FAIL slot bypass'; EXCEPTION WHEN check_violation THEN PERFORM pg_temp.ok(true,'arbitrary slots cannot bypass uniqueness'); END;
END $$;
UPDATE fact_selection SET system_during=tstzrange(lower(system_during),'2026-02-01Z','[)') WHERE assertion_id=(SELECT id FROM fixtures WHERE key='construction_old');
SELECT pg_temp.select_claim(id,'default','[2025-01-01,)','[2026-02-01,)') FROM fixtures WHERE key='construction_new';
SELECT pg_temp.ok((SELECT count(*)=1 FROM fact_selection WHERE subject_id='00000000-0000-0000-0000-000000000121' AND system_during @> '2026-01-15Z'::timestamptz),'knowledge-asof before correction sees old fact');
SELECT pg_temp.ok((SELECT count(*)=1 FROM fact_selection WHERE subject_id='00000000-0000-0000-0000-000000000121' AND system_during @> '2026-02-15Z'::timestamptz),'knowledge-asof after correction sees replacement fact');
DO $$ BEGIN
 BEGIN UPDATE fact_selection SET selected_by='overwrite' WHERE subject_id='00000000-0000-0000-0000-000000000121';
 RAISE EXCEPTION 'FAIL mutated selection'; EXCEPTION WHEN check_violation THEN PERFORM pg_temp.ok(true,'selected history cannot be overwritten'); END;
END $$;
INSERT INTO assertion_review(assertion_id,decision,reviewer,rationale,recorded_at)
 SELECT id,'rejected','TEST','later contradictory source','2026-03-01Z' FROM fixtures WHERE key='construction_new';
SELECT pg_temp.ok((SELECT count(*)=0 FROM fact_selection WHERE assertion_id=(SELECT id FROM fixtures WHERE key='construction_new') AND system_during @> '2026-03-02Z'::timestamptz),'rejected assertions stop appearing as current facts');
SELECT pg_temp.ok((SELECT count(*)=1 FROM fact_selection WHERE assertion_id=(SELECT id FROM fixtures WHERE key='construction_new') AND system_during @> '2026-02-15Z'::timestamptz),'review retraction preserves prior historical knowledge');

INSERT INTO fixtures VALUES
 ('ctrl_A',pg_temp.claim('00000000-0000-0000-0000-000000000201','entity.relationship','{"parent":"00000000-0000-0000-0000-000000000202","kind":"controls"}','[2025-01-01,2026-07-01)')),
 ('ctrl_B',pg_temp.claim('00000000-0000-0000-0000-000000000201','entity.relationship','{"parent":"00000000-0000-0000-0000-000000000203","kind":"controls"}','[2026-07-01,)')),
 ('ctrl_top',pg_temp.claim('00000000-0000-0000-0000-000000000202','entity.relationship','{"parent":"00000000-0000-0000-0000-000000000204","kind":"controls"}'));
SELECT pg_temp.select_claim(f.id,'controls:'||r.parent_entity_id::text||':all',a.valid_during)
 FROM fixtures f JOIN assertion a ON a.id=f.id JOIN company_relationship_claim r ON r.assertion_id=f.id WHERE f.key IN ('ctrl_A','ctrl_B','ctrl_top');
SELECT pg_temp.ok((SELECT count(*)=1 FROM control_paths('00000000-0000-0000-0000-000000000201','2026-06-30','2026-03-01Z') WHERE ancestor_id='00000000-0000-0000-0000-000000000204'),'parent chain resolves multiple levels');
SELECT pg_temp.ok((SELECT count(*)=1 FROM control_paths('00000000-0000-0000-0000-000000000201','2026-07-01','2026-03-01Z') WHERE ancestor_id='00000000-0000-0000-0000-000000000203'),'ownership boundary uses half-open dates');
SELECT pg_temp.ok((SELECT count(*)=0 FROM control_paths('00000000-0000-0000-0000-000000000203','2026-07-01','2026-03-01Z')),'no known parent returns no invented ultimate parent');
DO $$ DECLARE a uuid; BEGIN
 BEGIN a:=pg_temp.claim('00000000-0000-0000-0000-000000000204','entity.relationship','{"parent":"00000000-0000-0000-0000-000000000201","kind":"controls"}');
 PERFORM pg_temp.select_claim(a,'controls:00000000-0000-0000-0000-000000000201:all','[2025-01-01,)');
 RAISE EXCEPTION 'FAIL control cycle'; EXCEPTION WHEN check_violation THEN PERFORM pg_temp.ok(true,'overlapping control cycles are rejected'); END;
END $$;
-- Real-world equity crossholdings may exist; do not prohibit them as control cycles.
INSERT INTO fixtures VALUES
 ('equity1',pg_temp.claim('00000000-0000-0000-0000-000000000202','entity.relationship','{"parent":"00000000-0000-0000-0000-000000000203","kind":"equity_owner","percent":40}')),
 ('equity2',pg_temp.claim('00000000-0000-0000-0000-000000000203','entity.relationship','{"parent":"00000000-0000-0000-0000-000000000202","kind":"equity_owner","percent":20}'));
SELECT pg_temp.select_claim(f.id,'equity_owner:'||r.parent_entity_id::text||':all',a.valid_during)
 FROM fixtures f JOIN assertion a ON a.id=f.id JOIN company_relationship_claim r ON r.assertion_id=f.id WHERE f.key IN ('equity1','equity2');
SELECT pg_temp.ok((SELECT count(*)=2 FROM company_relationship_claim WHERE relationship_kind='equity_owner'),'minority crossholdings are not mistaken for control');
DO $$ DECLARE a uuid; BEGIN
 BEGIN a:=pg_temp.claim('00000000-0000-0000-0000-000000000201','entity.relationship','{"parent":"00000000-0000-0000-0000-000000000202","kind":"equity_owner","percent":140}');
 RAISE EXCEPTION 'FAIL percent'; EXCEPTION WHEN check_violation THEN PERFORM pg_temp.ok(true,'ownership percent bounds are enforced'); END;
END $$;

INSERT INTO fixtures VALUES ('it',pg_temp.claim('00000000-0000-0000-0000-000000000121','measurement','{"metric":"power.it_planned","value":100000,"unit":"kW"}'));
SELECT pg_temp.ok((SELECT normalized_value=100 AND canonical_unit='MW' FROM metric_claim WHERE assertion_id=(SELECT id FROM fixtures WHERE key='it')),'kW converts to MW without conflating measures');
DO $$ BEGIN
 BEGIN PERFORM pg_temp.claim('00000000-0000-0000-0000-000000000121','measurement','{"metric":"power.it_planned","value":100,"unit":"sqft"}');
 RAISE EXCEPTION 'FAIL incompatible units'; EXCEPTION WHEN check_violation THEN PERFORM pg_temp.ok(true,'area units cannot populate power metrics'); END;
END $$;
INSERT INTO fixtures VALUES
 ('landowner',pg_temp.claim('00000000-0000-0000-0000-000000000101','entity.participation','{"entity":"00000000-0000-0000-0000-000000000201","role":"landowner"}')),
 ('operator',pg_temp.claim('00000000-0000-0000-0000-000000000101','entity.participation','{"entity":"00000000-0000-0000-0000-000000000203","role":"operator"}'));
SELECT pg_temp.ok((SELECT count(DISTINCT entity_id)=2 FROM participation_claim),'landowner and operator are independent roles');

INSERT INTO ingestion_run(id,feed_id,status,started_at,finished_at,coverage_complete,fetched_record_count) VALUES
 ('00000000-0000-0000-0000-000000000401','00000000-0000-0000-0000-000000000021','succeeded','2026-01-01Z','2026-01-02Z',true,1),
 ('00000000-0000-0000-0000-000000000402','00000000-0000-0000-0000-000000000021','failed','2026-01-01Z','2026-01-02Z',false,0);
INSERT INTO feed_checkpoint(feed_id,scope_key,cursor_value,committed_run_id) VALUES
 ('00000000-0000-0000-0000-000000000021','default','{"cursor":1}','00000000-0000-0000-0000-000000000401');
DO $$ BEGIN
 BEGIN UPDATE feed_checkpoint SET revision=revision+1,committed_run_id='00000000-0000-0000-0000-000000000402';
 RAISE EXCEPTION 'FAIL failed checkpoint'; EXCEPTION WHEN check_violation THEN PERFORM pg_temp.ok(true,'failed runs cannot advance checkpoint'); END;
 BEGIN UPDATE feed_checkpoint SET revision=revision+2;
 RAISE EXCEPTION 'FAIL revision skip'; EXCEPTION WHEN check_violation THEN PERFORM pg_temp.ok(true,'checkpoint revisions cannot skip'); END;
 BEGIN UPDATE ingestion_run SET status='failed' WHERE id='00000000-0000-0000-0000-000000000401';
 RAISE EXCEPTION 'FAIL mutated completed run'; EXCEPTION WHEN check_violation THEN PERFORM pg_temp.ok(true,'finished ingestion runs cannot invalidate checkpoints'); END;
 BEGIN DELETE FROM feed_checkpoint;
 RAISE EXCEPTION 'FAIL checkpoint deletion'; EXCEPTION WHEN check_violation THEN PERFORM pg_temp.ok(true,'checkpoint cannot be deleted and reset'); END;
 BEGIN UPDATE feed_checkpoint SET revision=revision+1;
 RAISE EXCEPTION 'FAIL checkpoint regression'; EXCEPTION WHEN check_violation THEN PERFORM pg_temp.ok(true,'checkpoint must advance to a later successful run'); END;
END $$;
SELECT pg_temp.ok((SELECT revision=1 FROM feed_checkpoint),'failed checkpoint writes preserve prior cursor');

INSERT INTO fixtures VALUES
 ('campus_capital',pg_temp.claim('00000000-0000-0000-0000-000000000101','capital.amount','{"amount":1000000000,"basis":"site_investment","scope":"site"}')),
 ('corporate_capital',pg_temp.claim('00000000-0000-0000-0000-000000000203','capital.amount','{"amount":5000000000,"basis":"corporate_capex_plan","scope":"us_only"}'));
INSERT INTO capital_claim_link(from_assertion_id,to_assertion_id,relation,evidence_id)
 SELECT f1.id,f2.id,'contains','00000000-0000-0000-0000-000000000051' FROM fixtures f1,fixtures f2 WHERE f1.key='corporate_capital' AND f2.key='campus_capital';
SELECT pg_temp.ok((SELECT count(*)=2 FROM capital_claim WHERE aggregation_state='not_cleared'),'capital disclosures remain nonadditive by default');
DO $$ DECLARE a uuid; BEGIN
 BEGIN a:=pg_temp.claim('00000000-0000-0000-0000-000000000101','purpose','"AI training"',NULL);
 PERFORM pg_temp.select_claim(a,'default','[2025-01-01,)');
 RAISE EXCEPTION 'FAIL unknown validity'; EXCEPTION WHEN check_violation THEN PERFORM pg_temp.ok(true,'unknown validity cannot be labeled evidenced'); END;
END $$;
DO $$ DECLARE a uuid:=gen_random_uuid(); ev uuid:=gen_random_uuid(); ver uuid:=gen_random_uuid(); BEGIN
 INSERT INTO source_record_version(id,source_record_id,revision,content_sha256,payload,retrieved_at)
 VALUES(ver,'00000000-0000-0000-0000-000000000031',4,repeat('c',64),'{}','2027-01-01Z');
 INSERT INTO evidence(id,version_id,created_at) VALUES(ev,ver,'2027-01-01Z');
 SET CONSTRAINTS assertion_payload_guard DEFERRED;
 INSERT INTO assertion(id,subject_id,predicate,valid_during,first_recorded_at,extraction_method,extractor_version,confidence,idempotency_key)
 VALUES(a,'00000000-0000-0000-0000-000000000102','purpose','[2025-01-01,)','2024-01-01Z','analyst','test','high',a::text);
 INSERT INTO attribute_claim VALUES(a,'"TEST cloud"');
 INSERT INTO assertion_evidence(assertion_id,evidence_id,recorded_at) VALUES(a,ev,'2024-01-01Z');
 INSERT INTO assertion_review(assertion_id,decision,reviewer,rationale,recorded_at) VALUES(a,'accepted','TEST','TEST','2024-01-01Z');
 SET CONSTRAINTS assertion_payload_guard IMMEDIATE;
 BEGIN PERFORM pg_temp.select_claim(a,'default','[2025-01-01,)');
 RAISE EXCEPTION 'FAIL evidence lookahead'; EXCEPTION WHEN check_violation THEN PERFORM pg_temp.ok(true,'fact cannot be selected before evidence was available'); END;
END $$;
SET CONSTRAINTS ALL IMMEDIATE;
SELECT count(*) AS passed_tests FROM test_result;
SELECT name FROM test_result ORDER BY name;
ROLLBACK;
