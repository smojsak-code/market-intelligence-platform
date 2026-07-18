# Market Intelligence Platform

Evidence-first market and competitive intelligence for B2B SaaS. This repo is
the **Release 1 ("Focused Evidence Foundation") scaffold** described in the
product plan — it proves the core evidence chain, not the full 7-release
roadmap. See [ARCHITECTURE.md](./ARCHITECTURE.md) for how this maps to the
full product plan and what's deliberately deferred to later releases.

> Source → Raw document (Data Vault) → Normalized document → Structured signal
> (with confidence) → Company timeline event → Alert / Report

## Stack

- **Next.js 14** (App Router, TypeScript, Tailwind) — `src/app`
- **Supabase** (Postgres, Auth, Row Level Security) — `supabase/migrations`
- Ingestion pipeline reference implementation — `scripts/ingest-example.ts`

A live Supabase project has already been provisioned for this repo:
`market-intelligence-platform` (project ref `nihappvvbgztaqydzsma`), seeded
with the taxonomy and ~25 starter companies from `supabase/seed.sql`.

## Getting started

```bash
npm install
cp .env.local.example .env.local
# Add SUPABASE_SERVICE_ROLE_KEY from Supabase Dashboard > Project Settings > API
# (needed only for the ingestion script and server-side jobs — never expose
# it to the browser / commit it to git)

npm run dev
```

Open http://localhost:3000, sign up with any email/password (Supabase Auth),
and you'll land on the Dashboard. Because `signals`/`alerts` require an
authenticated session, sign-up is required before any data is visible even
though the schema is already seeded with companies and taxonomy.

### Run the ingestion pipeline example

```bash
npm run ingest:example
```

This walks the full evidence chain end to end against the live database:
inserts a `source`, a `raw_document` (immutable vault entry), a
`normalized_document`, a `signal` with a computed confidence label, a
`company_timeline_events` row, and — because the example signal is high
magnitude / high relevance — an `alerts` row. Open `/companies/<uipath-id>`
or `/alerts` in the app afterwards to see it rendered.

### Database schema

The schema lives in `supabase/migrations/*.sql` (applied in order) and
`supabase/seed.sql` (taxonomy + starter watchlist). If you want to run this
against a fresh Supabase project instead of the provisioned one, apply the
migrations via the Supabase CLI or dashboard SQL editor in numeric order,
then run the seed file.

## What's implemented (Release 1 scope)

- Company master data, technology sector taxonomy, industry vertical
  taxonomy, watchlists, peer groups (schema + seed)
- Source registry with a reliability scoring formula
  (`sources.reliability_score`, generated column)
- Data Vault: immutable raw evidence layer, normalised content layer
- Signal layer with entity-match / extraction confidence, corroboration
  count, magnitude, strategic relevance, and a visible confidence label
  (`high_confidence` … `unverified`)
- Contradiction tracking table (`signal_contradictions`)
- Company change timeline (unified, filterable by event type)
- Action-oriented alerts (what changed / why it matters / who's affected /
  suggested follow-up)
- Human review queue schema (`review_queue`)
- Intelligence Centre profile: role-based view, email preferences
- Dashboard, Companies, Company detail/timeline, Alerts, Reports,
  Review Queue, Intelligence Centre pages
- Supabase Auth (email/password) with RLS on every table

## What's intentionally stubbed / deferred

Per the roadmap in the product plan, these are **not** built yet:

- Real connectors (jobs boards, press feeds, filings) — the ingestion
  script uses one bundled example document to prove the pipeline shape
- Trend Formation Engine stages 4–5 (sector/vertical/market trends),
  benchmarking UI, prediction accountability, Intelligence Analyst
  (Claude-powered RAG), Insight Workspace, scheduled email delivery,
  PDF/DOCX export, multi-tenant billing
- Automated daily/weekly report generation jobs (the `reports` table and
  page exist; nothing populates them yet)

These map to Releases 2–7 in the product plan.

## Project structure

```
src/app/            Next.js App Router pages (dashboard, companies, alerts, ...)
src/components/      Shared UI (nav, confidence badge)
src/lib/             Supabase clients, auth helper, shared types
scripts/             Ingestion pipeline reference implementation
supabase/migrations/ Versioned schema (source of truth also applied to the live project)
supabase/seed.sql    Taxonomy + starter watchlist of ~25 SaaS companies
```
