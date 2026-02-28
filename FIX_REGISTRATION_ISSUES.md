# Fix Registration Issues

## Issues Identified

1. ❌ **Rate Limit Exceeded** - Too many registration attempts
2. ❌ **401 Unauthorized** - Profile creation failing due to RLS policies
3. ⚠️ **Missing Icons** - Favicon files not found

## Solutions

### Fix 1: Update RLS Policies (REQUIRED)

Run this SQL in Supabase SQL Editor:

```sql
-- File: supabase-fix-profile-policy.sql

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create new policy that allows profile creation during signup
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Also ensure users can read their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### Fix 2: Add Database Trigger (RECOMMENDED)

This automatically creates profiles when users sign up:

```sql
-- File: supabase-auto-create-profile.sql

-- Create a function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'learner'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Fix 3: Handle Rate Limits

**Immediate Solution:**
Wait 1 hour before trying to register again, or use a different email address.

**Long-term Solution:**
In Supabase Dashboard:
1. Go to Authentication > Settings
2. Scroll to "Rate Limits"
3. Adjust the limits if needed (default is 30 requests per hour)

**For Development:**
You can disable email confirmation temporarily:
1. Go to Authentication > Settings
2. Scroll to "Email Auth"
3. Toggle "Enable email confirmations" OFF (for development only!)
4. Remember to turn it back ON for production

### Fix 4: Icons Added

✅ Created `public/icon.svg` - This fixes the 404 errors

## Step-by-Step Fix Process

### Step 1: Run SQL Fixes
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Create new query
4. Copy and paste the contents of `supabase-fix-profile-policy.sql`
5. Click "Run"
6. Create another new query
7. Copy and paste the contents of `supabase-auto-create-profile.sql`
8. Click "Run"

### Step 2: Wait for Rate Limit Reset
- Wait 1 hour, OR
- Use a different email address, OR
- Disable email confirmation (development only)

### Step 3: Test Registration
1. Clear browser cache and cookies
2. Go to `/register`
3. Try registering with a new email
4. Should work without errors now

### Step 4: Verify Profile Creation
After successful registration:
1. Go to Supabase Dashboard
2. Click "Table Editor"
3. Select "profiles" table
4. You should see your new profile

## Testing Checklist

- [ ] Run both SQL scripts in Supabase
- [ ] Wait for rate limit reset (or use new email)
- [ ] Clear browser cache
- [ ] Register as learner - should work
- [ ] Register as instructor - should work
- [ ] Check profiles table - should have entries
- [ ] Login with new account - should work
- [ ] Dashboard loads - should work

## Troubleshooting

### Still Getting 401 Error?
**Check:**
1. RLS policies are created correctly
2. User is authenticated before profile creation
3. Database trigger is active

**Verify Policies:**
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
```

**Verify Trigger:**
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

### Still Getting Rate Limit Error?
**Options:**
1. Wait 1 hour
2. Use different email
3. Temporarily disable email confirmation (dev only)
4. Contact Supabase support to increase limits

### Profile Not Created?
**Check:**
1. Database trigger is active
2. RLS policies allow INSERT
3. Check Supabase logs for errors

**Manual Profile Creation:**
```sql
INSERT INTO profiles (id, email, first_name, last_name, role)
VALUES (
  'user-id-from-auth-users',
  'user@example.com',
  'First',
  'Last',
  'learner'
);
```

## Prevention

### For Development
1. Use test email services (mailinator, temp-mail)
2. Disable email confirmation temporarily
3. Use database trigger for auto profile creation
4. Monitor rate limits

### For Production
1. Keep email confirmation enabled
2. Monitor rate limits in Supabase dashboard
3. Set up proper error handling
4. Add user feedback for rate limit errors

## Updated Registration Flow

With the fixes applied:

1. User fills registration form
2. Supabase creates auth user
3. **Database trigger automatically creates profile** ✨
4. User is logged in
5. Redirected to dashboard

No more manual profile creation needed!

## Code Changes Made

### `lib/supabase-api.ts`
- Added error handling for profile creation
- Added fallback if profile creation fails
- Added delay for auth propagation
- Returns user data even if profile insert fails

### `public/icon.svg`
- Created favicon to fix 404 errors

## Success Indicators

✅ Registration completes without errors
✅ Profile appears in profiles table
✅ User can login immediately
✅ Dashboard loads correctly
✅ No 401 errors in console
✅ No 404 errors for icons

## Next Steps After Fix

1. Test registration with all roles (learner, instructor, admin)
2. Test login flow
3. Test dashboard access
4. Deploy to production
5. Monitor for any issues

---

**Status:** Fixes ready to apply
**Priority:** HIGH - Blocks user registration
**Estimated Fix Time:** 5 minutes
