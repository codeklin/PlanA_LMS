# Fix Instructor RLS Policies - Quick Guide

## Problem
Instructors cannot create cohorts due to RLS (Row Level Security) policy restrictions. The database policies only allow 'admin' and 'super-admin' roles, but not 'instructor'.

## Error Message
```
Error saving cohort: {}
RLS policy violation
```

## Solution
Run the SQL script to update RLS policies to include instructors.

---

## Quick Fix (Option 1) - Run Single Script

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Select your project
3. Go to SQL Editor

### Step 2: Run the Fix Script
Copy and paste this SQL:

```sql
-- Fix Cohort RLS Policy for Instructors
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
```

### Step 3: Click "Run" or press Ctrl+Enter

### Step 4: Verify
```sql
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'cohorts';
```

You should see: `"Instructors and admins can manage cohorts"`

---

## Complete Fix (Option 2) - Run Full Script

For comprehensive instructor permissions across all tables:

### Step 1: Open Supabase SQL Editor

### Step 2: Run the Complete Script
Use the file: `fix-all-instructor-rls-policies.sql`

This updates policies for:
- ✅ Cohorts
- ✅ Cohort Instructors
- ✅ Cohort Courses
- ✅ Cohort Enrollments
- ✅ Events
- ✅ Grace Periods

### Step 3: Verify Success
You should see the message:
```
All instructor RLS policies have been updated successfully!
```

---

## Testing

### Test Cohort Creation:
1. Login as instructor
2. Go to `/dashboard/cohorts`
3. Click "Create Cohort"
4. Fill in the form:
   - Name: "Test Cohort"
   - Start Date: Tomorrow
   - End Date: Next month
5. Click "Create Cohort"
6. Should see success toast ✅
7. Cohort appears in list ✅

### If Still Failing:
1. Check your user role:
```sql
SELECT email, role FROM public.profiles WHERE email = 'your-email@example.com';
```

2. Verify the policy exists:
```sql
SELECT * FROM pg_policies WHERE tablename = 'cohorts';
```

3. Check browser console for detailed error

---

## What Changed

### Before:
```sql
-- Only admins could manage cohorts
CREATE POLICY "Admins can manage cohorts" 
  ON public.cohorts FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
    )
  );
```

### After:
```sql
-- Instructors, admins, and super-admins can manage cohorts
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
```

---

## Why This Happened

The original database migration only granted cohort management permissions to admins and super-admins. Instructors need these permissions to:
- Create cohorts for their classes
- Edit cohort details
- Manage enrollments
- Track learner progress

---

## Permissions After Fix

| Action | Learner | Instructor | Admin | Super Admin |
|--------|---------|-----------|-------|-------------|
| View Cohorts | ✅ | ✅ | ✅ | ✅ |
| Create Cohorts | ❌ | ✅ | ✅ | ✅ |
| Edit Cohorts | ❌ | ✅ | ✅ | ✅ |
| Delete Cohorts | ❌ | ✅ | ✅ | ✅ |
| Enroll in Cohorts | ✅ | ❌ | ❌ | ❌ |

---

## Troubleshooting

### Error: "permission denied for table cohorts"
**Solution**: Run the RLS fix script above

### Error: "new row violates row-level security policy"
**Solution**: 
1. Verify your role is 'instructor'
2. Run the fix script
3. Logout and login again

### Error: "policy already exists"
**Solution**: 
1. Drop the old policy first:
```sql
DROP POLICY IF EXISTS "Admins can manage cohorts" ON public.cohorts;
```
2. Then create the new one

### Still not working?
1. Check if RLS is enabled:
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'cohorts';
```

2. Verify your authentication:
```sql
SELECT auth.uid(); -- Should return your user ID
```

3. Check your profile:
```sql
SELECT * FROM public.profiles WHERE id = auth.uid();
```

---

## Files Created

1. `fix-cohort-rls-for-instructors.sql` - Quick fix for cohorts only
2. `fix-all-instructor-rls-policies.sql` - Comprehensive fix for all tables
3. `FIX_INSTRUCTOR_RLS_GUIDE.md` - This guide

---

## Status After Fix

✅ Instructors can create cohorts
✅ Instructors can edit cohorts
✅ Instructors can delete cohorts
✅ Instructors can manage enrollments
✅ Instructors can create events
✅ Instructors can grant grace periods

---

## Next Steps

1. ✅ Run the SQL fix script
2. ✅ Test cohort creation
3. ✅ Verify instructor can edit/delete
4. ⏳ Create your first cohort
5. ⏳ Assign courses to cohort
6. ⏳ Enroll learners

---

**Priority**: HIGH - Run this fix immediately to enable instructor functionality!
