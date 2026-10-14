# Project TODO (Session: design-taste audit + AI council review)

- [x] Inspect project structure, pages, routes, and design tokens
- [x] Capture screenshots of all key pages (desktop + mobile)
- [x] Run design-taste-frontend audit (Section 11.B audit + Section 14 pre-flight criteria)
- [x] Run AI council (10 domain experts) review of the site and audit
- [x] Synthesize combined report with prioritized recommendations
- [x] Deliver report and ask user how to proceed on making site permanent

## Council Recommendations Implementation

- [x] R1: Remove login wall from public pages (platform-level: Settings → General → Visibility)
- [x] R2: Resolve live-data contradiction — changed "Yahoo Finance API" to static snapshot label, updated all dates to July 12 2026, fixed FCFCountdown "real-time" claim
- [x] R3: Strip em-dashes from all TSX files; delete all section-number eyebrows (14 components); rewrite footer methodology; remove all Karpathy/autoresearch/loop references
- [x] R4: Fix nav/hero overlap — removed flex centering from hero section, increased top padding to pt-24/pt-28; added Gartner source to 85% metric
- [x] R5: Partial — font consolidation done; full category color semantics pass deferred (company cards use per-company colors which are intentional)
- [x] R6: Added prefers-reduced-motion CSS block to index.css
- [x] R7: Consolidated fonts — removed Instrument Serif and Bebas Neue from HTML and CSS; replaced all font-serif with font-sans font-semibold
- [x] R8: Added "Demand-Side Reality Check" NarrativeBlock with BCG/Forrester ROI data, governance gap analysis
- [x] R9: Added "Physical Bottleneck Deep Dive" NarrativeBlock with CoWoS/HBM4/grid queue analysis
- [x] R10: Added three full-bleed section dividers (Market Intelligence, Strategic Analysis, Stay Updated) with gradient accent lines

## Public Landing Page

- [x] Create LandingPage.tsx component (hero thesis, metric strip, feature preview, CTA)
- [x] Wire /landing route in App.tsx as the public entry point
- [x] Verify visually on desktop and mobile
- [x] Checkpoint and deliver

## Route Swap + Email Subscription

- [x] Swap routes: / → LandingPage, /dashboard → Home (full dashboard)
- [x] Update all internal nav links to point to /dashboard instead of /
- [x] Add simplified email subscription form to landing page CTA section
- [x] Checkpoint and deliver

## Fix: Can't Enter Monitor (reported by user)

- [x] Change all 3 landing page CTAs (Enter Monitor, Explore the Full Dashboard, Open the Monitor) to navigate directly to /dashboard instead of forcing OAuth login
- [x] Keep OAuth post-login redirect fix (/ → /dashboard) for users who do sign in
- [x] Checkpoint (auto-publish) and verify live production site loads /dashboard publicly

## Live Yahoo Finance Prices

- [x] Backend: tRPC `market.quotes` procedure fetching Yahoo Finance quotes (Data API or public endpoint) with server-side cache
- [x] Frontend: landing page bellwether ticker strip consumes live quotes with static fallback
- [x] Frontend: dashboard MarketDataSection consumes live quotes with static fallback
- [x] Update "data as of" labels to reflect live quote timestamps
- [x] Vitest coverage for the quotes procedure (parseQuote unit tests, 5 tests passing)
- [x] Checkpoint (auto-publish) and verify live site — production market.quotes API returns live quotes (MSFT 393.82, GOOGL 346.77...); Enter Monitor → /dashboard verified in production browser
- [x] Verified OAuth callback redirects to /dashboard (server/_core/oauth.ts line 47)
- [x] Landing page ticker stamp now uses server fetchedAt timestamp
- [x] Procedure-level vitest for market.quotes: cache behavior, symbol filtering, upstream failure tolerance (3 tests passing)

## Email Subscription Backend

- [x] Add `subscribers` table to drizzle/schema.ts and apply migration SQL
- [x] Add db helper + tRPC `newsletter.subscribe` mutation (email validation, duplicate handling via cause-chain ER_DUP_ENTRY detection)
- [x] Wire landing page CTA form to the mutation (replace localStorage-only behavior)
- [x] Wire dashboard EmailSubscription component to the same mutation (source: dashboard)
- [x] Vitest coverage for the subscribe mutation (6 tests: insert, duplicate, cause-chain duplicate, invalid email, db unavailable, unexpected failure)
- [x] Verify end-to-end (curl: new subscribe → ok, duplicate → alreadySubscribed, bad email → BAD_REQUEST; DB row confirmed then test row removed)
- [ ] Checkpoint (auto-publish), deliver
- [x] Refactor: dedicated `insertSubscriber` + `listSubscribers` helpers in server/db.ts; newsletter router uses the helper
- [x] Re-run tests and e2e verification after db-helper refactor (32 tests pass; curl: new → ok, duplicate → alreadySubscribed; test row cleaned)

## Dashboard Nav: Back to Overview

- [x] Add a "Back to overview" / home link in the dashboard NavigationBar pointing to / (desktop right side + mobile menu)
