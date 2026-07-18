-- Movement layer: related signals grouped over time
create table movements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  category text not null,
  title text not null,
  description text,
  trend_stage int check (trend_stage between 1 and 5) default 1,
  -- 1 verified observation, 2 emerging movement, 3 company pattern, 4 sector/vertical trend, 5 market trend
  confidence_label text check (confidence_label in (
    'high_confidence','moderate_confidence','low_confidence','early_signal','conflicting_evidence','unverified'
  )) default 'early_signal',
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table movement_signals (
  movement_id uuid references movements(id) on delete cascade,
  signal_id uuid references signals(id) on delete cascade,
  primary key (movement_id, signal_id)
);

-- Company change timeline (unified view materialised as its own table for fast reads)
create table company_timeline_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  event_type text not null check (event_type in (
    'source','signal','movement','trend_stage_change','score','prediction','ai_maturity_change',
    'leadership_change','hiring_movement','product_launch','product_retirement','initiative',
    'event','partnership','ecosystem_change','report'
  )),
  title text not null,
  description text,
  related_signal_id uuid references signals(id) on delete set null,
  related_movement_id uuid references movements(id) on delete set null,
  occurred_at timestamptz not null default now(),
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);
create index timeline_company_idx on company_timeline_events(company_id, occurred_at desc);

-- Action-oriented alerts
create table alerts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  signal_id uuid references signals(id) on delete set null,
  level text check (level in ('critical','strategic','emerging','informational')) not null default 'informational',
  title text not null,
  what_changed text not null,
  why_it_matters text,
  who_is_affected text,
  possible_consequence text,
  suggested_follow_up text,
  confidence_label text,
  acknowledged boolean default false,
  created_at timestamptz not null default now()
);
create index alerts_company_idx on alerts(company_id);

-- Reports (daily / weekly / monthly / quarterly / on-demand)
create table reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  report_type text check (report_type in (
    'daily','weekly','monthly','quarterly','executive_briefing','detailed_intelligence',
    'competitive_battlecard','company_profile','market_trend_analysis','partner_opportunity',
    'ai_transformation','event_intelligence','risk_opportunity','investment_memo','board_ready_summary'
  )) not null,
  role_view text,
  period_start date,
  period_end date,
  title text not null,
  executive_summary text,
  content jsonb not null default '{}',
  generated_at timestamptz not null default now(),
  generated_by uuid references profiles(id) on delete set null
);

-- Human-in-the-loop review queue
create table review_queue (
  id uuid primary key default gen_random_uuid(),
  item_type text check (item_type in ('signal','movement','prediction','entity_match','contradiction')) not null,
  item_id uuid not null,
  reason text not null,
  status text check (status in ('pending','approved','rejected','edited','merged')) default 'pending',
  assigned_to uuid references profiles(id) on delete set null,
  reviewer_id uuid references profiles(id) on delete set null,
  decision_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table movements enable row level security;
alter table movement_signals enable row level security;
alter table company_timeline_events enable row level security;
alter table alerts enable row level security;
alter table reports enable row level security;
alter table review_queue enable row level security;

create policy "movements readable by authenticated" on movements for select using (auth.role() = 'authenticated');
create policy "movement_signals readable by authenticated" on movement_signals for select using (auth.role() = 'authenticated');
create policy "timeline readable by authenticated" on company_timeline_events for select using (auth.role() = 'authenticated');
create policy "alerts readable by authenticated" on alerts for select using (auth.role() = 'authenticated');
create policy "org reports" on reports for all using (
  organization_id in (select organization_id from profiles where id = auth.uid())
);
create policy "review queue readable by authenticated" on review_queue for select using (auth.role() = 'authenticated');
create policy "review queue updatable by authenticated" on review_queue for update using (auth.role() = 'authenticated');
