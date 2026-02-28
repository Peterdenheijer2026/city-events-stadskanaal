-- Storage bucket 'plein-images': publiek leesbaar (afbeeldingen op pleinpagina's),
-- upload/update voor ingelogde gebruikers.
-- Voer uit in Supabase SQL Editor. Zorg dat de bucket 'plein-images' in Storage bestaat (eventueel aanmaken als Public bucket).

-- Iedereen mag bestanden in plein-images bekijken (voor de publieke site)
create policy "plein_images_public_read"
  on storage.objects for select
  to public
  using ( bucket_id = 'plein-images' );

-- Ingelogde gebruikers mogen uploaden (beheer)
create policy "plein_images_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'plein-images' );

-- Ingelogde gebruikers mogen bestanden overschrijven (upsert)
create policy "plein_images_authenticated_update"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'plein-images' );
