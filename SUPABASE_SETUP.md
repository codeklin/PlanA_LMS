# Supabase Setup Guide for PlanA LMS

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Click "New Project"
5. Fill in:
   - Name: `plana-lms`
   - Database Password: (generate strong password)
   - Region: Choose closest to Nigeria (e.g., Frankfurt, London)
6. Click "Create new project"
7. Wait 2-3 minutes for setup

## Step 2: Get API Keys

1. In your project dashboard, go to Settings → API
2. Copy these values:
   - Project URL
   - anon/public key
   - service_role key (keep secret!)

3. Create `.env.local` in your project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 3: Run Database Migration

1. In Supabase Dashboard, go to SQL Editor
2. Click "New Query"
3. Copy and paste the entire SQL schema from `PLANA_IMPLEMENTATION_GUIDE.md` (Phase 1.3)
4. Click "Run" or press Ctrl+Enter
5. Verify tables created in Table Editor

## Step 4: Configure Storage Buckets

1. Go to Storage in Supabase Dashboard
2. Create these buckets:

### Bucket: course-materials
- Public: Yes
- File size limit: 100MB
- Allowed MIME types: video/*, application/pdf, image/*

### Bucket: submissions
- Public: No (private)
- File size limit: 50MB
- Allowed MIME types: */*

### Bucket: profiles
- Public: Yes
- File size limit: 5MB
- Allowed MIME types: image/*

### Bucket: certificates
- Public: Yes
- File size limit: 2MB
- Allowed MIME types: application/pdf, image/*

3. For each bucket, set up policies:

#### course-materials policies:
```sql
-- Allow public read
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-materials');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-materials' 
  AND auth.role() = 'authenticated'
);
```

#### submissions policies:
```sql
-- Users can read own submissions
CREATE POLICY "Users can read own submissions"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'submissions' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can upload own submissions
CREATE POLICY "Users can upload own submissions"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'submissions' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Step 5: Configure Authentication

1. Go to Authentication → Providers
2. Enable Email provider (already enabled by default)
3. Configure email templates:
   - Go to Authentication → Email Templates
   - Customize "Confirm signup" template with PlanA branding
   - Customize "Reset password" template

4. Optional: Enable social providers (Google, GitHub)

## Step 6: Set Up Row Level Security (RLS)

The SQL migration already enabled RLS. Verify policies:

1. Go to Authentication → Policies
2. Check each table has appropriate policies
3. Test policies with SQL Editor:

```sql
-- Test as authenticated user
SELECT * FROM profiles WHERE id = auth.uid();

-- Test course access
SELECT * FROM courses WHERE is_published = true;
```

## Step 7: Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

## Step 8: Test Connection

Create a test file `test-supabase.ts`:

```typescript
import { supabaseClient } from './lib/supabase/client';

async function testConnection() {
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('count');
  
  if (error) {
    console.error('Connection failed:', error);
  } else {
    console.log('Connection successful!', data);
  }
}

testConnection();
```

Run: `npx tsx test-supabase.ts`

## Step 9: Seed Initial Data (Optional)

Create admin user and sample courses:

```sql
-- Create admin profile (after signing up via UI)
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-admin@email.com';

-- Create sample course
INSERT INTO courses (title, description, category, difficulty, is_published)
VALUES (
  'Build a Landing Page in 7 Days',
  'Create a professional landing page for Nigerian businesses',
  'Web Development',
  'beginner',
  true
);
```

## Step 10: Configure Realtime (Optional)

1. Go to Database → Replication
2. Enable replication for tables you want real-time updates:
   - learner_progress
   - submissions
   - events

## Step 11: Set Up Database Backups

1. Go to Settings → Database
2. Enable Point-in-Time Recovery (PITR) for production
3. Configure backup schedule

## Step 12: Production Checklist

Before going live:

- [ ] Change all default passwords
- [ ] Review and test all RLS policies
- [ ] Set up custom domain
- [ ] Configure CORS settings
- [ ] Enable database backups
- [ ] Set up monitoring and alerts
- [ ] Test file upload limits
- [ ] Verify email templates
- [ ] Test authentication flow
- [ ] Load test with expected user count

## Troubleshooting

### Connection Issues
- Verify API keys in `.env.local`
- Check project is not paused (free tier pauses after inactivity)
- Verify network/firewall settings

### RLS Policy Errors
- Check user is authenticated: `SELECT auth.uid();`
- Review policy conditions
- Test with service_role key (bypasses RLS) to isolate issue

### Storage Upload Fails
- Check file size limits
- Verify MIME type allowed
- Check storage policies
- Ensure bucket exists

## Next Steps

1. Update `app/layout.tsx` to use `SupabaseAuthProvider`
2. Replace old API calls with Supabase API
3. Test authentication flow
4. Migrate existing data (if any)
5. Deploy to Vercel

## Useful Commands

```bash
# Generate TypeScript types from Supabase schema
npx supabase gen types typescript --project-id your-project-id > lib/supabase/database.types.ts

# Test Supabase connection
npx supabase status

# View logs
# Go to Supabase Dashboard → Logs
```

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
