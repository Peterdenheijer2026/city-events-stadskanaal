-- Zorg dat inlog met admin@cityeventsstadskanaal.nl altijd alle profielen mag lezen
-- (ook als er nog geen profielrij voor die user is). Voer uit in Supabase SQL Editor.

create policy "profiles_select_admin_email"
  on public.profiles
  for select
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@cityeventsstadskanaal.nl');

-- Zelfde voor plein_permissions: admin-e-mail mag alles
create policy "plein_permissions_admin_email"
  on public.plein_permissions
  for all
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@cityeventsstadskanaal.nl');
