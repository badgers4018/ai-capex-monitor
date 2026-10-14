CREATE FUNCTION dc.propose_company_fact(p_payload jsonb,p_actor text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=dc,pg_temp AS $$
DECLARE feed uuid; sr uuid; ver uuid; ev uuid; child uuid; parent uuid; a uuid; target uuid; kind text; stamp timestamptz:=clock_timestamp(); native text:=gen_random_uuid()::text; vr daterange;
BEGIN
 IF jsonb_typeof(p_payload)<>'object' OR length(p_actor)<1 OR length(p_payload->>'quotation')<20 OR length(p_payload->>'quotation')>10000 OR length(p_payload->>'source_url')>2000 OR p_payload->>'source_url' !~ '^https://' THEN
  RAISE EXCEPTION 'Analyst proposal needs https citation and exact supporting quotation' USING ERRCODE='23514';
 END IF;
 SELECT id INTO feed FROM dc.source_feed WHERE name='analyst_citations';
 IF feed IS NULL THEN INSERT INTO dc.source_feed(name,publisher,feed_type,endpoint_url,access_status,redistribution_policy) VALUES('analyst_citations','Authenticated analyst submission','manual','local://review-proposals','unverified','private_local_only') RETURNING id INTO feed; END IF;
 INSERT INTO dc.source_record(feed_id,native_key,record_kind,original_url) VALUES(feed,native,'analyst_citation',p_payload->>'source_url') RETURNING id INTO sr;
 INSERT INTO dc.source_record_version(source_record_id,revision,content_sha256,payload,mime_type) VALUES(sr,1,encode(sha256(convert_to(p_payload::text,'UTF8')),'hex'),p_payload,'application/json') RETURNING id INTO ver;
 INSERT INTO dc.evidence(version_id,quotation,locator,original_publisher_url) VALUES(ver,p_payload->>'quotation',jsonb_build_object('basis','analyst_submitted_not_independently_fetched','actor',p_actor),p_payload->>'source_url') RETURNING id INTO ev;
 child:=NULLIF(p_payload->>'entity_id','')::uuid;
 IF child IS NULL THEN
  IF length(btrim(p_payload->>'entity_name'))<2 OR length(p_payload->>'entity_name')>200 THEN RAISE EXCEPTION 'Entity name required' USING ERRCODE='23514'; END IF;
  INSERT INTO dc.tracked_object(kind,label) VALUES('entity',p_payload->>'entity_name') RETURNING id INTO child;
  INSERT INTO dc.company_entity(id,entity_type) VALUES(child,'unknown');
 ELSE PERFORM 1 FROM dc.company_entity WHERE id=child; IF NOT FOUND THEN RAISE EXCEPTION 'Entity missing' USING ERRCODE='23514'; END IF; END IF;
 IF p_payload ? 'valid_from' AND p_payload->>'valid_from'<>'' THEN vr:=daterange((p_payload->>'valid_from')::date,NULLIF(p_payload->>'valid_to','')::date,'[)'); END IF;
 IF p_payload->>'fact_kind'='relationship' THEN
  parent:=NULLIF(p_payload->>'parent_id','')::uuid;
  IF parent IS NULL THEN
   IF length(btrim(p_payload->>'parent_name'))<2 OR length(p_payload->>'parent_name')>200 THEN RAISE EXCEPTION 'Parent entity name required' USING ERRCODE='23514'; END IF;
   INSERT INTO dc.tracked_object(kind,label) VALUES('entity',p_payload->>'parent_name') RETURNING id INTO parent;
   INSERT INTO dc.company_entity(id,entity_type) VALUES(parent,'unknown');
  ELSE PERFORM 1 FROM dc.company_entity WHERE id=parent; IF NOT FOUND THEN RAISE EXCEPTION 'Parent entity missing' USING ERRCODE='23514'; END IF; END IF;
  INSERT INTO dc.assertion(subject_id,predicate,valid_during,extraction_method,extractor_version,confidence,idempotency_key) VALUES(child,'entity.relationship',vr,'analyst','analyst-citation-v1','unknown','analyst:'||native) RETURNING id INTO a;
  INSERT INTO dc.company_relationship_claim(assertion_id,child_entity_id,parent_entity_id,relationship_kind) VALUES(a,child,parent,p_payload->>'relationship_kind');
 ELSE
  target:=(p_payload->>'target_id')::uuid;
  INSERT INTO dc.assertion(subject_id,predicate,valid_during,extraction_method,extractor_version,confidence,idempotency_key) VALUES(target,'entity.participation',vr,'analyst','analyst-citation-v1','unknown','analyst:'||native) RETURNING id INTO a;
  INSERT INTO dc.participation_claim(assertion_id,entity_id,target_id,role) VALUES(a,child,target,p_payload->>'role');
 END IF;
 INSERT INTO dc.assertion_evidence(assertion_id,evidence_id) VALUES(a,ev);
 RETURN a;
END $$;
REVOKE ALL ON FUNCTION dc.propose_company_fact(jsonb,text) FROM PUBLIC;
