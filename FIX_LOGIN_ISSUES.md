# Fix "Invalid Login Credentials" Error

## Problem

Getting 400 Bad Request error when trying to login with valid credentials.

## Common Causes

1. **Email not confirmed** - User registered but didn't confirm email
2. **Email confirmation required** - Supabase settings require email confirmation
3. **Wrong password** - Password doesn't match
4. **User not found** - Email doesn't exist in database

## Quick Fix (Development)

### Option 1: Disable Email Confirmation (Fastest)

1. **Go to Supabase Dashboard**
2. **Authentication** → **Settings**
3. **Scroll to "Email Auth"**
4. **Toggle OFF** "Enable email confirmations"
5. **Save changes**
6. **Try logging in again**

### Option 2: Manually Confirm Users (Recommended)

Run this SQL in Supabase SQL Editor:

```sql
-- Confirm all users (development only!)
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  confirmed_at = COALESCE(confirmed_at, NOW())
WHERE email_confirmed_at IS NULL OR confirmed_at IS NULL;
```

Or use the complete script: `supabase-check-user-status.sql`

### Option 3: Check Email for Confirmation Link

1. Check the email inbox you registered with
2. Look for "Confirm your email" from Supabase
3. Click the confirmation link
4. Try logging in again

## Step-by-Step Fix

### Step 1: Check User Status

Run this in Supabase SQL Editor:

```sql
-- Check if users are confirmed
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ Not Confirmed'
    ELSE '✅ Confirmed'
  END as status
FROM auth.users
ORDER BY created_at DESC;
```

### Step 2: Identify the Issue

**If `email_confirmed_at` is NULL:**
- User needs to confirm email
- OR email confirmation needs to be disabled

**If `email_confirmed_at` has a date:**
- Password might be wrong
- OR there's another issue

### Step 3: Fix Based on Issue

#### Issue A: Email Not Confirmed

**Quick Fix (Dev):**
```sql
-- Confirm specific user
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email = 'user@example.com';
```

**Or confirm all users:**
```sql
-- Confirm all users
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  confirmed_at = COALESCE(confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;
```

#### Issue B: Wrong Password

**Reset password in Supabase Dashboard:**
1. Go to Authentication → Users
2. Find the user
3. Click the three dots (...)
4. Select "Send password recovery email"
5. Check email and reset password

**Or set password directly (dev only):**
```sql
-- This requires service role key, use Dashboard instead
```

#### Issue C: User Doesn't Exist

**Check if user exists:**
```sql
SELECT * FROM auth.users WHERE email = 'user@example.com';
```

If no results, user needs to register again.

### Step 4: Verify Fix

After applying fix:

1. **Check user is confirmed:**
```sql
SELECT email, email_confirmed_at, confirmed_at
FROM auth.users
WHERE email = 'user@example.com';
```

Both `email_confirmed_at` and `confirmed_at` should have dates.

2. **Try logging in:**
   - Go to `/login`
   - Enter email and password
   - Should work now ✅

## Complete Fix Script

Run this entire script: `supabase-check-user-status.sql`

It will:
1. Show all users and their status
2. Confirm all unconfirmed users
3. Verify the fix worked

## Supabase Settings Check

### Disable Email Confirmation (Development Only)

1. **Supabase Dashboard** → **Authentication** → **Settings**
2. **Email Auth section:**
   - ❌ Disable "Enable email confirmations"
   - ❌ Disable "Enable email change confirmations"
   - ❌ Disable "Secure email change"

3. **Save changes**

### Enable Email Confirmation (Production)

For production, you should:
1. ✅ Enable "Enable email confirmations"
2. ✅ Set up email templates
3. ✅ Configure SMTP settings (optional)

## Testing

After fix, test:

1. **Login with existing user:**
   ```
   Email: user@example.com
   Password: [your password]
   ```
   Should work ✅

2. **Register new user:**
   - Should work without confirmation (if disabled)
   - Should login immediately

3. **Check dashboard:**
   - Should load correctly
   - User data should display

## Troubleshooting

### Still Getting 400 Error?

**Check these:**

1. **Password is correct**
   - Try resetting password
   - Make sure no extra spaces

2. **Email is correct**
   - Check for typos
   - Check case sensitivity

3. **User exists in database**
   ```sql
   SELECT * FROM auth.users WHERE email = 'user@example.com';
   ```

4. **User is confirmed**
   ```sql
   SELECT email_confirmed_at FROM auth.users WHERE email = 'user@example.com';
   ```

5. **Profile exists**
   ```sql
   SELECT * FROM profiles WHERE email = 'user@example.com';
   ```

### Getting Different Error?

**401 Unauthorized:**
- Check Supabase URL and anon key in `.env.local`
- Verify keys are correct

**403 Forbidden:**
- Check RLS policies
- User might not have permission

**500 Server Error:**
- Check Supabase logs
- Database might be down

## Prevention

### For Development

1. **Disable email confirmation:**
   - Faster testing
   - No need to check emails

2. **Use test emails:**
   - mailinator.com
   - temp-mail.org
   - 10minutemail.com

3. **Keep test users:**
   - Don't delete test accounts
   - Document test credentials

### For Production

1. **Enable email confirmation:**
   - Better security
   - Verify real emails

2. **Set up proper SMTP:**
   - Custom email templates
   - Your domain's email

3. **Monitor auth logs:**
   - Check for failed logins
   - Identify issues early

## Quick Commands

### Check User Status
```sql
SELECT email, email_confirmed_at, confirmed_at 
FROM auth.users 
ORDER BY created_at DESC;
```

### Confirm All Users (Dev)
```sql
UPDATE auth.users
SET email_confirmed_at = NOW(), confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
```

### Confirm Specific User
```sql
UPDATE auth.users
SET email_confirmed_at = NOW(), confirmed_at = NOW()
WHERE email = 'user@example.com';
```

### Delete Test User
```sql
-- Delete from profiles first
DELETE FROM profiles WHERE email = 'test@example.com';

-- Then delete from auth.users (requires service role)
-- Use Supabase Dashboard instead
```

## Success Checklist

- [ ] User exists in auth.users
- [ ] User has email_confirmed_at date
- [ ] User has confirmed_at date
- [ ] User has profile in profiles table
- [ ] Email confirmation disabled (dev) or email confirmed (prod)
- [ ] Password is correct
- [ ] Can login successfully
- [ ] Dashboard loads correctly

## Next Steps

After fixing login:

1. Test all user roles (learner, instructor, admin)
2. Test registration flow
3. Test password reset
4. Deploy to production
5. Enable email confirmation for production

---

**Status:** Ready to fix
**Time:** 2-5 minutes
**Difficulty:** Easy
