-- Organizations (tenants)
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Intelligence Centre profile (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete set null,
  full_name text,
  job_title text,
  email text,
  company_name text,
  company_website text,
  company_industry text,
  company_size text,
  country text,
  region text,
  timezone text default 'UTC',
  role_view text check (role_view in ('leadership','partnership_alliance','product','sales_gtm','investor_strategy')) default 'leadership',
  topic_interests text[] default '{}',
  email_enabled boolean default false,
  email_delivery_time time default '07:00',
  email_frequency text check (email_frequency in ('daily','weekdays','weekly','monthly','custom')) default 'weekly',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Technology sector taxonomy (self-referential for parent/sub-category)
create table technology_sectors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  parent_id uuid references technology_sectors(id) on delete set null
);

-- Industry vertical taxonomy (self-referential for parent/sub-vertical)
create table industry_verticals (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  parent_id uuid references industry_verticals(id) on delete set null
);

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table technology_sectors enable row level security;
alter table industry_verticals enable row level security;

create policy "org members can read their org" on organizations for select using (
  id in (select organization_id from profiles where id = auth.uid())
);
create policy "users can read/update own profile" on profiles for select using (id = auth.uid());
create policy "users can update own profile" on profiles for update using (id = auth.uid());
create policy "users can insert own profile" on profiles for insert with check (id = auth.uid());
create policy "taxonomy readable by authenticated" on technology_sectors for select using (auth.role() = 'authenticated');
create policy "verticals readable by authenticated" on industry_verticals for select using (auth.role() = 'authenticated');
