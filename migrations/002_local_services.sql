-- Subsequent migration; immutable reference bootstrap stays untouched.
CREATE TABLE dc.collector_lease (
 feed_id uuid NOT NULL REFERENCES dc.source_feed(id), scope_key text NOT NULL,
 token uuid NOT NULL, expires_at timestamptz NOT NULL,
 PRIMARY KEY(feed_id,scope_key)
);
CREATE TABLE dc.app_entity_mapping (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), entity_id uuid NOT NULL REFERENCES dc.company_entity(id),
 monitor_key text NOT NULL, valid_during daterange NOT NULL CHECK(NOT isempty(valid_during)),
 evidence_id uuid NOT NULL REFERENCES dc.evidence(id), recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(entity_id,monitor_key,valid_during)
);
CREATE TABLE dc.source_mapping (
 source_record_id uuid PRIMARY KEY REFERENCES dc.source_record(id), object_id uuid NOT NULL REFERENCES dc.tracked_object(id),
 semantic_hash text NOT NULL CHECK(semantic_hash ~ '^[0-9a-f]{64}$'), updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE dc.report_artifact (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), export_id uuid NOT NULL REFERENCES dc.export_run(id),
 kind text NOT NULL CHECK(kind IN('xlsx','markdown')), file_name text NOT NULL,
 content_sha256 text NOT NULL, row_count integer NOT NULL, created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(export_id,kind)
);

CREATE FUNCTION dc.review_claim(p_assertion uuid,p_decision text,p_actor text,p_rationale text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=dc,pg_temp AS $$
DECLARE a dc.assertion; new_id uuid; stamp timestamptz; slot text; vr daterange; old_id uuid; ev uuid;
BEGIN
 IF p_decision NOT IN('accepted','rejected','needs_review') OR length(btrim(p_rationale))<5 OR length(p_rationale)>2000 OR length(p_actor)>100 OR length(p_actor)<1 THEN
  RAISE EXCEPTION 'Invalid review request' USING ERRCODE='23514';
 END IF;
 SELECT * INTO STRICT a FROM dc.assertion WHERE id=p_assertion FOR UPDATE;
 PERFORM pg_advisory_xact_lock(hashtextextended(a.subject_id::text||a.predicate,0));
 stamp:=clock_timestamp();
 IF p_decision='accepted' THEN
  slot:='default';
  IF a.predicate='measurement' THEN SELECT metric_code INTO slot FROM dc.metric_claim WHERE assertion_id=a.id;
  ELSIF a.predicate='capital.amount' THEN slot:=a.id::text;
  ELSIF a.predicate='entity.relationship' THEN SELECT relationship_kind||':'||parent_entity_id::text||':'||coalesce(share_class,'all') INTO slot FROM dc.company_relationship_claim WHERE assertion_id=a.id;
  ELSIF a.predicate='entity.participation' THEN SELECT role||':'||entity_id::text INTO slot FROM dc.participation_claim WHERE assertion_id=a.id;
  END IF;
  IF EXISTS(SELECT 1 FROM dc.fact_selection WHERE assertion_id=a.id AND upper_inf(system_during)) THEN
   RAISE EXCEPTION 'Already selected' USING ERRCODE='23514';
  END IF;
  SELECT id INTO old_id FROM dc.fact_selection WHERE subject_id=a.subject_id AND predicate=a.predicate AND slot_key=slot AND upper_inf(system_during) ORDER BY lower(system_during) DESC LIMIT 1;
  IF a.valid_during IS NOT NULL THEN vr:=a.valid_during; ELSE vr:=daterange(CURRENT_DATE,CURRENT_DATE+1,'[)'); END IF;
  -- A replacement closes only the same temporal slot. Historic valid segments are retained.
  WITH closed AS (
   UPDATE dc.fact_selection SET system_during=tstzrange(lower(system_during),stamp,'[)')
   WHERE subject_id=a.subject_id AND predicate=a.predicate AND slot_key=slot AND upper_inf(system_during) AND valid_during && vr
   RETURNING *
  ) INSERT INTO dc.fact_selection(subject_id,predicate,slot_key,assertion_id,valid_during,valid_time_basis,system_during,policy_version,selected_by)
   SELECT subject_id,predicate,slot_key,assertion_id,seg,valid_time_basis,tstzrange(stamp,NULL,'[)'),policy_version,selected_by
   FROM closed CROSS JOIN LATERAL unnest(datemultirange(valid_during)-datemultirange(vr)) seg;
 END IF;
 INSERT INTO dc.assertion_review(assertion_id,decision,reviewer,rationale,recorded_at)
  VALUES(a.id,p_decision,p_actor,p_rationale,stamp);
 IF p_decision='accepted' THEN
  INSERT INTO dc.fact_selection(subject_id,predicate,slot_key,assertion_id,valid_during,valid_time_basis,system_during,policy_version,selected_by)
   VALUES(a.subject_id,a.predicate,slot,a.id,vr,CASE WHEN a.valid_during IS NULL THEN 'observed_asof' ELSE 'evidenced' END,tstzrange(stamp,NULL,'[)'),'manual-review-v1',p_actor) RETURNING id INTO new_id;
 END IF;
 SELECT evidence_id INTO ev FROM dc.assertion_evidence WHERE assertion_id=a.id AND stance='supports' ORDER BY recorded_at LIMIT 1;
 IF ev IS NOT NULL THEN
  INSERT INTO dc.change_event(subject_id,event_type,event_date,old_selection_id,new_selection_id,evidence_id,dedupe_key,emit_alert,details)
   VALUES(a.subject_id,'review.'||p_decision,CURRENT_DATE,old_id,new_id,ev,'review:'||a.id::text||':'||stamp::text,false,
    jsonb_build_object('actor',p_actor,'rationale',p_rationale,'assertion_id',a.id,'predicate',a.predicate));
 END IF;
 RETURN new_id;
END $$;
REVOKE ALL ON FUNCTION dc.review_claim(uuid,text,text,text) FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA dc FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA dc FROM PUBLIC;

CREATE FUNCTION dc.stamp_runtime_provenance() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE owner_name text; field_name text;
BEGIN
 SELECT tableowner INTO owner_name FROM pg_tables WHERE schemaname='dc' AND tablename='tracked_object';
 IF current_user<>owner_name THEN
  field_name:=TG_ARGV[0];
  NEW:=jsonb_populate_record(NEW,jsonb_build_object(field_name,clock_timestamp()));
 END IF;
 RETURN NEW;
END $$;
DO $$ DECLARE item text[]; BEGIN
 FOREACH item SLICE 1 IN ARRAY ARRAY[
  ARRAY['source_record','first_seen_at'],ARRAY['source_record_version','retrieved_at'],
  ARRAY['evidence','created_at'],ARRAY['assertion','first_recorded_at'],
  ARRAY['assertion_evidence','recorded_at'],ARRAY['record_observation','observed_at']
 ] LOOP
  EXECUTE format('CREATE TRIGGER runtime_stamp BEFORE INSERT ON dc.%I FOR EACH ROW EXECUTE FUNCTION dc.stamp_runtime_provenance(%L)',item[1],item[2]);
 END LOOP;
END $$;
