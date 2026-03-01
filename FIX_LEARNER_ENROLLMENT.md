# Fix Learner Enrollment Issue

## Problem
Learners are getting RLS (Row Level Security) errors when trying to enroll in cohorts.

## Root Cause
The RLS policy for `cohort_enrollments` table was using a "FOR ALL" policy that conflicted with the specific INSERT policy for learners. PostgreSQL RLS requires proper separation of policies by operation type (SELECT, INSERT, UPDATE, DELETE).

## Solution
We've created two SQL fix scripts:

### Option 1: Quick Fix (Recommended)
Run `fix-learner-enrollment-rls.sql` - This focuses specifically on fixing the enrollment policies.

### Option 2: Comprehensive Fix
Run `fix-all-instructor-rls-policies.sql` - This fixes ALL instructor AND learner RLS policies across the entire database.

## How to Apply the Fix

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of either:
   - `fix-learner-enrollment-rls.sql` (quick fix)
   - `fix-all-instructor-rls-policies.sql` (comprehensive fix)
4. Click "Run"
5. You should see success messages

## What the Fix Does

The fix creates separate, specific policies for each operation:

1. **SELECT Policy**: Users can view their own enrollments
   - Learners see their enrollments
   - Instructors see enrollments they manage
   - Admins see all enrollments

2. **INSERT Policy (Learners)**: Learners can enroll themselves
   - Only allows inserting records where `learner_id = auth.uid()`
   - This is what was broken before

3. **INSERT Policy (Staff)**: Instructors/admins can enroll others
   - Allows staff to manually enroll learners

4. **UPDATE Policy**: Instructors/admins can update enrollment status
   - Change status from pending to active, etc.

5. **DELETE Policy**: Instructors/admins can remove enrollments
   - Remove learners from cohorts if needed

## Testing After Fix

1. Log in as a learner
2. Go to `/dashboard/cohorts`
3. Click "Enroll Now" on any active cohort
4. You should see success (no RLS error)

## Files Created/Updated

- `fix-learner-enrollment-rls.sql` - New quick fix script
- `fix-all-instructor-rls-policies.sql` - Updated comprehensive fix
- `FIX_LEARNER_ENROLLMENT.md` - This guide

## Technical Details

The key difference is separating the "FOR ALL" policy into specific operation policies:

**Before (Broken):**
```sql
CREATE POLICY "..." FOR ALL USING (...) WITH CHECK (...);
```

**After (Fixed):**
```sql
CREATE POLICY "..." FOR SELECT USING (...);
CREATE POLICY "..." FOR INSERT WITH CHECK (...);
CREATE POLICY "..." FOR UPDATE USING (...) WITH CHECK (...);
CREATE POLICY "..." FOR DELETE USING (...);
```

This ensures PostgreSQL properly evaluates the correct clause for each operation type.
