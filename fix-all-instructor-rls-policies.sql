-- ============================================
-- Fix All RLS Policies for Instructors
-- ============================================
-- This script updates all policies to allow instructors
-- to perform necessary actions alongside admins
-- ============================================

-- 1. COHORTS - Allow instructors to manage cohorts
DROP POLICY IF EXISTS "Admins can manage cohorts" ON public.cohorts;

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

-- 2. COURSES - Instructors already have access, but let's ensure it's correct
-- (Courses policies already include instructors, so no change needed)

-- 3. COHORT_INSTRUCTORS - Allow instructors to manage their assignments
DROP POLICY IF EXISTS "Admins and instructors can manage enrollments" ON public.cohort_instructors;

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

-- 4. COHORT_COURSES - Allow instructors to assign courses to cohorts
DROP POLICY IF EXISTS "Admins can manage cohort courses" ON public.cohort_courses;

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

-- 5. COHORT_ENROLLMENTS - Allow instructors to manage enrollments AND learners to enroll themselves
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Learners can enroll themselves" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Admins and instructors can manage enrollments" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Instructors and admins can manage enrollments" ON public.cohort_enrollments;

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

-- INSERT policy - Learners can enroll themselves
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

-- 6. EVENTS - Allow instructors to manage events
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

-- 7. INSTRUCTOR_NOTES - Already correct (instructors can create notes)

-- 8. DROP_RECOMMENDATIONS - Already correct (instructors can create recommendations)

-- 9. GRACE_PERIODS - Allow instructors to grant grace periods
DROP POLICY IF EXISTS "Admins can grant grace periods" ON public.grace_periods;

CREATE POLICY "Instructors and admins can grant grace periods" 
  ON public.grace_periods FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('instructor', 'admin', 'super-admin')
    )
  );

-- Verify all policies
SELECT 
  tablename,
  policyname,
  cmd,
  roles
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
  RAISE NOTICE '✓ All instructor RLS policies have been updated successfully!';
  RAISE NOTICE '✓ Learner enrollment RLS has been fixed!';
  RAISE NOTICE '✓ Learners can now enroll themselves in cohorts';
  RAISE NOTICE '✓ Instructors can manage cohorts, enrollments, events, and more';
END $$;
