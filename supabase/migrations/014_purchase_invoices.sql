-- Inkoopfacturen (crediteuren / nog te betalen) + bestand in Storage bucket purchase-invoices
-- Voer uit NA 013. Maak in Supabase Dashboard → Storage een private bucket: purchase-invoices
-- Voer daarna 015_storage_purchase_invoices.sql uit.

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
