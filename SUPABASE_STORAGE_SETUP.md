# Supabase Storage Buckets Setup

## Required Storage Buckets

PlanA LMS needs 4 storage buckets for different types of files:

1. **course-materials** - Course content, videos, PDFs, resources
2. **submissions** - Learner project submissions and deliverables
3. **profiles** - User profile pictures and avatars
4. **certificates** - Generated certificates and portfolio pieces

## Option 1: Create via Supabase Dashboard (Recommended)

### Step-by-Step Instructions

1. **Go to Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Open Storage Section**
   - Click "Storage" in the left sidebar
   - Click "New bucket" button

3. **Create Each Bucket**

   **Bucket 1: course-materials**
   - Name: `course-materials`
   - Public bucket: ✅ Yes (checked)
   - File size limit: 50 MB
   - Allowed MIME types: Leave empty (all types)
   - Click "Create bucket"

   **Bucket 2: submissions**
   - Name: `submissions`
   - Public bucket: ❌ No (unchecked) - Only authenticated users
   - File size limit: 50 MB
   - Allowed MIME types: Leave empty
   - Click "Create bucket"

   **Bucket 3: profiles**
   - Name: `profiles`
   - Public bucket: ✅ Yes (checked)
   - File size limit: 5 MB
   - Allowed MIME types: `image/jpeg,image/png,image/webp,image/gif`
   - Click "Create bucket"

   **Bucket 4: certificates**
   - Name: `certificates`
   - Public bucket: ✅ Yes (checked)
   - File size limit: 10 MB
   - Allowed MIME types: `application/pdf,image/png,image/jpeg`
   - Click "Create bucket"

4. **Set Up Policies for Each Bucket**

   For each bucket, click on it, then go to "Policies" tab:

   ### course-materials Policies
   ```
   Policy 1: "Public Read Access"
   - Allowed operation: SELECT
   - Target roles: public
   - USING expression: true
   
   Policy 2: "Authenticated Upload"
   - Allowed operation: INSERT
   - Target roles: authenticated
   - USING expression: true
   
   Policy 3: "Instructor/Admin Update"
   - Allowed operation: UPDATE
   - Target roles: authenticated
   - USING expression: 
     (auth.jwt() ->> 'role')::text = ANY(ARRAY['instructor', 'admin', 'super-admin'])
   
   Policy 4: "Instructor/Admin Delete"
   - Allowed operation: DELETE
   - Target roles: authenticated
   - USING expression:
     (auth.jwt() ->> 'role')::text = ANY(ARRAY['instructor', 'admin', 'super-admin'])
   ```

   ### submissions Policies
   ```
   Policy 1: "Learners can upload their own submissions"
   - Allowed operation: INSERT
   - Target roles: authenticated
   - WITH CHECK expression:
     bucket_id = 'submissions' AND (storage.foldername(name))[1] = auth.uid()::text
   
   Policy 2: "Learners can view their own submissions"
   - Allowed operation: SELECT
   - Target roles: authenticated
   - USING expression:
     bucket_id = 'submissions' AND (storage.foldername(name))[1] = auth.uid()::text
   
   Policy 3: "Instructors can view all submissions"
   - Allowed operation: SELECT
   - Target roles: authenticated
   - USING expression:
     (auth.jwt() ->> 'role')::text = ANY(ARRAY['instructor', 'admin', 'super-admin'])
   
   Policy 4: "Learners can update their own submissions"
   - Allowed operation: UPDATE
   - Target roles: authenticated
   - USING expression:
     bucket_id = 'submissions' AND (storage.foldername(name))[1] = auth.uid()::text
   ```

   ### profiles Policies
   ```
   Policy 1: "Public Read Access"
   - Allowed operation: SELECT
   - Target roles: public
   - USING expression: true
   
   Policy 2: "Users can upload their own profile picture"
   - Allowed operation: INSERT
   - Target roles: authenticated
   - WITH CHECK expression:
     bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text
   
   Policy 3: "Users can update their own profile picture"
   - Allowed operation: UPDATE
   - Target roles: authenticated
   - USING expression:
     bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text
   
   Policy 4: "Users can delete their own profile picture"
   - Allowed operation: DELETE
   - Target roles: authenticated
   - USING expression:
     bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text
   ```

   ### certificates Policies
   ```
   Policy 1: "Public Read Access"
   - Allowed operation: SELECT
   - Target roles: public
   - USING expression: true
   
   Policy 2: "System can create certificates"
   - Allowed operation: INSERT
   - Target roles: authenticated
   - WITH CHECK expression: true
   
   Policy 3: "Admin can delete certificates"
   - Allowed operation: DELETE
   - Target roles: authenticated
   - USING expression:
     (auth.jwt() ->> 'role')::text = ANY(ARRAY['admin', 'super-admin'])
   ```

## Option 2: Create via SQL (Quick Method)

If you prefer SQL, run this in the Supabase SQL Editor:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('course-materials', 'course-materials', true, 52428800, NULL),
  ('submissions', 'submissions', false, 52428800, NULL),
  ('profiles', 'profiles', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('certificates', 'certificates', true, 10485760, ARRAY['application/pdf', 'image/png', 'image/jpeg'])
ON CONFLICT (id) DO NOTHING;

-- Create policies for course-materials bucket
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

-- Create policies for submissions bucket
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

-- Create policies for profiles bucket
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

-- Create policies for certificates bucket
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
```

## Verify Setup

After creating the buckets, verify they exist:

```sql
-- Check buckets
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects'
ORDER BY policyname;
```

You should see:
- 4 buckets created
- Multiple policies for each bucket

## Usage in Code

The buckets are already integrated in `lib/supabase-api.ts`:

```typescript
// Upload a file
const result = await supabaseApi.uploadFile(
  'course-materials',  // bucket name
  'courses/intro-to-web-dev/lesson-1.pdf',  // file path
  file  // File object
);

// Delete a file
await supabaseApi.deleteFile(
  'submissions',
  'user-id/project-submission.zip'
);
```

## File Organization Structure

### course-materials/
```
course-materials/
├── courses/
│   ├── {course-id}/
│   │   ├── videos/
│   │   ├── pdfs/
│   │   └── resources/
```

### submissions/
```
submissions/
├── {user-id}/
│   ├── {cohort-id}/
│   │   ├── {task-id}/
│   │   │   └── submission.zip
```

### profiles/
```
profiles/
├── {user-id}/
│   └── avatar.jpg
```

### certificates/
```
certificates/
├── {user-id}/
│   ├── {course-id}-certificate.pdf
│   └── {course-id}-badge.png
```

## Testing Storage

After setup, test with:

1. **Upload a test file via Supabase Dashboard**
   - Go to Storage > course-materials
   - Click "Upload file"
   - Upload any file
   - Verify it appears

2. **Test via API**
   - Register a user in your app
   - Try uploading a profile picture
   - Check if it appears in the profiles bucket

## Troubleshooting

### Issue: "new row violates row-level security policy"
**Solution:** Check that policies are created correctly. Run the policy creation SQL again.

### Issue: "Bucket already exists"
**Solution:** This is fine. The buckets are already created. Just set up the policies.

### Issue: Files not uploading
**Solution:** 
1. Check file size limits
2. Verify MIME types are allowed
3. Check browser console for errors
4. Verify authentication token is valid

## Security Notes

- **course-materials**: Public read, authenticated write (instructors can manage)
- **submissions**: Private, only owner and instructors can access
- **profiles**: Public read, owner can write
- **certificates**: Public read, system can create, admins can delete

All policies use Row Level Security (RLS) to ensure data privacy.

## Next Steps

After creating storage buckets:
1. ✅ Supabase migration completed
2. ✅ Storage buckets created
3. ⏳ Test authentication flow
4. ⏳ Test file uploads
5. ⏳ Deploy to Vercel

---

**Status**: Ready for testing! 🚀
