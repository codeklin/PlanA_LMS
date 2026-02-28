-- =====================================================
-- CHECK USER STATUS AND FIX LOGIN ISSUES
-- =====================================================

-- Step 1: Check all users and their confirmation status
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at,
  last_sign_in_at,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name,
  raw_user_meta_data->>'role' as role,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ Email Not Confirmed'
    WHEN confirmed_at IS NULL THEN '⚠️ User Not Confirmed'
    ELSE '✅ Confirmed'
  END as status
FROM auth.users
ORDER BY created_at DESC;

-- Step 2: Check if users have profiles
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.id as profile_id,
  p.first_name,
  p.last_name,
  p.role,
  CASE 
    WHEN p.id IS NULL THEN '❌ No Profile'
    WHEN u.email_confirmed_at IS NULL THEN '❌ Email Not Confirmed'
    ELSE '✅ Ready'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Step 3: Confirm all users (for development only!)
-- WARNING: Only use this in development, not production!
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  confirmed_at = COALESCE(confirmed_at, NOW())
WHERE email_confirmed_at IS NULL OR confirmed_at IS NULL;

-- Step 4: Verify confirmation
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users,
  COUNT(CASE WHEN email_confirmed_at IS NULL THEN 1 END) as unconfirmed_users
FROM auth.users;

-- Step 5: Show final user status
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.confirmed_at,
  p.first_name,
  p.last_name,
  p.role,
  '✅ Ready to Login' as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email_confirmed_at IS NOT NULL
ORDER BY u.created_at DESC;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
DECLARE
  total_users INTEGER;
  confirmed_users INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users FROM auth.users;
  SELECT COUNT(*) INTO confirmed_users FROM auth.users WHERE email_confirmed_at IS NOT NULL;
  
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ USER STATUS CHECK COMPLETE';
  RAISE NOTICE 'Total users: %', total_users;
  RAISE NOTICE 'Confirmed users: %', confirmed_users;
  RAISE NOTICE '';
  
  IF confirmed_users = total_users THEN
    RAISE NOTICE '✅ All users are confirmed and ready to login!';
  ELSE
    RAISE NOTICE '⚠️ Some users still need confirmation';
  END IF;
  
  RAISE NOTICE '==============================================';
END $$;
