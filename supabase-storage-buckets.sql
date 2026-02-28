-- =====================================================
-- PlanA LMS Storage Buckets Setup
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('course-materials', 'course-materials', true, 52428800, NULL),
  ('submissions', 'submissions', false, 52428800, NULL),
  ('profiles', 'profiles', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('certificates', 'certificates', true, 10485760, ARRAY['application/pdf', 'image/png', 'image/jpeg'])
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- COURSE MATERIALS BUCKET POLICIES
-- =====================================================

CREATE POLICY "Public read access for course materials"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-materials');

CREATE POLICY "Authenticated users can upload course materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-materials');

CREATE POLICY "Instructors can update course materials"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-materials' AND
  (auth.jwt() ->> 'role')::text = ANY(ARRAY['instructor', 'admin', 'super-admin'])
);

CREATE POLICY "Instructors can delete course materials"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-materials' AND
  (auth.jwt() ->> 'role')::text = ANY(ARRAY['instructor', 'admin', 'super-admin'])
);

-- =====================================================
-- SUBMISSIONS BUCKET POLICIES
-- =====================================================

CREATE POLICY "Learners can upload their own submissions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Learners can view their own submissions"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Instructors can view all submissions"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'submissions' AND
  (auth.jwt() ->> 'role')::text = ANY(ARRAY['instructor', 'admin', 'super-admin'])
);

CREATE POLICY "Learners can update their own submissions"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- PROFILES BUCKET POLICIES
-- =====================================================

CREATE POLICY "Public read access for profiles"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');

CREATE POLICY "Users can upload their own profile picture"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own profile picture"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own profile picture"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- CERTIFICATES BUCKET POLICIES
-- =====================================================

CREATE POLICY "Public read access for certificates"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'certificates');

CREATE POLICY "System can create certificates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Admins can delete certificates"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'certificates' AND
  (auth.jwt() ->> 'role')::text = ANY(ARRAY['admin', 'super-admin'])
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check that buckets were created
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
ORDER BY name;

-- Check that policies were created
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;
