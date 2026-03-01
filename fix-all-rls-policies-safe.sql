-- ============================================
-- Fix All RLS Policies - SAFE VERSION
-- ============================================
-- This version safely handles existing policies
-- Run this if you get "policy already exists" errors
-- ============================================

-- 1. COHORTS - Allow instructors to manage cohorts
DROP POLICY IF EXISTS "Admins can manage cohorts" ON public.cohorts;
DROP POLICY IF EXISTS "Instructors and admins can manage cohorts" ON public.cohorts;

CREATE POLICY "Instructors and admins can manage cohorts" 
  ON public.cohorts FOR ALL 
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

-- 2. COHORT_INSTRUCTORS - Allow instructors to manage their assignments
DROP POLICY IF EXISTS "Admins and instructors can manage enrollments" ON public.cohort_instructors;
DROP POLICY IF EXISTS "Instructors can manage cohort assignments" ON public.cohort_instructors;

CREATE POLICY "Instructors can manage cohort assignments" 
  ON public.cohort_instructors FOR ALL 
  USING (
    instructor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
    )
  )
  WITH CHECK (
    instructor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
    )
  );

-- 3. COHORT_COURSES - Allow instructors to assign courses to cohorts
DROP POLICY IF EXISTS "Admins can manage cohort courses" ON public.cohort_courses;
DROP POLICY IF EXISTS "Instructors and admins can manage cohort courses" ON public.cohort_courses;

CREATE POLICY "Instructors and admins can manage cohort courses" 
  ON public.cohort_courses FOR ALL 
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

-- 4. COHORT_ENROLLMENTS - THE CRITICAL FIX FOR LEARNER ENROLLMENT
-- Drop ALL existing enrollment policies first
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Learners can enroll themselves" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Admins and instructors can manage enrollments" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Instructors and admins can manage enrollments" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Instructors and admins can enroll learners" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Instructors and admins can update enrollments" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Instructors and admins can delete enrollments" ON public.cohort_enrollments;

-- Now create the correct policies

-- SELECT policy - Users can view their own enrollments
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

-- INSERT policy - Learners can enroll themselves (THIS IS THE KEY FIX!)
CREATE POLICY "Learners can enroll themselves" 
  ON public.cohort_enrollments FOR INSERT 
  WITH CHECK (
    learner_id = auth.uid()
  );

-- INSERT policy - Instructors and admins can enroll others
CREATE POLICY "Instructors and admins can enroll learners" 
  ON public.cohort_enrollments FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('instructor', 'admin', 'super-admin')
    )
  );

-- UPDATE policy - Instructors and admins can update enrollments
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

-- DELETE policy - Instructors and admins can delete enrollments
CREATE POLICY "Instructors and admins can delete enrollments" 
  ON public.cohort_enrollments FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('instructor', 'admin', 'super-admin')
    )
  );

-- 5. EVENTS - Allow instructors to manage events
DROP POLICY IF EXISTS "Instructors and admins can manage events" ON public.events;

CREATE POLICY "Instructors and admins can manage events" 
  ON public.events FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.cohort_instructors 
      WHERE cohort_id = events.cohort_id AND instructor_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('instructor', 'admin', 'super-admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cohort_instructors 
      WHERE cohort_id = events.cohort_id AND instructor_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('instructor', 'admin', 'super-admin')
    )
  );

-- 6. GRACE_PERIODS - Allow instructors to grant grace periods
DROP POLICY IF EXISTS "Admins can grant grace periods" ON public.grace_periods;
DROP POLICY IF EXISTS "Instructors and admins can grant grace periods" ON public.grace_periods;

CREATE POLICY "Instructors and admins can grant grace periods" 
  ON public.grace_periods FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('instructor', 'admin', 'super-admin')
    )
  );

-- Verify all policies were created
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN (
  'cohorts', 
  'cohort_instructors', 
  'cohort_courses', 
  'cohort_enrollments', 
  'events',
  'grace_periods'
)
ORDER BY tablename, policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ ALL RLS POLICIES FIXED SUCCESSFULLY!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✓ Learners can now enroll in cohorts';
  RAISE NOTICE '✓ Instructors can create/manage cohorts';
  RAISE NOTICE '✓ Instructors can manage enrollments';
  RAISE NOTICE '✓ Instructors can create/manage events';
  RAISE NOTICE '✓ All instructor permissions enabled';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Test learner enrollment!';
  RAISE NOTICE '========================================';
END $$;
