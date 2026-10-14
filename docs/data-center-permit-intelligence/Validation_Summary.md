# Validation Summary

**Design date:** October 13, 2026  
**Reference engine:** PostgreSQL 16  
**Scope:** Local, disposable database validation; no production deployment.

## Results

- The complete bootstrap schema loads transactionally in a fresh PostgreSQL database.
- **37 rollback-only synthetic regression tests pass.**
- All **seven example query sections** execute against the empty reference schema.
- The data dictionary is extracted from the loaded catalog, rather than reconstructed manually.
- The entity-relationship overview was rendered and visually checked.
- An independent PostgreSQL review was completed; the final schema addresses issuer-scoped company IDs, immutable authority/site identity, evidence availability, review retraction, subtype deletion, semantic dictionaries, and checkpoint progression.

## Tested behaviors

- Duplicate-looking source keys remain distinct across feeds.
- A → B → A source content is retained as three versions.
- Same permit numbers in different authority namespaces are allowed; same-namespace duplicates are rejected.
- Same legal registration numbers in different issuing jurisdictions are allowed.
- Cases cannot be moved to a different issuing authority by ordinary update.
- Building/phase project consistency is enforced.
- Registry objects require typed subtype rows; subtype deletion is blocked.
- Source version and selected fact history cannot be overwritten.
- Overlapping selections for the same temporal slot are rejected.
- Arbitrary slot labels cannot bypass selection uniqueness.
- Historical corrections and later retractions preserve earlier knowledge queries.
- A rejected assertion no longer remains a current selection.
- Multi-level evidenced parent-control paths and half-open acquisition dates work.
- No known parent does not produce an invented ultimate parent.
- Overlapping canonical control cycles are rejected; minority crossholdings remain allowed.
- Percentage bounds and measurement dimensions are enforced.
- kW-to-MW normalization works without conflating metric meanings.
- Landowner and operator are independent roles.
- Failed runs cannot advance checkpoints; completed run history and checkpoints cannot be reset/mutated to invalidate history.
- Capital disclosures remain nonadditive by default.
- Unknown effective validity cannot be represented as evidenced validity.
- A selection cannot rely on evidence retrieved after its knowledge time.

## Not established by these tests

- Live retrieval permission or source coverage/completeness.
- Concurrent-writer race safety under production traffic.
- Performance, storage sizing, availability, backups, disaster recovery, or security compliance.
- Production grants, authenticated reviewer identity, server-stamped write API, or notification delivery.
- Complete bitemporal structural identity/membership history.
- Polygon/distance matching, legal-entity contact directories, formal merge reversal, or automatic financial overlap resolution.

The reference constraints must be combined with controlled writer/selector procedures, application validation, adapter-specific leases/cursor checks, and production permissions before deployment. Tests use fabricated fixtures marked TEST and are fully rolled back.

## Reproduce

In a newly created PostgreSQL 16+ database, with permission to install `btree_gist`:

```bash
psql -X -v ON_ERROR_STOP=1 -d YOUR_NEW_DATABASE -f 001_schema.sql
psql -X -v ON_ERROR_STOP=1 -d YOUR_NEW_DATABASE -f 002_tests.sql
psql -X -v ON_ERROR_STOP=1 -d YOUR_NEW_DATABASE -f 003_queries.sql
```

The bootstrap is not an idempotent upgrade script. Do not run it against a populated registry. The query examples use illustrative IDs and a dated cutoff; replace these before querying real data.
