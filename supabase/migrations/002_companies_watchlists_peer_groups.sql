create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  description text,
  hq_country text,
  region text,
  employee_count_band text,
  revenue_band text,
  is_public boolean,
  growth_stage text,
  gtm_model text check (gtm_model in ('product_led','enterprise_direct','partner_led','marketplace_led','usage_led','services_supported','hybrid')),
  ai_maturity_level int check (ai_maturity_level between 1 and 5),
  lifecycle_classification text check (lifecycle_classification in (
    'accelerating','expanding','transforming','moving_upmarket','moving_downmarket',
    'increasing_ecosystem_dependency','optimising','stabilising','consolidating',
    'restructuring','contracting','potentially_distressed'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table company_sectors (
  company_id uuid references companies(id) on delete cascade,
  sector_id uuid references technology_sectors(id) on delete cascade,
  primary key (company_id, sector_id)
);

create table company_verticals (
  company_id uuid references companies(id) on delete cascade,
  vertical_id uuid references industry_verticals(id) on delete cascade,
  primary key (company_id, vertical_id)
);

create table watchlists (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  owner_id uuid references profiles(id) on delete set null,
  name text not null,
  monitoring_frequency text check (monitoring_frequency in ('hourly','daily','weekly')) default 'daily',
  created_at timestamptz not null default now()
);

create table watchlist_companies (
  watchlist_id uuid references watchlists(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  primary key (watchlist_id, company_id)
);

create table peer_groups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  name text not null,
  criteria jsonb default '{}',
  created_at timestamptz not null default now()
);

create table peer_group_companies (
  peer_group_id uuid references peer_groups(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  primary key (peer_group_id, company_id)
);

alter table companies enable row level security;
alter table company_sectors enable row level security;
alter table company_verticals enable row level security;
alter table watchlists enable row level security;
alter table watchlist_companies enable row level security;
alter table peer_groups enable row level security;
alter table peer_group_companies enable row level security;

create policy "companies readable by authenticated" on companies for select using (auth.role() = 'authenticated');
create policy "company_sectors readable" on company_sectors for select using (auth.role() = 'authenticated');
create policy "company_verticals readable" on company_verticals for select using (auth.role() = 'authenticated');
create policy "org watchlists" on watchlists for all using (
  organization_id in (select organization_id from profiles where id = auth.uid())
);
create policy "org watchlist companies" on watchlist_companies for all using (
  watchlist_id in (select id from watchlists w where w.organization_id in (select organization_id from profiles where id = auth.uid()))
);
create policy "org peer groups" on peer_groups for all using (
  organization_id in (select organization_id from profiles where id = auth.uid())
);
create policy "org peer group companies" on peer_group_companies for all using (
  peer_group_id in (select id from peer_groups pg where pg.organization_id in (select organization_id from profiles where id = auth.uid()))
);
