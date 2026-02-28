-- =====================================================
-- COMPLETE FIX FOR PLANA LMS REGISTRATION
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: FIX RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create new policies that work correctly
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super-admin')
  )
);

-- =====================================================
-- PART 2: CREATE AUTO-PROFILE TRIGGER
-- =====================================================

-- Create function to auto-create profiles
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

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- PART 3: SYNC EXISTING USERS
-- =====================================================

-- Show current status
DO $$
DECLARE
  auth_count INTEGER;
  profile_count INTEGER;
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO auth_count FROM auth.users;
  SELECT COUNT(*) INTO profile_count FROM profiles;
  missing_count := auth_count - profile_count;
  
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'CURRENT STATUS:';
  RAISE NOTICE 'Total auth users: %', auth_count;
  RAISE NOTICE 'Total profiles: %', profile_count;
  RAISE NOTICE 'Missing profiles: %', missing_count;
  RAISE NOTICE '==============================================';
END $$;

-- Create profiles for users that don't have one
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

-- Update profiles with missing data
UPDATE profiles p
SET 
  first_name = COALESCE(NULLIF(u.raw_user_meta_data->>'first_name', ''), p.first_name, ''),
  last_name = COALESCE(NULLIF(u.raw_user_meta_data->>'last_name', ''), p.last_name, ''),
  role = COALESCE(NULLIF(u.raw_user_meta_data->>'role', ''), p.role, 'learner'),
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
-- PART 4: VERIFICATION
-- =====================================================

-- Show final status
DO $$
DECLARE
  auth_count INTEGER;
  profile_count INTEGER;
  synced_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO auth_count FROM auth.users;
  SELECT COUNT(*) INTO profile_count FROM profiles;
  
  SELECT COUNT(*) INTO synced_count
  FROM auth.users u
  INNER JOIN profiles p ON u.id = p.id;
  
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ SYNC COMPLETE!';
  RAISE NOTICE 'Total auth users: %', auth_count;
  RAISE NOTICE 'Total profiles: %', profile_count;
  RAISE NOTICE 'Successfully synced: %', synced_count;
  RAISE NOTICE '==============================================';
  
  IF auth_count = profile_count THEN
    RAISE NOTICE '✅ All users have profiles!';
  ELSE
    RAISE WARNING '⚠️ Some users still missing profiles. Check logs.';
  END IF;
END $$;

-- Check for any issues
SELECT 
  'Issue Type' as category,
  'Count' as value
WHERE FALSE

UNION ALL

SELECT 
  'Auth users without profiles' as category,
  COUNT(*)::TEXT as value
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
  'Profiles without auth users' as category,
  COUNT(*)::TEXT as value
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 
  'Email mismatches' as category,
  COUNT(*)::TEXT as value
FROM profiles p
INNER JOIN auth.users u ON p.id = u.id
WHERE p.email != u.email;

-- Show all profiles with sync status
SELECT 
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.role,
  p.created_at,
  CASE 
    WHEN u.id IS NULL THEN '❌ No Auth User'
    WHEN p.email != u.email THEN '⚠️ Email Mismatch'
    WHEN p.first_name = '' OR p.first_name IS NULL THEN '⚠️ Missing First Name'
    WHEN p.last_name = '' OR p.last_name IS NULL THEN '⚠️ Missing Last Name'
    ELSE '✅ Synced'
  END as sync_status
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 20;

-- Verify trigger is active
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Verify policies are active
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE '🎉 ALL FIXES APPLIED SUCCESSFULLY!';
  RAISE NOTICE '';
  RAISE NOTICE 'What was fixed:';
  RAISE NOTICE '✅ RLS policies updated';
  RAISE NOTICE '✅ Auto-profile trigger created';
  RAISE NOTICE '✅ Existing users synced';
  RAISE NOTICE '✅ Missing data updated';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Wait 1 hour for rate limit reset (or use new email)';
  RAISE NOTICE '2. Try registering again';
  RAISE NOTICE '3. Profile will be created automatically';
  RAISE NOTICE '==============================================';
END $$;
