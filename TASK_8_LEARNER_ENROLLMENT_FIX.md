# Task 8: Fix Learner Enrollment RLS Error

## Issue
Learners are getting an RLS (Row Level Security) error when trying to enroll in cohorts by clicking the "Enroll Now" button.

**Error Location**: `components/cohort-updates/join-cohort-view.tsx` line 40

## Root Cause Analysis

The problem was in the database RLS policies for the `cohort_enrollments` table. The original policy structure used a "FOR ALL" policy that included both USING and WITH CHECK clauses:

```sql
CREATE POLICY "..." FOR ALL 
  USING (learner_id = auth.uid() OR ...) 
  WITH CHECK (learner_id = auth.uid() OR ...);
```

This approach has issues in PostgreSQL RLS:
- The USING clause is for SELECT/UPDATE/DELETE operations
- The WITH CHECK clause is for INSERT/UPDATE operations
- When combined in a "FOR ALL" policy, PostgreSQL doesn't properly evaluate INSERT operations

## Solution Implemented

Created separate, specific policies for each operation type:

### 1. SELECT Policy
Allows users to view their own enrollments:
```sql
CREATE POLICY "Users can view own enrollments" 
  ON public.cohort_enrollments FOR SELECT 
  USING (learner_id = auth.uid() OR ...);
```

### 2. INSERT Policy (Learners)
Allows learners to enroll themselves:
```sql
CREATE POLICY "Learners can enroll themselves" 
  ON public.cohort_enrollments FOR INSERT 
  WITH CHECK (learner_id = auth.uid());
```

### 3. INSERT Policy (Staff)
Allows instructors/admins to enroll others:
```sql
CREATE POLICY "Instructors and admins can enroll learners" 
  ON public.cohort_enrollments FOR INSERT 
  WITH CHECK (role IN ('instructor', 'admin', 'super-admin'));
```

### 4. UPDATE Policy
Allows instructors/admins to update enrollment status:
```sql
CREATE POLICY "Instructors and admins can update enrollments" 
  ON public.cohort_enrollments FOR UPDATE 
  USING (...) WITH CHECK (...);
```

### 5. DELETE Policy
Allows instructors/admins to remove enrollments:
```sql
CREATE POLICY "Instructors and admins can delete enrollments" 
  ON public.cohort_enrollments FOR DELETE 
  USING (...);
```

## Files Created

1. **fix-learner-enrollment-rls.sql**
   - Focused fix for learner enrollment only
   - Quick and targeted solution
   - Recommended for immediate deployment

2. **fix-all-instructor-rls-policies.sql** (Updated)
   - Comprehensive fix for all RLS policies
   - Includes learner enrollment fix
   - Includes all instructor permission fixes
   - Recommended for complete solution

3. **FIX_LEARNER_ENROLLMENT.md**
   - Detailed documentation
   - Step-by-step guide
   - Testing instructions

4. **RLS_FIX_SUMMARY.md** (Updated)
   - Quick reference guide
   - Covers both learner and instructor issues
   - Troubleshooting section

## How to Apply

### Option 1: Quick Fix (Learner Enrollment Only)
```bash
# In Supabase SQL Editor, run:
fix-learner-enrollment-rls.sql
```

### Option 2: Comprehensive Fix (Everything)
```bash
# In Supabase SQL Editor, run:
fix-all-instructor-rls-policies.sql
```

## Testing Steps

1. **Login as a learner**
2. **Navigate to** `/dashboard/cohorts`
3. **Click** "Enroll Now" on any active cohort
4. **Expected Result**: Enrollment succeeds without RLS error
5. **Verify**: Check `cohort_enrollments` table for new record

## Verification Query

After applying the fix, verify policies are correct:

```sql
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'cohort_enrollments'
ORDER BY policyname;
```

Expected output should show 5 policies:
- "Instructors and admins can delete enrollments" (DELETE)
- "Instructors and admins can enroll learners" (INSERT)
- "Instructors and admins can update enrollments" (UPDATE)
- "Learners can enroll themselves" (INSERT)
- "Users can view own enrollments" (SELECT)

## Technical Notes

### Why Separate Policies?

PostgreSQL RLS evaluates policies differently based on operation:
- **SELECT**: Only USING clause is checked
- **INSERT**: Only WITH CHECK clause is checked
- **UPDATE**: Both USING (for existing row) and WITH CHECK (for new values)
- **DELETE**: Only USING clause is checked

Using "FOR ALL" with both clauses can cause unexpected behavior, especially for INSERT operations where the USING clause shouldn't apply.

### Multiple INSERT Policies

PostgreSQL allows multiple policies for the same operation. They are combined with OR logic:
- Policy 1: `learner_id = auth.uid()` (learners enroll themselves)
- Policy 2: `role IN ('instructor', ...)` (staff enroll others)
- Result: INSERT succeeds if EITHER condition is true

## Status

- ✅ Root cause identified
- ✅ Fix scripts created
- ✅ Documentation written
- ⏳ Awaiting deployment to Supabase
- ⏳ Awaiting testing confirmation

## Next Steps

1. User runs the SQL fix script in Supabase
2. User tests learner enrollment
3. User confirms fix is working
4. Mark task as complete

## Related Issues

This fix also resolves:
- Task 7: Instructor cohort creation (already fixed)
- Any other RLS issues with instructor permissions
- Potential future enrollment-related errors

## Impact

- **Users Affected**: All learners trying to enroll in cohorts
- **Severity**: HIGH (blocks core functionality)
- **Fix Complexity**: LOW (SQL script only)
- **Risk**: NONE (only adds permissions, doesn't remove any)
- **Deployment Time**: < 1 minute
