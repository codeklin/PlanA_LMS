-- =====================================================
-- Sync Existing Auth Users to Profiles Table
-- This script creates profiles for users who don't have one yet
-- =====================================================

-- Step 1: Check how many users need syncing
SELECT 
  COUNT(*) as total_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  COUNT(*) - (SELECT COUNT(*) FROM profiles) as users_missing_profiles
FROM auth.users;

-- Step 2: Show users that need profiles created
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

-- Step 3: Create profiles for all users that don't have one
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

-- Step 4: Verify sync was successful
SELECT 
  COUNT(*) as total_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  COUNT(*) - (SELECT COUNT(*) FROM profiles) as remaining_unsynced
FROM auth.users;

-- Step 5: Show all profiles with their auth status
SELECT 
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.role,
  p.created_at,
  CASE 
    WHEN u.id IS NOT NULL THEN 'Synced'
    ELSE 'Orphaned Profile'
  END as sync_status
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- =====================================================
-- Optional: Update existing profiles with missing data
-- =====================================================

-- Update profiles that have empty names from auth metadata
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

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check for any mismatches between auth.users and profiles
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

-- Show detailed sync report
SELECT 
  p.id,
  p.email as profile_email,
  u.email as auth_email,
  p.first_name,
  p.last_name,
  p.role,
  u.created_at as auth_created,
  p.created_at as profile_created,
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

-- =====================================================
-- Success Message
-- =====================================================

DO $$
DECLARE
  synced_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO synced_count
  FROM auth.users u
  INNER JOIN profiles p ON u.id = p.id;
  
  RAISE NOTICE '✅ Sync Complete!';
  RAISE NOTICE 'Total profiles synced: %', synced_count;
  RAISE NOTICE 'Run the verification queries above to check for any issues.';
END $$;
