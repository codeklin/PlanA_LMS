-- ============================================
-- CHECK AUTHENTICATION STATUS
-- ============================================
-- Run this while logged in to check your auth status
-- ============================================

-- 1. Check if you're authenticated
SELECT 
  '=== AUTHENTICATION STATUS ===' as info;

SELECT 
  CASE 
    WHEN auth.uid() IS NOT NULL THEN '✓ You are authenticated'
    ELSE '✗ You are NOT authenticated - Please log in!'
  END as auth_status,
  auth.uid() as your_user_id;

-- 2. Check your profile
SELECT 
  '=== YOUR PROFILE ===' as info;

SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  status
FROM public.profiles
WHERE id = auth.uid();

-- 3. Check your existing enrollments
SELECT 
  '=== YOUR ENROLLMENTS ===' as info;

SELECT 
  ce.id,
  c.name as cohort_name,
  ce.status as enrollment_status,
  ce.enrolled_at
FROM public.cohort_enrollments ce
JOIN public.cohorts c ON c.id = ce.cohort_id
WHERE ce.learner_id = auth.uid();

-- 4. Check available cohorts
SELECT 
  '=== AVAILABLE COHORTS ===' as info;

SELECT 
  id,
  name,
  status,
  start_date,
  max_learners
FROM public.cohorts
WHERE status = 'active'
ORDER BY start_date;

-- 5. Summary
SELECT 
  '=== SUMMARY ===' as info;

SELECT 
  CASE 
    WHEN auth.uid() IS NULL THEN '✗ NOT LOGGED IN - Log in first!'
    WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()) THEN '✗ PROFILE MISSING - Contact support'
    WHEN (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'learner' THEN '⚠ WRONG ROLE - You are not a learner'
    WHEN NOT EXISTS (SELECT 1 FROM public.cohorts WHERE status = 'active') THEN '⚠ NO ACTIVE COHORTS - Nothing to enroll in'
    ELSE '✓ ALL GOOD - You should be able to enroll'
  END as status_check;
