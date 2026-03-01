# 🚨 URGENT: Apply RLS Fix for Learner Enrollment

## The Problem
Learners cannot enroll in cohorts - they get an RLS error when clicking "Enroll Now".

## The Solution (1 Minute Fix)

### Step 1: Open Supabase
1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar

### Step 2: Run the Fix

**IMPORTANT: If you already ran a fix before and got an error, use the SAFE version!**

**Option A: Safe Version (Recommended if you got errors)**
1. Open the file: `fix-all-rls-policies-safe.sql`
2. Copy ALL the contents
3. Paste into Supabase SQL Editor
4. Click "Run" (or press Ctrl+Enter)

**Option B: Minimal Fix (Just learner enrollment)**
1. Open the file: `fix-learner-enrollment-only.sql`
2. Copy ALL the contents
3. Paste into Supabase SQL Editor
4. Click "Run" (or press Ctrl+Enter)

### Step 3: Verify Success
You should see these messages:
```
✓ All instructor RLS policies have been updated successfully!
✓ Learner enrollment RLS has been fixed!
✓ Learners can now enroll themselves in cohorts
✓ Instructors can manage cohorts, enrollments, events, and more
```

### Step 4: Test It
1. Login as a learner
2. Go to `/dashboard/cohorts`
3. Click "Enroll Now" on any cohort
4. It should work! ✅

---

## What This Fixes

✅ Learners can enroll in cohorts
✅ Instructors can create/edit cohorts
✅ Instructors can manage enrollments
✅ Instructors can create events
✅ All other instructor permissions

---

## Files to Use

**If you got "policy already exists" error:**
- `fix-all-rls-policies-safe.sql` ⭐⭐⭐ USE THIS ONE!

**If this is your first time running a fix:**
- `fix-all-instructor-rls-policies.sql` ⭐

**If you only want to fix learner enrollment:**
- `fix-learner-enrollment-only.sql` ⭐

**Old files (may cause errors if policies exist):**
- `fix-learner-enrollment-rls.sql`
- `QUICK_RLS_FIX.sql`

---

## Need Help?

See detailed guides:
- `FIX_LEARNER_ENROLLMENT.md` - Learner enrollment details
- `RLS_FIX_SUMMARY.md` - Complete summary
- `TASK_8_LEARNER_ENROLLMENT_FIX.md` - Technical details

---

## Quick Reference

| File | What It Fixes | When to Use |
|------|---------------|-------------|
| fix-all-rls-policies-safe.sql | Everything | Got "policy exists" error ⭐ |
| fix-learner-enrollment-only.sql | Learner enrollment only | Quick minimal fix |
| fix-all-instructor-rls-policies.sql | Everything | First time running |

---

**👉 ACTION REQUIRED: Run `fix-all-rls-policies-safe.sql` NOW!**

(This version safely handles existing policies and won't give you errors)
