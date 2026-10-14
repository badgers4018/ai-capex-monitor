# Local Permit Intelligence Contracts — v0.1

## Architecture decision

This is a new local monitor shell in the existing GitHub repository, not a claim to have modified unavailable Grok application code. No hosted project was initialized or deployed. Backend TypeScript + PostgreSQL `pg`; React/Vite UI; deterministic county GIS adapters; private content-addressed local evidence storage. Both servers bind 127.0.0.1. CLI/HTTP call shared service functions. No existing feature bus, AI backend, or reusable submodule repository was available; those dependencies were not fabricated. No AI inference is required. Preserve `weekly/*`, `vercel.json`, and original reference-package hashes.

## Data/migration contract

Reference `001_schema.sql` is bootstrap once, checksummed. Additive, immutable checked migrations supply app-service metadata, controlled review, year-built semantics, analyst proposals, and identity confirmation. Runtime pools do not own tables. Ingestion appends source identities/evidence/proposed facts; it cannot directly select facts. Security-definer review procedures use controlled search paths and server times. Caller actor/timestamp fields are rejected; reviewer identity comes from the authenticated session.

Raw content hashes match exact response bytes, including page-backed record locators. Normalized comparisons suppress redundant semantic claims without discarding raw revisions. Campus/building scopes progress independently under a feed lease and checkpoint checks. Stable qualified GlobalIDs—not mutable OBJECTIDs—are identity keys. Count/OBJECTID inventories guard complete pagination. Mutable-source snapshots remain best-effort observations, not a cross-layer source transaction.

Only a unique exact documented planning-case link auto-matches a building to a campus. Ambiguous/missing links create unresolved containers/review issues, not invented confirmed campuses. Parcels/cases are registry/issuer qualified. Parent/role proposals preserve distinct typed relationships and unknowns. Names do not auto-merge entities. No capacity/purpose/capital/parent is inferred from a building label. No combined financial SUM.

## HTTP API

All `/api/v1/*` routes require a local session. Login issues an expiring HttpOnly SameSite=Strict local cookie. Writes require CSRF and a trusted origin when supplied. Hostnames must be loopback. Roles: viewer (read/export), reviewer (plus review/proposals/identity), admin (plus approved-source ingest). Parameterized SQL, bounded pagination/body sizes, login-rate limits. No arbitrary fetch URL endpoint. Clients never receive owner credentials, local passwords, raw-file paths, or DB URLs.

| Method/path                         | Contract                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| POST /auth/login                    | Username/password; generated local user; session + CSRF                                                 |
| GET /auth/me; POST /auth/logout     | Session identity/token; invalidate session                                                              |
| GET /api/v1/projects                | q/kind/status, page/limit (max 100), valid_as_of/known_as_of                                            |
| GET /api/v1/projects/:id            | Selected facts, source claims/evidence, buildings, cases, participants, issues, separate capital        |
| GET /api/v1/cases; /cases/:id       | Issuer-scoped explicit permit/planning references and evidence                                          |
| GET /api/v1/entities; /entities/:id | Candidate companies, dated control paths, monitor-key mappings; unknown ultimate parent remains unknown |
| GET /api/v1/changes                 | Observed review/identity events; external alerts disabled                                               |
| GET /api/v1/sources; /sources/:key  | Access/coverage/health/contract; not production scheduling                                              |
| POST /api/v1/sources/:key/ingest    | Admin only; approved county feed; disabled feeds cannot be activated                                    |
| GET /api/v1/reviews                 | Reviewer/admin queue, typed payload, original citation/locator                                          |
| POST /api/v1/reviews/:id            | accepted/rejected/needs_review + rationale; authenticated actor; server times                           |
| POST /api/v1/identities/:id/confirm | Source-backed candidate identity only; no owner/status/capital approval                                 |
| POST /api/v1/company-proposals      | Typed relationship/site role, citation + quote; analyst-submitted and unreviewed                        |
| POST /api/v1/exports                | Snapshot-consistent XLSX/Markdown/manifests; optional fact cutoffs                                      |
| GET /api/v1/exports/:id/:kind       | Authenticated, validated UUID/format; private generated artifacts only                                  |
| GET /api/v1/weekly; /weekly/:name   | Existing repository financial reports, not fresh market fetches                                         |
| GET /api/v1/weekly-appendix/:date   | Separate observed-week permit appendix; not a scheduler hook                                            |

Project/export selected facts use effective and knowledge cutoffs. Structural membership/display caches belong to the current/export snapshot and are explicitly not fully bitemporal. Unknown effective dates default to an observed-day selection only. Source health is current operational metadata, not historical financial truth.

## UI/report contract

Editorial research desk: dark green/graphite + parchment, serif display, self-hosted body/mono fonts. Project detail has the source → archive → claim → review → selected-fact provenance rail. No invented live totals or decorative financial charts. Routes: Projects, Permits & Plans, Companies, Changes, Sources & Coverage, Review Queue, Weekly Tape. Loading/error/empty/stale states, filters, evidence, read-only viewer, role-guarded writes. Company candidates/proposals and unresolved campus containers are labeled honestly.

Reports use one repeatable-read snapshot and share row IDs/counts/cutoffs/manifest. Aggregate one-to-many branches before joining projects. Capital disclosures remain separate by basis/currency/scope and flags, never a summed national build number. XLSX/Markdown private artifacts are hash logged. Weekly appendix writes to `.local/appendices`, never overwrites the financial tape.

## Test/operations contract

37 original schema regressions in a disposable DB. 66 isolated application/adapter/API/DB tests. 11 browser tests including roles/review/exports/mobile/error states/page errors and principal-screen WCAG A/AA checks. TEST fixtures never seed the real registry. CI uses offline fixtures and read-only GitHub permissions; no deployment or live collector job. Full dependency audit clean at validation; pin/overrides are regression tested.

Private `.local` stores local credentials, evidence, probes, reports, backups and QA traces. Restore smoke tests use a new disposable DB. Exact runtime host/storage/auth, redistribution rights, source expansion, alert delivery, manual uploads/merge/reparenting tooling, and actual external-app/weekly-scheduler integration remain explicit gates. A local CLI is not an unattended production monitor.
