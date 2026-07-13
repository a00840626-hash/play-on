-- Los avatares deben ser visibles para todos los usuarios autenticados
-- (Comunidad, chat, roster de partidos), no solo para su dueño.
-- Subir/actualizar/borrar sigue restringido a la carpeta del propio usuario.

DROP POLICY IF EXISTS "Users can read their own avatars" ON storage.objects;

CREATE POLICY "Authenticated users can read avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');
