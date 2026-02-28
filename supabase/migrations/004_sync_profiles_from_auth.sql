-- Zorg dat alle gebruikers uit auth.users een rij in profiles krijgen,
-- zodat ze in het admin-overzicht (Pleinrechten toewijzen) verschijnen.
-- Voer dit uit in Supabase SQL Editor als e-mailadressen ontbreken.

insert into public.profiles (id, email, is_super_admin)
select
  u.id,
  u.email,
  (lower(u.email) = 'admin@cityeventsstadskanaal.nl')
from auth.users u
on conflict (id) do update set
  email = excluded.email,
  is_super_admin = (lower(excluded.email) = 'admin@cityeventsstadskanaal.nl'),
  updated_at = now();
