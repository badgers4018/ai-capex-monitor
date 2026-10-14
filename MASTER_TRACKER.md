# Permit Intelligence Implementation Tracker

PRIMARY_REPO: badgers4018/ai-capex-monitor
Branch: feat/permit-intelligence-publish (stacked on design PR #1)
Authority: local/private build, public-source reads, tests, implementation PR; **no merge, deployment, paid feeds, AI APIs, or external alerts**.
Validation date: 2026-10-14 UTC.

Publication variant: the original tested implementation remains at local commit `0529c521d8604b2ad6d72ab3969edfa496df12ed`. GitHub rejected its active workflow file for missing workflow-write permission. This clean branch preserves all application code and retains CI at `docs/implementation/permit-intelligence-ci.example.yml` for authorized manual installation; no automatic CI is enabled. No connector permissions were changed.

Published branch: [feat/permit-intelligence-publish](https://github.com/badgers4018/ai-capex-monitor/tree/feat/permit-intelligence-publish). Open implementation PR: [#2](https://github.com/badgers4018/ai-capex-monitor/pull/2), targeting the design branch while [schema PR #1](https://github.com/badgers4018/ai-capex-monitor/pull/1) remains unmerged. Local 37 schema, 66 application and 11 browser tests plus build passed again before publication. No merge or deployment performed.

## Architecture

New TypeScript API/collector + React shell, parameterized PostgreSQL (`pg`), immutable original `dc` schema, private content-addressed local storage. No existing frontend/backend, AI backend, feature bus, or shared submodule library was available; this release uses explicit local service contracts rather than inventing imports to nonexistent components. No AI inference is needed. The financial weekly files remain untouched.

| Stage/story           | Implemented acceptance scope                                                                           | Test evidence                                                                               | State                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| A1 Foundation         | Pinned dependencies, idempotent local setup, checksum migrations, scoped runtime roles                 | Setup/migration replay; disposable schema; direct writes forbidden                          | Passed locally                                                         |
| A2 Source locks       | Publisher/access/mapping/schema/coverage/redistribution gates                                          | Full county snapshots; full schema fingerprint; blocked/unverified sources denied           | Passed locally                                                         |
| A3 Controlled writers | Server timestamps, authenticated actor, controlled reviews/retractions                                 | Forged times/actor rejected; viewer forbidden; temporal history preserved                   | Passed locally                                                         |
| B1 County adapters    | Campus/building scopes, stable qualified GUIDs, bounded complete pagination                            | Count/ID drift, duplicate IDs, partial pages, HTTP 403, allowlist                           | Passed locally                                                         |
| B2 Evidence ingestion | Exact archived bytes/hashes, append-only versions, pending claims                                      | Raw hash equality; A-B-A; identical replay zero duplicates                                  | Passed locally                                                         |
| B3 First UI path      | Actual county record → archived field → review → selected reported entitlement                         | Real record verified privately; browser source/review/detail path                           | Passed locally                                                         |
| C1 Reconciliation     | Baseline quiet, scoped checkpoints, lease serialization/recovery, missing-not-canceled                 | Failed checkpoint unchanged; active/expired leases; repeat import                           | Passed locally                                                         |
| C2 Resolution/history | Exact explicit case linkage, unresolved containers, identity confirmation, typed parent/role proposals | Unknown parent; minority not control; graph cycle rejected; historical rejection            | Passed for first-release scope; merges/reparenting/uploads deferred    |
| D1 API                | Paginated/filterable projects/cases/entities/reviews/changes/sources/exports                           | Parameter validation, empty pages, auth/roles, CSRF, host/origin checks                     | Passed locally                                                         |
| D2 UI                 | Routes, filters, evidence, reviewer controls, mobile, empty/error/loading states                       | 11 browser tests; WCAG A/AA audit on principal screens; page-error checks                   | Passed locally                                                         |
| D3 Reports            | One snapshot for XLSX/Markdown; separate weekly appendix                                               | Matching IDs/counts, cutoffs/manifests, no combined capital sum, original tape unchanged    | Passed locally; actual weekly scheduler hook unavailable               |
| E1 Operations         | Private bind, probes/runbook, backup/restore smoke check, hosted-build guard                           | Loopback HTTP 200; restore counts match; hosted build rejected; full dependency audit clean | Passed locally; production runtime/identity/backup policy not approved |
| E2 Handoff            | TEST-only screenshots, contracts, runbook, QA report, stacked PR                                       | Checksum/secret/scope publication checks                                                    | Published: open PR #2; no merge/deploy                                  |

## Validation log

- Foundation: local setup, one-time reference bootstrap and checksum migration replay succeeded before live ingestion. Original schema ran all **37** tests and example queries in a separate disposable DB.
- Adapter: complete **78 campus + 247 building** snapshots retrieved; both scoped baseline imports succeeded. Second ingestion created **0 objects and 0 semantic claims**. Raw snapshots stayed private.
- Identity: **143 unresolved site containers** preserve buildings without a unique exact campus case link; these are not 143 additional announced projects. Registry contains **170 issuer-scoped case references**, not a complete direct permit feed.
- Implementation correction: initial runtime failures identified PostgreSQL row-lock privileges and schema search-path requirements. Fixed narrowly, then real imports/replays and isolated permission tests passed.
- Application: expanded isolated suite passed **66 tests** (39 DB/API/integration; 27 adapter tests).
- Browser: passed **11 tests**, including identity/fact reviews, roles, exports, mobile/error handling, page errors, and WCAG A/AA checks. A low-contrast active-nav number was corrected without suppressing the accessibility rule.
- Security: patched Express/transitive dependencies, Vite/Vitest and worker/build tooling to address audit findings; final full and production audit reports contain **0 advisories** at verification time.
- Real path: a planned county campus's exact raw `ProjectStatus=Planned` was verified and selected as reported **proposed entitlement observed that day only**. No build start, owner, purpose, or capital was inferred. Source IDs/quotes/hash remain in a private verification JSON, not public Git.
- Recovery: private DB backup restored to a new disposable DB; project/building/version/assertion counts matched. Real registry was never reset. No external alerts were emitted.
- Final dependency graph: reference tests, 66 application tests, 11 browser tests, type checking and optimized frontend build all passed again after patching. The final UI bundle is about 213 KB uncompressed / 67 KB gzip, with self-hosted fonts.

## Deferred or gated

Production host/DB/storage/authentication, public UI/data redistribution, external alerts, actual weekly scheduler hook and external Grok-app company IDs; DEQ direct adapter activation (403) and Loudoun bulk access (unverified); nationwide expansion; source-specific ownership/capital/IT-capacity enrichment; unit-reviewed GFA; geometry/fuzzy matching; reversible merge/reparenting and bulk analyst file import. A working local collector is not a scheduled production monitor.
