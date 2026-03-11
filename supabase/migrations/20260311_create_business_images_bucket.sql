-- Create storage bucket for business images (logos and cover images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-images', 'business-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read files (public bucket)
CREATE POLICY "Public read access for business images"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-images');

-- Allow authenticated business owners to upload images for their own business
CREATE POLICY "Business owners can upload their images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.businesses WHERE owner_id = auth.uid()
  )
);

-- Allow authenticated business owners to update their own images
CREATE POLICY "Business owners can update their images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'business-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.businesses WHERE owner_id = auth.uid()
  )
);

-- Allow authenticated business owners to delete their own images
CREATE POLICY "Business owners can delete their images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'business-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.businesses WHERE owner_id = auth.uid()
  )
);
