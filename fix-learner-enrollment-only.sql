-- ============================================
-- FIX LEARNER ENROLLMENT ONLY - MINIMAL FIX
-- ============================================
-- This ONLY fixes the learner enrollment issue
-- Use this if you just want to fix the immediate problem
-- ============================================

-- Drop ALL existing enrollment policies
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Learners can enroll themselves" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Admins and instructors can manage enrollments" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Instructors and admins can manage enrollments" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Instructors and admins can enroll learners" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Instructors and admins can update enrollments" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Instructors and admins can delete enrollments" ON public.cohort_enrollments;

-- Create the correct policies

-- 1. SELECT - View own enrollments
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

-- 2. INSERT - Learners can enroll themselves (THE FIX!)
CREATE POLICY "Learners can enroll themselves" 
  ON public.cohort_enrollments FOR INSERT 
  WITH CHECK (learner_id = auth.uid());

-- 3. INSERT - Staff can enroll others
CREATE POLICY "Instructors and admins can enroll learners" 
  ON public.cohort_enrollments FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('instructor', 'admin', 'super-admin')
    )
  );

-- 4. UPDATE - Staff can update enrollments
CREATE POLICY "Instructors and admins can update enrollments" 
  ON public.cohort_enrollments FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('instructor', 'admin', 'super-admin')
    )
  );

-- 5. DELETE - Staff can delete enrollments
CREATE POLICY "Instructors and admins can delete enrollments" 
  ON public.cohort_enrollments FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('instructor', 'admin', 'super-admin')
    )
  );

-- Verify
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'cohort_enrollments'
ORDER BY policyname;

-- Success
DO $$
BEGIN
  RAISE NOTICE '✓ Learner enrollment fixed!';
  RAISE NOTICE '✓ Test: Login as learner → /dashboard/cohorts → Click "Enroll Now"';
END $$;
