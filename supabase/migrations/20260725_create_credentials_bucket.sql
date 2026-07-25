-- Storage bucket for business credential documents (licenses, insurance
-- certificates, certifications).
--
-- Unlike business-images this bucket is PRIVATE: these are sensitive legal
-- documents containing license numbers and personal details. They are read by
-- admins through short-lived signed URLs, never served publicly.
--
-- Run this in the Supabase SQL editor (Dashboard -> SQL Editor -> paste -> Run).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-credentials',
  'business-credentials',
  false,
  10485760, -- 10 MB
  ARRAY['application/pdf','image/jpeg','image/png','image/webp','image/heic']
)
ON CONFLICT (id) DO UPDATE
  SET public = false,
      file_size_limit = 10485760,
      allowed_mime_types = ARRAY['application/pdf','image/jpeg','image/png','image/webp','image/heic'];

-- Files live under <business_id>/<filename>, so the first path segment
-- determines ownership.

DROP POLICY IF EXISTS "Business owners can upload credential documents" ON storage.objects;
CREATE POLICY "Business owners can upload credential documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-credentials'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.businesses WHERE owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Business owners can read their credential documents" ON storage.objects;
CREATE POLICY "Business owners can read their credential documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'business-credentials'
  AND (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.businesses WHERE owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

DROP POLICY IF EXISTS "Business owners can delete their credential documents" ON storage.objects;
CREATE POLICY "Business owners can delete their credential documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'business-credentials'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.businesses WHERE owner_id = auth.uid()
  )
);
