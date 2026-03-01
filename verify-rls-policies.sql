-- ============================================
-- VERIFY RLS POLICIES
-- ============================================
-- Run this to check if your RLS policies are correct
-- ============================================

-- Check cohort_enrollments policies
SELECT 
  '=== COHORT_ENROLLMENTS POLICIES ===' as info;

SELECT 
  policyname,
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE tablename = 'cohort_enrollments'
ORDER BY cmd, policyname;

-- Expected policies:
-- 1. "Learners can enroll themselves" - INSERT - No USING, Has WITH CHECK
-- 2. "Instructors and admins can enroll learners" - INSERT - No USING, Has WITH CHECK
-- 3. "Users can view own enrollments" - SELECT - Has USING, No WITH CHECK
-- 4. "Instructors and admins can update enrollments" - UPDATE - Has USING, Has WITH CHECK
-- 5. "Instructors and admins can delete enrollments" - DELETE - Has USING, No WITH CHECK

-- Check if RLS is enabled
SELECT 
  '=== RLS STATUS ===' as info;

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'cohort_enrollments';

-- Check current user
SELECT 
  '=== CURRENT USER ===' as info;

SELECT 
  current_user as database_user,
  auth.uid() as authenticated_user_id;

-- Test query to see what the learner INSERT policy allows
SELECT 
  '=== POLICY TEST ===' as info;

-- This will show if the policy is working
-- If you see results, the policy is active
SELECT 
  policyname,
  pg_get_expr(qual, 'public.cohort_enrollments'::regclass) as using_expression,
  pg_get_expr(with_check, 'public.cohort_enrollments'::regclass) as with_check_expression
FROM pg_policies
WHERE tablename = 'cohort_enrollments'
  AND policyname = 'Learners can enroll themselves';
