-- Make bucket private (employee docs are sensitive)
UPDATE storage.buckets SET public = false WHERE id = 'employee-docs';

-- Replace public SELECT policy with authenticated-only
DROP POLICY IF EXISTS "Public can view employee-docs" ON storage.objects;

CREATE POLICY "Authenticated can view employee-docs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'employee-docs');