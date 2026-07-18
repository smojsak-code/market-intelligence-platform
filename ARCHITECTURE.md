# Architecture

## Evidence chain

The product's core differentiator is that every conclusion is traceable
back to a source. This scaffold implements the chain literally as a
sequence of tables, each layer only ever additive:

```
sources               (source reliability profile)
  -> raw_documents     (immutable Data Vault — never overwritten, only superseded)
    -> normalized_documents  (cleaned text, extracted entities, classification)
      -> signals              (structured fact/change, with a visible confidence_label)
        -> company_timeline_events  (rolls signals/movements into a per-company history)
        -> alerts                    (what changed / why it matters / suggested follow-up)
        -> movements -> movement_signals (groups related signals; trend_stage 1-5)
```

`raw_documents.superseded_by` preserves history instead of deleting rows,
per the product plan's "historical memory" principle (section 3.4).

## Confidence model (v1)

`scripts/ingest-example.ts` implements a simplified version of the
Evidence Confidence & Contradiction Engine (section 7 of the product plan):

- First-party official source + 2+ independent corroborations → `high_confidence`
- First-party official source, single corroboration → `moderate_confidence`
- Non-first-party / promotional source → `low_confidence` (and flagged
  `requires_review = true`)

`sources.reliability_score` is a generated column averaging independence,
authority, historical accuracy, and inverse promotional bias — matching the
source factors listed in section 8. This is a starting formula; Release 2+
should replace it with a learned/human-corrected model once
`review_queue` decisions accumulate (section 20: human-vs-model agreement
becomes a data-quality metric).

## Multi-tenancy (partial)

`organizations` + `profiles.organization_id` + RLS policies scope
`watchlists`, `peer_groups`, and `reports` per organization. Reference data
(`companies`, `sources`, `signals`, `alerts`, taxonomy) is shared across all
authenticated users in this Release 1 scaffold — full per-tenant data
isolation and billing is Release 7 ("Commercial Platform") scope, not
implemented here.

## Why Next.js + Supabase

Supabase gives Postgres + Auth + RLS + generated columns out of the box,
which maps directly onto the "immutable vault, don't overwrite, RLS-scoped
multi-tenancy" requirements in the product plan without hand-rolling an
API layer. Next.js Server Components query Supabase directly (see
`src/lib/supabase/server.ts`), keeping the evidence-chain queries close to
the schema rather than behind a separate API service — appropriate for a
Release 1 scaffold; a dedicated ingestion service (queue + workers) should
replace `scripts/ingest-example.ts` once real connectors are added in
Release 2.

## Mapping to the product plan's roadmap

| Release | Status |
|---|---|
| 1. Focused Evidence Foundation | **This repo.** Schema, seed data, auth, dashboard/company/alerts/reports/review-queue pages, one working ingestion example. |
| 2. Intelligence & Benchmarking | Not started. Needs: real connectors, peer group UI, benchmarking views, role-based dashboards, PDF/DOCX export. |
| 3. Intelligence Analyst & Workspace | Not started. Needs: RAG over the vault, Claude integration, Insight Workspace. |
| 4. Strategic & Trend Intelligence | Not started. Needs: Trend Explorer, stages 4-5, monthly reports. |
| 5. Prediction Accountability | Not started. Needs: predictions table, outcome tracking, accuracy dashboard. |
| 6. Personalisation & Delivery | Not started. Needs: email delivery, multiple profiles, shared workspaces. |
| 7. Commercial Platform | Not started. Needs: full multi-tenancy, billing, API access, white-labelling. |
