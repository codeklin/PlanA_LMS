# Quick Deploy Guide - PlanA LMS

## 🚀 Deploy in 3 Steps

### Step 1: Commit Changes
```bash
git add .
git commit -m "Fix auth, accessibility, and deployment issues"
git push origin main
```

### Step 2: Configure Vercel (First Time Only)
1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your-supabase-url
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your-anon-key
4. Settings → General → Build & Development Settings
   - Build Command: `pnpm run build`
   - Install Command: `pnpm install`
5. Save

### Step 3: Deploy
Vercel will auto-deploy on push, or click "Redeploy" in dashboard.

---

## 🔧 Create Super Admin

Run in Supabase SQL Editor:
```sql
UPDATE public.profiles
SET role = 'super-admin', updated_at = NOW()
WHERE email = 'gigsdev007@gmail.com';
```

---

## ✅ Verify Deployment

1. Check build logs - should show `pnpm` commands
2. Visit `/auth/callback` - no errors
3. Test email confirmation link
4. Login as super admin → should redirect to `/admin`

---

## 🐛 Quick Fixes

### Build Fails
```bash
rm -rf node_modules .next
pnpm install
pnpm build
```

### Auth Issues
1. Clear browser localStorage
2. Check Supabase user exists
3. Run `verify-and-fix-auth-trigger.sql`

### Vercel Issues
1. Clear build cache in Vercel settings
2. Verify environment variables
3. Redeploy

---

## 📚 Full Documentation

- `ALL_ISSUES_FIXED.md` - Complete summary
- `AUTH_FIXES_APPLIED.md` - Auth details
- `ACCESSIBILITY_FIXES.md` - A11y details
- `VERCEL_DEPLOYMENT_FIXED.md` - Deploy details

---

## 🎯 What Was Fixed

✅ Auth lock errors
✅ Multiple client instances
✅ Accessibility warnings
✅ Suspense boundary errors
✅ pnpm configuration
✅ Email confirmation flow
✅ Super admin setup

---

## 🚦 Status: READY TO DEPLOY! 🚀
