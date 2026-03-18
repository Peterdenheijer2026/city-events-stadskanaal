-- Facturen: toegang voor penningmeester (en super admin)
-- Voer uit in Supabase SQL Editor NA 011_invoices.sql

-- Vervang policies zodat alleen super admin OF penningmeester@cityeventsstadskanaal.nl toegang heeft.

drop policy if exists "invoice_customers_super_admin_all" on public.invoice_customers;
drop policy if exists "invoices_super_admin_all" on public.invoices;
drop policy if exists "invoice_lines_super_admin_all" on public.invoice_lines;

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

