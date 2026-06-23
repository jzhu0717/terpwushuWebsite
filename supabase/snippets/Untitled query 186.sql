-- 1. Allow everyone to download/view files in the archives bucket
CREATE POLICY "Allow public select on archives" ON storage.objects 
FOR SELECT TO anon, authenticated USING (bucket_id = 'archives');

-- 2. Allow file uploads to the archives bucket
CREATE POLICY "Allow admin insert on archives" ON storage.objects 
FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'archives');

-- 3. Allow replacing/overwriting files (needed for your upsert logic)
CREATE POLICY "Allow admin update on archives" ON storage.objects 
FOR UPDATE TO anon, authenticated USING (bucket_id = 'archives');

-- 4. Allow deleting old files (needed for your cleanup logic)
CREATE POLICY "Allow admin delete on archives" ON storage.objects 
FOR DELETE TO anon, authenticated USING (bucket_id = 'archives');