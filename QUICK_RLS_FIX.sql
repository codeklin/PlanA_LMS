-- ============================================
-- QUICK FIX: Allow Instructors to Create Cohorts
-- ============================================
-- Copy and paste this entire script into Supabase SQL Editor
-- Then click "Run" or press Ctrl+Enter
-- ============================================

-- Drop old restrictive policy
DROP POLICY IF EXISTS "Admins can manage cohorts" ON public.cohorts;

-- Create new policy that includes instructors
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

-- Verify it worked
SELECT 
  'SUCCESS! Policy updated.' as status,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'cohorts' 
  AND policyname = 'Instructors and admins can manage cohorts';
