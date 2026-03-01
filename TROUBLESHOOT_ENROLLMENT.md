# Troubleshooting Learner Enrollment

## Current Status
You're still getting enrollment errors even after running the RLS fix.

## Step 1: Check What Error You're Actually Getting

I've updated the component to show better error messages. Now when you try to enroll, you should see:
- A toast notification with the error
- Console logs with full error details

### Try enrolling again and check:
1. The toast message that appears
2. Browser console (F12) for detailed error logs

Look for these specific messages:
- `Error message:` - The main error
- `Error code:` - PostgreSQL error code
- `Error details:` - Additional context
- `Error hint:` - Suggestion from database

## Step 2: Verify RLS Policies Were Applied

Run this in Supabase SQL Editor:

```sql
-- Copy and paste from: debug-enrollment-issue.sql
```

This will show you:
- ✓ If RLS is enabled
- ✓ If the policies exist
- ✓ What the policies actually check
- ✓ Any constraints that might block insertion

## Step 3: Common Issues and Fixes

### Issue A: "Policy already exists" when running fix
**Solution**: Use `fix-all-rls-policies-safe.sql` instead

### Issue B: Policies not actually applied
**Check**: Run `debug-enrollment-issue.sql` to verify
**Fix**: Run `fix-learner-enrollment-only.sql` again

### Issue C: User not authenticated
**Check**: Console should show `auth.uid()` value
**Fix**: Make sure user is logged in

### Issue D: Already enrolled (duplicate key error)
**Message**: "duplicate key value violates unique constraint"
**Fix**: This is actually OK - user is already enrolled!

### Issue E: Wrong user role
**Check**: User role should be 'learner'
**Fix**: 
```sql
UPDATE public.profiles 
SET role = 'learner' 
WHERE email = 'user@example.com';
```

### Issue F: RLS not enabled
**Check**: `debug-enrollment-issue.sql` will show this
**Fix**: 
```sql
ALTER TABLE public.cohort_enrollments ENABLE ROW LEVEL SECURITY;
```

## Step 4: Manual Test

Try this in Supabase SQL Editor while logged in as the learner:

```sql
-- This should work if policies are correct
INSERT INTO public.cohort_enrollments (cohort_id, learner_id, status)
VALUES (
  'COHORT_ID_HERE',  -- Replace with actual cohort ID
  auth.uid(),
  'pending'
);
```

If this works, the problem is in the frontend code.
If this fails, the problem is in the RLS policies.

## Step 5: Check Policy Details

Run this to see the exact policy logic:

```sql
SELECT 
  policyname,
  cmd,
  pg_get_expr(with_check, 'public.cohort_enrollments'::regclass) as check_expression
FROM pg_policies
WHERE tablename = 'cohort_enrollments'
  AND policyname = 'Learners can enroll themselves';
```

Expected result:
```
policyname: "Learners can enroll themselves"
cmd: INSERT
check_expression: (learner_id = auth.uid())
```

## Step 6: Nuclear Option - Reset All Policies

If nothing works, run this to completely reset enrollment policies:

```sql
-- Remove ALL policies
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Learners can enroll themselves" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Admins and instructors can manage enrollments" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Instructors and admins can manage enrollments" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Instructors and admins can enroll learners" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Instructors and admins can update enrollments" ON public.cohort_enrollments;
DROP POLICY IF EXISTS "Instructors and admins can delete enrollments" ON public.cohort_enrollments;

-- Disable RLS temporarily to test
ALTER TABLE public.cohort_enrollments DISABLE ROW LEVEL SECURITY;

-- Try enrolling now - if it works, the problem is RLS
-- Then re-enable and apply policies:
ALTER TABLE public.cohort_enrollments ENABLE ROW LEVEL SECURITY;

-- Run fix-learner-enrollment-only.sql
```

## What to Report Back

Please provide:

1. **Error message from toast notification**
2. **Console error logs** (all 4 lines: message, details, hint, code)
3. **Result from debug-enrollment-issue.sql** (especially steps 2, 3, and 9)
4. **User's role** from:
   ```sql
   SELECT email, role FROM public.profiles WHERE email = 'learner@example.com';
   ```

With this information, I can pinpoint the exact issue.

## Quick Checklist

- [ ] Ran `fix-all-rls-policies-safe.sql` or `fix-learner-enrollment-only.sql`
- [ ] Verified policies exist with `debug-enrollment-issue.sql`
- [ ] User is logged in (check browser console for auth.uid())
- [ ] User role is 'learner' (not 'instructor' or 'admin')
- [ ] Cohort status is 'active'
- [ ] User is not already enrolled in this cohort
- [ ] RLS is enabled on cohort_enrollments table
- [ ] Browser console shows detailed error message

## Files to Use

1. **debug-enrollment-issue.sql** - Diagnose the problem
2. **verify-rls-policies.sql** - Check if policies are correct
3. **fix-learner-enrollment-only.sql** - Apply the fix
4. **fix-all-rls-policies-safe.sql** - Comprehensive fix

## Next Steps

1. Try enrolling again - check the toast message and console
2. Run `debug-enrollment-issue.sql` in Supabase
3. Report back the error message and debug results
4. I'll provide the exact fix based on what you find
