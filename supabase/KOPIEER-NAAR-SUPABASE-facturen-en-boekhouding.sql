-- =============================================================================
-- CITY EVENTS – Debiteuren + crediteuren (boekhouding)
-- Plak dit in Supabase: Dashboard → SQL Editor → New query → Run
-- Volgorde: 011 → 012 → 013 → 014 → daarna bucket aanmaken → 015
-- =============================================================================

-- ---------- 011: tabellen invoice_customers, invoices, invoice_lines ----------
create extension if not exists pgcrypto;

create table if not exists public.invoice_customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  postcode text,
  house_number text,
  house_number_addition text,
  street text,
  city text,
  country text not null default 'NL',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  invoice_date date not null default current_date,
  customer_id uuid not null references public.invoice_customers(id),
  subject text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  position int not null,
  description text not null,
  quantity numeric not null default 1,
  unit_price_excl numeric not null,
  vat_rate numeric not null,
  constraint invoice_lines_vat_rate_chk check (vat_rate in (0, 0.09, 0.21)),
  constraint invoice_lines_quantity_chk check (quantity > 0),
  constraint invoice_lines_unit_price_chk check (unit_price_excl >= 0)
);

create index if not exists invoice_lines_invoice_id_idx on public.invoice_lines(invoice_id);
create index if not exists invoices_customer_id_idx on public.invoices(customer_id);

alter table public.invoice_customers enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_lines enable row level security;

create policy "invoice_customers_super_admin_all"
  on public.invoice_customers
  for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin)
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin)
  );

create policy "invoices_super_admin_all"
  on public.invoices
  for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin)
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin)
  );

create policy "invoice_lines_super_admin_all"
  on public.invoice_lines
  for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin)
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin)
  );

-- ---------- 012: RLS voor penningmeester + super admin ----------
drop policy if exists "invoice_customers_super_admin_all" on public.invoice_customers;
drop policy if exists "invoices_super_admin_all" on public.invoices;
drop policy if exists "invoice_lines_super_admin_all" on public.invoice_lines;
drop policy if exists "invoice_customers_treasurer_all" on public.invoice_customers;
drop policy if exists "invoices_treasurer_all" on public.invoices;
drop policy if exists "invoice_lines_treasurer_all" on public.invoice_lines;

create policy "invoice_customers_treasurer_all"
  on public.invoice_customers
  for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin)
    or lower((auth.jwt() ->> 'email')) = 'penningmeester@cityeventsstadskanaal.nl'
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin)
    or lower((auth.jwt() ->> 'email')) = 'penningmeester@cityeventsstadskanaal.nl'
  );

create policy "invoices_treasurer_all"
  on public.invoices
  for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin)
    or lower((auth.jwt() ->> 'email')) = 'penningmeester@cityeventsstadskanaal.nl'
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin)
    or lower((auth.jwt() ->> 'email')) = 'penningmeester@cityeventsstadskanaal.nl'
  );

create policy "invoice_lines_treasurer_all"
  on public.invoice_lines
  for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin)
    or lower((auth.jwt() ->> 'email')) = 'penningmeester@cityeventsstadskanaal.nl'
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin)
    or lower((auth.jwt() ->> 'email')) = 'penningmeester@cityeventsstadskanaal.nl'
  );

-- ---------- 013: sent_at / paid_at op invoices ----------
alter table public.invoices
  add column if not exists sent_at timestamptz,
  add column if not exists paid_at timestamptz;

create index if not exists invoices_sent_at_idx on public.invoices(sent_at);
create index if not exists invoices_paid_at_idx on public.invoices(paid_at);

-- ---------- 016: e-mail bij debiteur (factuur per e-mail) ----------
alter table public.invoice_customers
  add column if not exists email text;

-- ---------- 014: crediteuren (purchase_invoices) ----------
create table if not exists public.purchase_invoices (
  id uuid primary key default gen_random_uuid(),
  supplier_name text not null,
  supplier_reference text,
  invoice_date date not null default current_date,
  due_date date,
  amount_incl numeric not null,
  amount_excl numeric,
  vat_rate numeric not null default 0.21,
  paid_at timestamptz,
  notes text,
  file_path text,
  file_name text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint purchase_invoices_amount_chk check (amount_incl >= 0),
  constraint purchase_invoices_vat_chk check (vat_rate in (0, 0.09, 0.21))
);

create index if not exists purchase_invoices_paid_at_idx on public.purchase_invoices(paid_at);
create index if not exists purchase_invoices_invoice_date_idx on public.purchase_invoices(invoice_date desc);

alter table public.purchase_invoices enable row level security;

drop policy if exists "purchase_invoices_treasurer_all" on public.purchase_invoices;

create policy "purchase_invoices_treasurer_all"
  on public.purchase_invoices
  for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin)
    or lower((auth.jwt() ->> 'email')) = 'penningmeester@cityeventsstadskanaal.nl'
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin)
    or lower((auth.jwt() ->> 'email')) = 'penningmeester@cityeventsstadskanaal.nl'
  );

-- =============================================================================
-- STAP NA 014: Maak in Supabase → Storage een PRIVATE bucket: purchase-invoices
-- (Public uit). Daarna onderstaand blok 015 uitvoeren.
-- =============================================================================

-- ---------- 015: Storage policies voor bucket purchase-invoices ----------
drop policy if exists "purchase_invoices_storage_select" on storage.objects;
drop policy if exists "purchase_invoices_storage_insert" on storage.objects;
drop policy if exists "purchase_invoices_storage_update" on storage.objects;
drop policy if exists "purchase_invoices_storage_delete" on storage.objects;

create policy "purchase_invoices_storage_select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'purchase-invoices'
    and (
      exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin)
      or lower((auth.jwt() ->> 'email')) = 'penningmeester@cityeventsstadskanaal.nl'
    )
  );

create policy "purchase_invoices_storage_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'purchase-invoices'
    and (
      exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin)
      or lower((auth.jwt() ->> 'email')) = 'penningmeester@cityeventsstadskanaal.nl'
    )
  );

create policy "purchase_invoices_storage_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'purchase-invoices'
    and (
      exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin)
      or lower((auth.jwt() ->> 'email')) = 'penningmeester@cityeventsstadskanaal.nl'
    )
  );

create policy "purchase_invoices_storage_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'purchase-invoices'
    and (
      exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin)
      or lower((auth.jwt() ->> 'email')) = 'penningmeester@cityeventsstadskanaal.nl'
    )
  );
