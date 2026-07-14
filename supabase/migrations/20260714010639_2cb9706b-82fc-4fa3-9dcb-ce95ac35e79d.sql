DROP POLICY IF EXISTS "Users can read their own avatars" ON storage.objects;
CREATE POLICY "Authenticated users can read avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');