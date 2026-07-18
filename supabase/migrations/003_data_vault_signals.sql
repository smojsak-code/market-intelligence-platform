-- Source reliability framework
create table sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  base_url text,
  source_type text check (source_type in (
    'regulatory_filing','official_financial_report','official_product_docs','official_release_notes',
    'government','confirmed_customer_statement','reputable_news_media','industry_publication',
    'recognised_analyst','executive_interview','promotional_blog','aggregated_summary',
    'unverified_social_post','rumour_site','other'
  )) default 'other',
  is_first_party boolean default false,
  independence_score numeric check (independence_score between 0 and 1) default 0.5,
  authority_score numeric check (authority_score between 0 and 1) default 0.5,
  historical_accuracy_score numeric check (historical_accuracy_score between 0 and 1) default 0.5,
  promotional_bias_score numeric check (promotional_bias_score between 0 and 1) default 0.5,
  correction_count int default 0,
  reliability_score numeric generated always as (
    round((
      coalesce(independence_score,0.5) + coalesce(authority_score,0.5) +
      coalesce(historical_accuracy_score,0.5) + (1 - coalesce(promotional_bias_score,0.5))
    ) / 4, 3)
  ) stored,
  created_at timestamptz not null default now()
);

-- Raw evidence layer: immutable, never overwritten
create table raw_documents (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references sources(id) on delete set null,
  company_id uuid references companies(id) on delete set null,
  url text,
  fetched_at timestamptz not null default now(),
  content_hash text not null,
  raw_content text not null,
  http_status int,
  metadata jsonb default '{}',
  superseded_by uuid references raw_documents(id),
  created_at timestamptz not null default now()
);
create index raw_documents_hash_idx on raw_documents(content_hash);
create index raw_documents_company_idx on raw_documents(company_id);

-- Normalised content layer
create table normalized_documents (
  id uuid primary key default gen_random_uuid(),
  raw_document_id uuid references raw_documents(id) on delete cascade,
  cleaned_text text,
  extracted_entities jsonb default '[]',
  classification text[] default '{}',
  language text default 'en',
  created_at timestamptz not null default now()
);

-- Signal layer: structured facts/changes
create table signals (
  id uuid primary key default gen_random_uuid(),
  normalized_document_id uuid references normalized_documents(id) on delete set null,
  raw_document_id uuid references raw_documents(id) on delete set null,
  source_id uuid references sources(id) on delete set null,
  company_id uuid references companies(id) on delete cascade,
  category text not null check (category in (
    'company_performance','workforce_hiring','sales_gtm','marketing_positioning',
    'ai_integration','new_initiative','new_product','market_influence','event','ecosystem_partnership'
  )),
  subcategory text,
  headline text not null,
  description text,
  evidence_excerpt text,
  entity_match_confidence numeric check (entity_match_confidence between 0 and 1) default 0.8,
  extraction_confidence numeric check (extraction_confidence between 0 and 1) default 0.8,
  corroboration_count int default 1,
  magnitude text check (magnitude in ('minor','moderate','major')) default 'moderate',
  strategic_relevance text check (strategic_relevance in ('low','medium','high')) default 'medium',
  confidence_label text check (confidence_label in (
    'high_confidence','moderate_confidence','low_confidence','early_signal','conflicting_evidence','unverified'
  )) not null default 'unverified',
  occurred_at timestamptz,
  detected_at timestamptz not null default now(),
  requires_review boolean default false,
  created_at timestamptz not null default now()
);
create index signals_company_idx on signals(company_id);
create index signals_category_idx on signals(category);

-- Contradiction tracking between signals
create table signal_contradictions (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid references signals(id) on delete cascade,
  conflicting_signal_id uuid references signals(id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

alter table sources enable row level security;
alter table raw_documents enable row level security;
alter table normalized_documents enable row level security;
alter table signals enable row level security;
alter table signal_contradictions enable row level security;

create policy "sources readable by authenticated" on sources for select using (auth.role() = 'authenticated');
create policy "raw_documents readable by authenticated" on raw_documents for select using (auth.role() = 'authenticated');
create policy "normalized_documents readable by authenticated" on normalized_documents for select using (auth.role() = 'authenticated');
create policy "signals readable by authenticated" on signals for select using (auth.role() = 'authenticated');
create policy "contradictions readable by authenticated" on signal_contradictions for select using (auth.role() = 'authenticated');
