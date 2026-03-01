# Error Fix Guide: "Policy Already Exists"

## The Error You Got

```
Error: Failed to run sql query: 
ERROR: 42710: policy "Instructors and admins can manage cohorts" 
for table "cohorts" already exists
```

## What This Means

You already ran part of the fix script before, so some policies already exist in your database. PostgreSQL won't let you create a policy with the same name twice.

## The Solution

Use the **SAFE VERSION** of the fix script that handles existing policies properly.

---

## Step-by-Step Fix

### 1. Open Supabase SQL Editor
- Go to your Supabase Dashboard
- Click "SQL Editor" in the left sidebar

### 2. Use the Safe Script
- Open: `fix-all-rls-policies-safe.sql`
- Copy ALL the contents
- Paste into Supabase SQL Editor

### 3. Run It
- Click "Run" button (or press Ctrl+Enter)
- Wait for it to complete

### 4. Check for Success
You should see output like:
```
========================================
✓ ALL RLS POLICIES FIXED SUCCESSFULLY!
========================================

✓ Learners can now enroll in cohorts
✓ Instructors can create/manage cohorts
✓ Instructors can manage enrollments
✓ Instructors can create/manage events
✓ All instructor permissions enabled

Next step: Test learner enrollment!
========================================
```

### 5. Test It
1. Login as a learner
2. Go to `/dashboard/cohorts`
3. Click "Enroll Now" on any cohort
4. Should work without errors! ✅

---

## What's Different in the Safe Version?

The safe version drops BOTH the old and new policy names before creating new ones:

```sql
-- Drops both possible names
DROP POLICY IF EXISTS "Admins can manage cohorts" ON public.cohorts;
DROP POLICY IF EXISTS "Instructors and admins can manage cohorts" ON public.cohorts;

-- Then creates the new one
CREATE POLICY "Instructors and admins can manage cohorts" ...
```

This ensures no conflicts, even if you ran scripts before.

---

## Alternative: Minimal Fix

If you only want to fix the learner enrollment issue (not instructor permissions), use:

**File**: `fix-learner-enrollment-only.sql`

This is smaller and only touches the `cohort_enrollments` table.

---

## Files Comparison

| File | Purpose | When to Use |
|------|---------|-------------|
| `fix-all-rls-policies-safe.sql` | Fixes everything, handles existing policies | Got "policy exists" error ⭐ |
| `fix-learner-enrollment-only.sql` | Only fixes learner enrollment | Want minimal change |
| `fix-all-instructor-rls-policies.sql` | Fixes everything | First time (may error if policies exist) |

---

## Still Getting Errors?

### Error: "relation does not exist"
**Cause**: Table doesn't exist in your database
**Fix**: Run the main migration first: `supabase-complete-migration.sql`

### Error: "permission denied"
**Cause**: Not logged in as database owner
**Fix**: Make sure you're using the Supabase SQL Editor (not a regular SQL client)

### Error: "syntax error"
**Cause**: Didn't copy the entire script
**Fix**: Make sure you copied ALL lines from the file, including the final semicolon

---

## What Gets Fixed

After running the safe script, these will work:

### For Learners:
- ✅ Enroll in cohorts (the main issue)
- ✅ View their enrollments
- ✅ View their progress
- ✅ Submit assignments

### For Instructors:
- ✅ Create/edit/delete cohorts
- ✅ Manage learner enrollments
- ✅ Create/edit events
- ✅ Grant grace periods
- ✅ View all cohort data

### For Admins:
- ✅ All instructor permissions
- ✅ Manage all users
- ✅ Full system access

---

## Technical Details

The "policy already exists" error happens because:

1. You ran `QUICK_RLS_FIX.sql` or another script before
2. That script created the policy "Instructors and admins can manage cohorts"
3. When you tried to run `fix-all-instructor-rls-policies.sql`, it tried to create the same policy again
4. PostgreSQL said "no, that name is taken"

The safe version uses `DROP POLICY IF EXISTS` to remove any existing policies first, then creates fresh ones. This is idempotent - you can run it multiple times safely.

---

**Next Step**: Run `fix-all-rls-policies-safe.sql` now! 🚀
