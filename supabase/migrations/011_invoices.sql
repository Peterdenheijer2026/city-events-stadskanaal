-- Facturen: klanten, facturen, factuurregels (beheer)
-- Voer uit in Supabase SQL Editor (Dashboard → SQL Editor).

create extension if not exists pgcrypto;

-- Klant/Betaler gegevens (los van auth-users)
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

-- Factuur header
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

-- Factuurregels
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

-- RLS
alter table public.invoice_customers enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_lines enable row level security;

-- Alleen super admins
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

