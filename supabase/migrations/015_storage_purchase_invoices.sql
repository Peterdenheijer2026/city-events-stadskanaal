-- Storage policies voor bucket purchase-invoices (alleen penningmeester + super admin)
-- Bucket moet bestaan en private zijn: Dashboard → Storage → New bucket → purchase-invoices (public uit)

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
