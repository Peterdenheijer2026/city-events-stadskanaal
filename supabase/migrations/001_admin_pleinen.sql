-- Beheer: profielen (super admin), plein-rechten, plein-content, storage
-- Run dit in Supabase SQL Editor (Dashboard → SQL Editor).

-- Profiel per gebruiker (koppeling auth.users); is_super_admin voor admin@cityeventsstadskanaal.nl
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  is_super_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Welke pleinen mag een gebruiker beheren?
create table if not exists public.plein_permissions (
  user_id uuid not null references auth.users(id) on delete cascade,
  plein_slug text not null,
  primary key (user_id, plein_slug)
);

-- Content per plein (algemene tekst, programma als tekst, max 4 afbeeldingen)
create table if not exists public.plein_content (
  plein_slug text primary key,
  general_text text,
  program_text text,
  image_paths text[] default '{}',
  updated_at timestamptz not null default now()
);

-- Trigger: bij nieuwe user een profiel aanmaken
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, is_super_admin)
  values (
    new.id,
    new.email,
    (lower(new.email) = 'admin@cityeventsstadskanaal.nl')
  )
  on conflict (id) do update set
    email = excluded.email,
    is_super_admin = (lower(excluded.email) = 'admin@cityeventsstadskanaal.nl'),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute function public.handle_new_user();

-- Bestaande users ook een profiel geven (eenmalig)
insert into public.profiles (id, email, is_super_admin)
select id, email, (lower(email) = 'admin@cityeventsstadskanaal.nl')
from auth.users
on conflict (id) do update set
  email = excluded.email,
  is_super_admin = (lower(excluded.email) = 'admin@cityeventsstadskanaal.nl'),
  updated_at = now();

-- RLS
alter table public.profiles enable row level security;
alter table public.plein_permissions enable row level security;
alter table public.plein_content enable row level security;

-- profiles: eigen profiel lezen; super admin mag alles
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_select_super_admin" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin)
  );
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- plein_permissions: alleen super admin mag lezen/schrijven
create policy "plein_permissions_super_admin" on public.plein_permissions
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin)
  );
-- Editors mogen alleen hun eigen rechten lezen
create policy "plein_permissions_own" on public.plein_permissions
  for select using (user_id = auth.uid());

-- plein_content: iedereen mag lezen (publieke plein-pagina's); bewerken als je rechten hebt
create policy "plein_content_public_read" on public.plein_content
  for select using (true);
create policy "plein_content_edit_perm" on public.plein_content
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin)
    or exists (select 1 from public.plein_permissions pp where pp.plein_slug = plein_content.plein_slug and pp.user_id = auth.uid())
  );

-- Storage buckets (aanmaken in Dashboard → Storage of via API)
-- Bucket: plein-programmes (private of public naar wens)
-- Bucket: plein-images (public voor tonen op site)
-- RLS voor storage: zie Supabase Storage docs; allow read public, insert/update voor ingelogde users met permissie
comment on table public.plein_content is 'Content per plein: algemene tekst, programma (1 bestand), max 4 afbeeldingen.';
