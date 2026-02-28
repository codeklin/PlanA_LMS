# 🚀 Deploy PlanA LMS to Vercel - Quick Guide

## Your Setup Status ✅
- ✅ Code on GitHub: https://github.com/codeklin/PlanA_LMS.git
- ✅ Vercel CLI installed
- ✅ Environment variables ready
- ✅ Build tested and working

## Deploy Now (2 Options)

### Option 1: Vercel Dashboard (Recommended - 5 minutes)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/new
   - Login with your account

2. **Import Your Repository**
   - Click "Import Project"
   - Select "Import Git Repository"
   - Choose: `codeklin/PlanA_LMS`
   - Vercel auto-detects Next.js ✅

3. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   Value: https://avzdofolwksvgohumpbp.supabase.co

   NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2emRvZm9sd2tzdmdvaHVtcGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyODY3MzMsImV4cCI6MjA4Nzg2MjczM30.DU4X5PCJSeMJN8czVRRjo65GTDNbjnDAsN7AuqUUUAM

   SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2emRvZm9sd2tzdmdvaHVtcGJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI4NjczMywiZXhwIjoyMDg3ODYyNzMzfQ.YcPSJCjYaaA84kSby9NNM-5t8yF1ZIU5ygoUxWWYSBE
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Done! 🎉

### Option 2: Vercel CLI (Fast - 2 minutes)

Run these commands:

```bash
# Login to Vercel (if not already)
vercel login

# Deploy to production
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **plana-lms** (or press Enter)
- Directory? **./** (press Enter)
- Override settings? **N**

Vercel will:
1. Build your app
2. Deploy to production
3. Give you a live URL

## After Deployment

### 1. Get Your Vercel URL
You'll get a URL like: `https://plana-lms.vercel.app`

### 2. Update Supabase Settings

Go to: https://supabase.com/dashboard/project/avzdofolwksvgohumpbp/auth/url-configuration

**Site URL:**
```
https://your-app.vercel.app
```

**Redirect URLs (add these):**
```
https://your-app.vercel.app/**
https://your-app.vercel.app/auth/callback
https://*.vercel.app/**
http://localhost:3000/**
```

### 3. Test Your Deployment

Visit your Vercel URL and test:
- ✅ Landing page loads
- ✅ Register new user
- ✅ Login works
- ✅ Dashboard displays
- ✅ Courses load
- ✅ Mobile responsive

## Troubleshooting

### Build Fails
```bash
# Clear cache and redeploy
vercel --prod --force
```

### Environment Variables Missing
- Go to Vercel Dashboard → Settings → Environment Variables
- Add the variables listed above
- Redeploy

### Authentication Not Working
- Check Supabase redirect URLs
- Verify environment variables in Vercel
- Check browser console for errors

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Update Supabase URLs
3. ✅ Test authentication
4. ✅ Share with team
5. 🎉 Launch!

---

**Ready to deploy? Choose Option 1 or Option 2 above!**
