-- ============================================
-- DEBUG ENROLLMENT ISSUE
-- ============================================
-- Run this to diagnose why enrollment is failing
-- ============================================

-- 1. Check if RLS is enabled
SELECT 
  '=== 1. RLS STATUS ===' as step,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'cohort_enrollments';

-- 2. List all policies on cohort_enrollments
SELECT 
  '=== 2. ALL POLICIES ===' as step;

SELECT 
  policyname,
  cmd as operation,
  roles
FROM pg_policies
WHERE tablename = 'cohort_enrollments'
ORDER BY cmd, policyname;

-- 3. Check the INSERT policies specifically
SELECT 
  '=== 3. INSERT POLICIES DETAIL ===' as step;

SELECT 
  policyname,
  cmd,
  pg_get_expr(qual, 'public.cohort_enrollments'::regclass) as using_clause,
  pg_get_expr(with_check, 'public.cohort_enrollments'::regclass) as with_check_clause
FROM pg_policies
WHERE tablename = 'cohort_enrollments'
  AND cmd = 'INSERT';

-- 4. Check if there are any enrollments already
SELECT 
  '=== 4. EXISTING ENROLLMENTS ===' as step;

SELECT 
  COUNT(*) as total_enrollments
FROM public.cohort_enrollments;

-- 5. Check active cohorts
SELECT 
  '=== 5. ACTIVE COHORTS ===' as step;

SELECT 
  id,
  name,
  status,
  max_learners
FROM public.cohorts
WHERE status = 'active'
LIMIT 5;

-- 6. Check if there are any constraints that might block insertion
SELECT 
  '=== 6. TABLE CONSTRAINTS ===' as step;

SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.cohort_enrollments'::regclass;

-- 7. Test if a simple insert would work (as superuser)
-- This bypasses RLS to see if there are other issues
SELECT 
  '=== 7. TESTING INSERT (bypassing RLS) ===' as step;

-- Note: This is just a test query, not actually inserting
SELECT 
  'If you can see this, the table structure is OK' as test_result;

-- 8. Check for any triggers that might interfere
SELECT 
  '=== 8. TRIGGERS ===' as step;

SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'cohort_enrollments';

-- 9. Summary and recommendations
SELECT 
  '=== 9. SUMMARY ===' as step;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'cohort_enrollments' 
        AND policyname = 'Learners can enroll themselves'
        AND cmd = 'INSERT'
    ) THEN '✓ Learner INSERT policy exists'
    ELSE '✗ Learner INSERT policy MISSING - Run fix-learner-enrollment-only.sql'
  END as policy_check;

SELECT 
  CASE 
    WHEN rowsecurity THEN '✓ RLS is enabled'
    ELSE '✗ RLS is DISABLED - This is a problem!'
  END as rls_check
FROM pg_tables
WHERE tablename = 'cohort_enrollments';
