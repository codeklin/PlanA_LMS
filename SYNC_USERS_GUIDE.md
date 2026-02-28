# Sync Existing Users to Profiles Table

## Overview

This guide helps you sync existing authenticated users from `auth.users` to the `profiles` table. This is needed when:
- Users were created but profiles weren't
- You're migrating from another system
- The database trigger wasn't set up initially

## Quick Start

### Option 1: Run Complete Sync Script (Recommended)

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Click "New query"
4. Copy and paste the entire contents of `supabase-sync-existing-users.sql`
5. Click "Run"

This will:
- ✅ Show how many users need syncing
- ✅ Create missing profiles
- ✅ Update incomplete profiles
- ✅ Verify sync was successful

### Option 2: Step-by-Step Manual Sync

If you prefer to run each step separately:

#### Step 1: Check Current Status

```sql
-- See how many users need profiles
SELECT 
  COUNT(*) as total_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  COUNT(*) - (SELECT COUNT(*) FROM profiles) as users_missing_profiles
FROM auth.users;
```

#### Step 2: View Users Without Profiles

```sql
-- List all users that need profiles
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.raw_user_meta_data->>'first_name' as first_name,
  u.raw_user_meta_data->>'last_name' as last_name,
  u.raw_user_meta_data->>'role' as role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;
```

#### Step 3: Create Missing Profiles

```sql
-- Create profiles for all users without one
INSERT INTO profiles (id, email, first_name, last_name, role, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'first_name', '') as first_name,
  COALESCE(u.raw_user_meta_data->>'last_name', '') as last_name,
  COALESCE(u.raw_user_meta_data->>'role', 'learner') as role,
  u.created_at,
  NOW() as updated_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

#### Step 4: Verify Sync

```sql
-- Check if sync was successful
SELECT 
  COUNT(*) as total_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  COUNT(*) - (SELECT COUNT(*) FROM profiles) as remaining_unsynced
FROM auth.users;
```

Should show `remaining_unsynced = 0`

## Advanced: Update Incomplete Profiles

If some profiles have empty names or missing data:

```sql
-- Update profiles with data from auth metadata
UPDATE profiles p
SET 
  first_name = COALESCE(u.raw_user_meta_data->>'first_name', p.first_name),
  last_name = COALESCE(u.raw_user_meta_data->>'last_name', p.last_name),
  role = COALESCE(u.raw_user_meta_data->>'role', p.role),
  updated_at = NOW()
FROM auth.users u
WHERE p.id = u.id
  AND (
    p.first_name = '' OR 
    p.first_name IS NULL OR
    p.last_name = '' OR 
    p.last_name IS NULL OR
    p.role IS NULL
  );
```

## Verification

### Check for Issues

```sql
-- Find any sync problems
SELECT 
  'Auth users without profiles' as issue,
  COUNT(*) as count
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
  'Profiles without auth users' as issue,
  COUNT(*) as count
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 
  'Email mismatches' as issue,
  COUNT(*) as count
FROM profiles p
INNER JOIN auth.users u ON p.id = u.id
WHERE p.email != u.email;
```

All counts should be `0`.

### View Sync Status

```sql
-- Detailed sync report
SELECT 
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.role,
  CASE 
    WHEN u.id IS NULL THEN '❌ No Auth User'
    WHEN p.email != u.email THEN '⚠️ Email Mismatch'
    WHEN p.first_name = '' OR p.first_name IS NULL THEN '⚠️ Missing First Name'
    WHEN p.last_name = '' OR p.last_name IS NULL THEN '⚠️ Missing Last Name'
    ELSE '✅ Synced'
  END as status
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;
```

## Troubleshooting

### Issue: "Permission denied for table auth.users"

**Solution:** You need to be a Supabase admin or use the service role key.

In Supabase Dashboard:
1. Go to SQL Editor
2. The queries should work there (you're authenticated as admin)

### Issue: Some profiles still missing

**Check:**
1. RLS policies allow INSERT
2. No unique constraint violations
3. Check Supabase logs for errors

**Manual Fix:**
```sql
-- Create a specific profile manually
INSERT INTO profiles (id, email, first_name, last_name, role)
VALUES (
  'user-id-here',
  'user@example.com',
  'First',
  'Last',
  'learner'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  updated_at = NOW();
```

### Issue: Profiles have empty names

**Solution:** Run the update query to pull data from auth metadata:

```sql
UPDATE profiles p
SET 
  first_name = u.raw_user_meta_data->>'first_name',
  last_name = u.raw_user_meta_data->>'last_name',
  updated_at = NOW()
FROM auth.users u
WHERE p.id = u.id
  AND (p.first_name = '' OR p.first_name IS NULL);
```

## Prevent Future Issues

### Set Up Auto-Sync Trigger

Make sure you've run `supabase-auto-create-profile.sql` to automatically create profiles for new users:

```sql
-- This should already be set up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'learner'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Verify Trigger is Active

```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

Should return one row showing the trigger is active.

## Success Checklist

After running the sync:

- [ ] All auth users have profiles
- [ ] No orphaned profiles (profiles without auth users)
- [ ] Email addresses match between auth.users and profiles
- [ ] All profiles have first_name and last_name
- [ ] All profiles have a role assigned
- [ ] Database trigger is active for future users
- [ ] Verification queries show no issues

## Expected Results

### Before Sync
```
total_auth_users: 5
total_profiles: 2
users_missing_profiles: 3
```

### After Sync
```
total_auth_users: 5
total_profiles: 5
remaining_unsynced: 0
```

## Testing

After sync, test:

1. **Login with existing user**
   - Should work without errors
   - Dashboard should load
   - User data should display correctly

2. **Register new user**
   - Profile should be created automatically
   - No 401 errors
   - Immediate access to dashboard

3. **Check profiles table**
   - All users should have profiles
   - Data should be complete

## Maintenance

### Regular Checks

Run this monthly to ensure sync is maintained:

```sql
-- Quick health check
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM profiles) as profiles,
  (SELECT COUNT(*) FROM auth.users u LEFT JOIN profiles p ON u.id = p.id WHERE p.id IS NULL) as unsynced
FROM (SELECT 1) as dummy;
```

If `unsynced > 0`, run the sync script again.

## Support

If you encounter issues:
1. Check Supabase logs (Dashboard > Logs)
2. Verify RLS policies are correct
3. Ensure trigger is active
4. Check for unique constraint violations
5. Review this guide's troubleshooting section

---

**Status:** Ready to run
**Estimated Time:** 1-2 minutes
**Risk Level:** Low (uses ON CONFLICT DO NOTHING for safety)
