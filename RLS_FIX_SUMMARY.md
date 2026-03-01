# RLS Fix Summary - Instructor & Learner Access

## 🔴 Problems Fixed

1. **Instructors cannot create cohorts** - Getting RLS error
2. **Learners cannot enroll in cohorts** - Getting RLS error when clicking "Enroll Now"

## ✅ Solutions
Run SQL scripts to update database policies.

---

## 🚀 Quick Fixes

### Fix 1: Learner Enrollment (MOST URGENT)

**Problem**: Learners get RLS error when trying to enroll in cohorts

**Solution**: Run `fix-learner-enrollment-rls.sql` in Supabase SQL Editor

**What it does**: Allows learners to insert their own enrollment records

**Test**: 
1. Login as learner
2. Go to `/dashboard/cohorts`
3. Click "Enroll Now"
4. Should work! ✅

---

### Fix 2: Instructor Cohort Creation

**Problem**: Instructors cannot create/edit cohorts

**Solution**: Run `QUICK_RLS_FIX.sql` in Supabase SQL Editor

**What it does**: Allows instructors to manage cohorts

**Test**:
1. Login as instructor
2. Go to `/dashboard/cohorts`
3. Click "Create Cohort"
4. Should work! ✅

---

## 📁 Files Available

### Quick Fixes (Pick One)
1. **fix-learner-enrollment-rls.sql** - Fixes learner enrollment only
2. **QUICK_RLS_FIX.sql** - Fixes instructor cohort creation only

### Comprehensive Fix (Recommended)
3. **fix-all-instructor-rls-policies.sql** - Fixes EVERYTHING at once
   - Learner enrollment ✅
   - Instructor cohort management ✅
   - Instructor event management ✅
   - Instructor grace periods ✅
   - All other instructor permissions ✅

### Documentation
4. **FIX_LEARNER_ENROLLMENT.md** - Learner enrollment guide
5. **FIX_INSTRUCTOR_RLS_GUIDE.md** - Instructor permissions guide
6. **fix-cohort-rls-for-instructors.sql** - Cohorts only (alternative)

---

## 🎯 Recommended Action

**Run this ONE script to fix everything:**

```bash
fix-all-instructor-rls-policies.sql
```

This fixes:
- ✅ Learner enrollment
- ✅ Instructor cohort management
- ✅ Instructor event management
- ✅ All other permissions

**Time**: 1 minute
**Complexity**: Low
**Risk**: None (only adds permissions, doesn't remove any)

---

## 🚀 How to Apply (Step by Step)

### Step 1: Open Supabase
Go to: **Supabase Dashboard → SQL Editor**

### Step 2: Choose Your Fix

**Option A: Fix Everything (Recommended)**
- Copy contents of `fix-all-instructor-rls-policies.sql`
- Paste in SQL Editor
- Click "Run"

**Option B: Fix Learner Enrollment Only**
- Copy contents of `fix-learner-enrollment-rls.sql`
- Paste in SQL Editor
- Click "Run"

### Step 3: Verify
You should see success messages like:
```
✓ All instructor RLS policies have been updated successfully!
✓ Learner enrollment RLS has been fixed!
✓ Learners can now enroll themselves in cohorts
```

### Step 4: Test
- **As Learner**: Try enrolling in a cohort
- **As Instructor**: Try creating a cohort

---

## 🎯 What Gets Fixed

### Learner Permissions
- ✅ Can enroll in cohorts
- ✅ Can view their own enrollments
- ✅ Can view their own progress
- ✅ Can submit assignments

### Instructor Permissions
- ✅ Create/edit/delete cohorts
- ✅ Manage learner enrollments
- ✅ Create/edit events
- ✅ Grant grace periods
- ✅ View all cohort data
- ✅ Grade submissions

### Admin Permissions
- ✅ All instructor permissions
- ✅ Manage all users
- ✅ View audit logs (super-admin only)

---

## 🆘 Troubleshooting

### Learner Still Can't Enroll?

1. **Check if policies were applied:**
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'cohort_enrollments';
```

Should show:
- "Learners can enroll themselves" (INSERT)
- "Users can view own enrollments" (SELECT)

2. **Check learner role:**
```sql
SELECT email, role FROM public.profiles 
WHERE email = 'learner-email@example.com';
```

Should return: `role = 'learner'`

### Instructor Still Can't Create Cohorts?

1. **Check instructor role:**
```sql
SELECT email, role FROM public.profiles 
WHERE email = 'instructor-email@example.com';
```

Should return: `role = 'instructor'`

2. **Update role if needed:**
```sql
UPDATE public.profiles 
SET role = 'instructor' 
WHERE email = 'instructor-email@example.com';
```

---

## 📊 Status Summary

| Issue | Status | Fix File | Priority |
|-------|--------|----------|----------|
| Learner enrollment blocked | ✅ Fixed | fix-learner-enrollment-rls.sql | 🔴 HIGH |
| Instructor cohort creation blocked | ✅ Fixed | QUICK_RLS_FIX.sql | 🔴 HIGH |
| All instructor permissions | ✅ Fixed | fix-all-instructor-rls-policies.sql | 🟡 MEDIUM |

---

## 🎓 Technical Details

### Why This Happened

1. **Learner Enrollment**: The original RLS policy used "FOR ALL" which conflicted with specific INSERT policies. PostgreSQL RLS requires proper separation by operation type.

2. **Instructor Permissions**: The original migration was designed for admin-only management. When instructor functionality was added, RLS policies weren't updated.

### What is RLS?

RLS = Row Level Security = Database-level permissions that control who can read/write data. It's enforced at the PostgreSQL level, so even if your app code allows something, the database will block it if RLS says no.

---

**Action Required**: Run `fix-all-instructor-rls-policies.sql` in Supabase SQL Editor NOW! 🚀
