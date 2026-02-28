-- Ingelogde gebruikers mogen bestanden in plein-images verwijderen (beheer).
-- Voer uit in Supabase SQL Editor.

create policy "plein_images_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'plein-images' );
