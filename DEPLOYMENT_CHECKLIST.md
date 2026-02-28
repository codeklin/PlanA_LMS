# PlanA LMS Deployment Checklist

## ✅ Pre-Deployment (Completed)

- [x] Supabase migration run successfully
- [x] Storage buckets created with policies
- [x] Build compiles without errors
- [x] All pages migrated to Supabase auth
- [x] PlanA branding applied throughout
- [x] Orange/blue theme implemented

## 🚀 Deployment Steps

### 1. Environment Variables

Set these in your `.env.local` file (already done):
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Test Locally

```bash
# Start development server
pnpm dev

# Open browser
http://localhost:3000
```

**Test these features:**
- [ ] Landing page loads
- [ ] Register new user
- [ ] Login with credentials
- [ ] Dashboard loads based on role
- [ ] Course list displays
- [ ] Cohort list displays
- [ ] Logout works
- [ ] Protected routes redirect to login

### 3. Build for Production

```bash
# Create production build
pnpm build

# Test production build locally
pnpm start
```

### 4. Deploy to Vercel

#### Option A: Via Vercel CLI
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: Via Git Push
```bash
# Commit all changes
git add .
git commit -m "Complete PlanA LMS migration to Supabase"

# Push to main branch
git push origin main
```

Vercel will automatically deploy when you push to main.

### 5. Configure Vercel Environment Variables

In Vercel Dashboard:
1. Go to your project
2. Click "Settings" > "Environment Variables"
3. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
```

4. Click "Save"
5. Redeploy if needed

### 6. Update Supabase Settings

In Supabase Dashboard > Authentication > URL Configuration:

**Site URL:**
```
https://your-domain.vercel.app
```

**Redirect URLs (add both):**
```
https://your-domain.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

### 7. Test Production Deployment

Visit your Vercel URL and test:
- [ ] Landing page loads
- [ ] Register new user
- [ ] Login works
- [ ] Dashboard loads
- [ ] Data loads from Supabase
- [ ] Logout works
- [ ] Mobile responsive
- [ ] All routes accessible

### 8. Post-Deployment Tasks

- [ ] Create test users for each role (learner, instructor, admin)
- [ ] Create sample cohorts
- [ ] Create sample courses
- [ ] Test enrollment flow
- [ ] Monitor Supabase logs for errors
- [ ] Check Vercel logs for issues

## 📊 Monitoring

### Vercel Dashboard
- Check deployment status
- Monitor function logs
- View analytics

### Supabase Dashboard
- Monitor database queries
- Check storage usage
- Review authentication logs
- Monitor API usage

## 🐛 Troubleshooting

### Issue: "Module not found" errors
**Solution:** Clear Next.js cache and rebuild
```bash
rm -rf .next
pnpm build
```

### Issue: Authentication not working
**Solution:** Check Supabase redirect URLs match your domain

### Issue: Data not loading
**Solution:** 
1. Check Supabase RLS policies
2. Verify environment variables
3. Check browser console for errors

### Issue: Build fails on Vercel
**Solution:**
1. Check Vercel build logs
2. Ensure all dependencies are in package.json
3. Verify Node.js version compatibility

## 🔒 Security Checklist

- [x] RLS enabled on all Supabase tables
- [x] Storage bucket policies configured
- [x] Authentication required for protected routes
- [x] Environment variables not committed to git
- [x] API keys are anon keys (not service role keys)
- [ ] Set up rate limiting (optional)
- [ ] Configure CORS if needed (optional)

## 📈 Performance Optimization

- [x] Static pages pre-rendered (18 pages)
- [x] Dynamic pages server-rendered (4 pages)
- [x] Images optimized (Next.js Image component)
- [ ] Add caching headers (optional)
- [ ] Enable Vercel Analytics (optional)
- [ ] Set up monitoring (optional)

## 🎯 Success Criteria

Deployment is successful when:
- ✅ Build completes without errors
- ✅ All pages load correctly
- ✅ Authentication works end-to-end
- ✅ Data loads from Supabase
- ✅ Mobile responsive
- ✅ No console errors
- ✅ Fast page loads (<3s)

## 📝 Post-Launch

### Week 1
- [ ] Monitor error logs daily
- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Optimize slow queries

### Week 2-4
- [ ] Implement remaining features
- [ ] Add course content viewer
- [ ] Build progress tracking
- [ ] Develop submission system

### Month 2+
- [ ] Add admin features
- [ ] Build instructor course builder
- [ ] Implement quiz system
- [ ] Add certificate generation

## 🆘 Support

If you encounter issues:
1. Check Vercel logs
2. Check Supabase logs
3. Review browser console
4. Check this documentation
5. Review Supabase docs: https://supabase.com/docs
6. Review Next.js docs: https://nextjs.org/docs

## 🎉 Congratulations!

Your PlanA LMS is now live! 🚀

**Next Steps:**
1. Share the URL with test users
2. Gather feedback
3. Iterate and improve
4. Build remaining features

---

**Deployment Date:** _____________
**Deployed By:** _____________
**Vercel URL:** _____________
**Status:** Ready for deployment ✅
