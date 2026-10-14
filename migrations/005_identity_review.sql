CREATE FUNCTION dc.confirm_candidate(p_object uuid,p_actor text,p_rationale text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=dc,pg_temp AS $$
DECLARE obj dc.tracked_object; ev uuid;
BEGIN
 IF length(p_actor)<1 OR length(btrim(p_rationale))<10 OR length(p_rationale)>2000 THEN RAISE EXCEPTION 'Identity review rationale required' USING ERRCODE='23514'; END IF;
 SELECT * INTO STRICT obj FROM dc.tracked_object WHERE id=p_object FOR UPDATE;
 IF obj.identity_state<>'candidate' THEN RAISE EXCEPTION 'Only candidate identity may be confirmed' USING ERRCODE='23514'; END IF;
 SELECT evidence_id INTO ev FROM dc.source_object_link WHERE object_id=p_object AND link_role='canonical_record' LIMIT 1;
 IF ev IS NULL THEN RAISE EXCEPTION 'Canonical identity evidence required' USING ERRCODE='23514'; END IF;
 UPDATE dc.tracked_object SET identity_state='confirmed' WHERE id=p_object;
 INSERT INTO dc.change_event(subject_id,event_type,event_date,evidence_id,dedupe_key,emit_alert,details)
 VALUES(p_object,'identity.confirmed',CURRENT_DATE,ev,'identity-confirmed:'||p_object::text,false,jsonb_build_object('actor',p_actor,'rationale',p_rationale,'basis','source identity only; no implied owner/status/capital'));
END $$;
REVOKE ALL ON FUNCTION dc.confirm_candidate(uuid,text,text) FROM PUBLIC;
