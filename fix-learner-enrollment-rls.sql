-- ============================================
-- FIX LEARNER ENROLLMENT RLS POLICY
-- ============================================
-- This script fixes the RLS policy to allow learners
-- to enroll themselves in cohorts
-- ============================================

-- Drop existing enrollment policies
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Learners can enroll themselves" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Admins and instructors can manage enrollments" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Instructors and admins can manage enrollments" ON public.cohort_enrollments;

-- Recreate policies with proper separation

-- 1. SELECT policy - Users can view their own enrollments
CREATE POLICY "Users can view own enrollments" 
  ON public.cohort_enrollments FOR SELECT 
  USING (
    learner_id = auth.uid() 
    OR instructor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('instructor', 'admin', 'super-admin')
    )
  );

-- 2. INSERT policy - Learners can enroll themselves
CREATE POLICY "Learners can enroll themselves" 
  ON public.cohort_enrollments FOR INSERT 
  WITH CHECK (
    learner_id = auth.uid()
  );

-- 3. INSERT policy - Instructors and admins can enroll others
CREATE POLICY "Instructors and admins can enroll learners" 
  ON public.cohort_enrollments FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('instructor', 'admin', 'super-admin')
    )
  );

-- 4. UPDATE policy - Instructors and admins can update enrollments
CREATE POLICY "Instructors and admins can update enrollments" 
  ON public.cohort_enrollments FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('instructor', 'admin', 'super-admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('instructor', 'admin', 'super-admin')
    )
  );

-- 5. DELETE policy - Instructors and admins can delete enrollments
CREATE POLICY "Instructors and admins can delete enrollments" 
  ON public.cohort_enrollments FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('instructor', 'admin', 'super-admin')
    )
  );

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'cohort_enrollments'
ORDER BY policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✓ Learner enrollment RLS policies have been fixed!';
  RAISE NOTICE '✓ Learners can now enroll themselves in cohorts';
  RAISE NOTICE '✓ Instructors and admins can manage all enrollments';
END $$;
