-- ============================================
-- Fix Cohort RLS Policies for Instructors
-- ============================================

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admins can manage cohorts" ON public.cohorts;

-- Create new policy that allows instructors, admins, and super-admins
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

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'cohorts'
ORDER BY policyname;
