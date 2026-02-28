# PlanA LMS - Quick Start (pnpm + Vercel)

## ⚡ 15-Minute Setup

### Prerequisites
- Node.js 18+ installed
- pnpm installed: `npm install -g pnpm`
- GitHub account
- Vercel account (free)
- Supabase account (free)

## 🚀 Step-by-Step

### 1. Clone & Install (2 minutes)

```bash
# Clone repository
git clone <your-repo-url>
cd plana-lms

# Install dependencies with pnpm
pnpm install
```

### 2. Set Up Supabase (5 minutes)

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Name: `plana-lms`
   - Choose region: Frankfurt (closest to Nigeria)
   - Wait 2 minutes for setup

2. **Run Database Migration**
   - Go to SQL Editor in Supabase
   - Copy entire contents of `supabase-migration.sql`
   - Paste and click "Run"
   - Verify tables created in Table Editor

3. **Create Storage Buckets**
   - Go to Storage
   - Create 4 buckets:
     - `course-materials` (public)
     - `submissions` (private)
     - `profiles` (public)
     - `certificates` (public)

4. **Get API Keys**
   - Go to Settings → API
   - Copy:
     - Project URL
     - anon/public key
     - service_role key

### 3. Configure Environment (1 minute)

```bash
# Copy template
cp .env.example .env.local

# Edit .env.local and add your Supabase keys
```

Your `.env.local` should look like:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Test Locally (2 minutes)

```bash
# Start development server
pnpm dev

# Open browser
# http://localhost:3000

# Create test account
# Sign up with email/password
# Check Supabase dashboard for new profile
```

### 5. Deploy to Vercel (5 minutes)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial PlanA setup"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel auto-detects Next.js + pnpm ✅

3. **Add Environment Variables**
   In Vercel import screen, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live! 🎉

5. **Update Supabase**
   - Go to Supabase → Authentication → URL Configuration
   - Set "Site URL" to your Vercel URL
   - Add to "Redirect URLs": `https://your-app.vercel.app/**`

## ✅ Verification Checklist

- [ ] Local dev server runs (`pnpm dev`)
- [ ] Can create account locally
- [ ] Profile appears in Supabase
- [ ] Vercel deployment succeeds
- [ ] Can access production URL
- [ ] Can create account in production
- [ ] No console errors

## 🎯 What You Have Now

✅ Orange & Blue themed LMS
✅ Supabase backend (database + auth + storage)
✅ Deployed on Vercel with automatic CI/CD
✅ Real-time updates
✅ File upload capability
✅ Mobile-responsive design

## 📚 Next Steps

### Immediate
1. Read [PLANA_PHILOSOPHY.md](./PLANA_PHILOSOPHY.md) - Understand the vision
2. Review [COLOR_GUIDE.md](./COLOR_GUIDE.md) - Learn the design system
3. Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Common tasks

### This Week
1. Create your first course (project-based)
2. Customize branding
3. Add sample content
4. Test on mobile devices

### This Month
1. Launch first cohort
2. Gather feedback
3. Iterate on features
4. Build community

## 🔧 Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server locally

# Deployment
git push origin main  # Auto-deploys to Vercel

# Vercel CLI (optional)
pnpm add -g vercel    # Install CLI
vercel                # Deploy preview
vercel --prod         # Deploy production
vercel logs --follow  # View logs
```

## 🐛 Troubleshooting

### "pnpm not found"
```bash
npm install -g pnpm
```

### Build fails on Vercel
- Check environment variables are set
- Ensure `pnpm-lock.yaml` is committed
- Check build logs in Vercel dashboard

### Supabase connection fails
- Verify API keys in `.env.local` (local) or Vercel (production)
- Check Supabase project is active
- Verify redirect URLs in Supabase

### Can't create account
- Check Supabase email settings
- Verify RLS policies are enabled
- Check browser console for errors

## 📞 Need Help?

1. **Check Documentation**
   - [README.md](./README.md) - Overview
   - [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Deployment details
   - [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Database help

2. **Check Logs**
   - Vercel: Dashboard → Deployments → Logs
   - Supabase: Dashboard → Logs
   - Browser: DevTools → Console

3. **Common Issues**
   - See [README.md](./README.md) → Support section
   - See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) → Troubleshooting

## 🎉 You're Ready!

Your PlanA LMS is now:
- ✅ Running locally
- ✅ Deployed to Vercel
- ✅ Connected to Supabase
- ✅ Ready for development

**Start building for the Nigerian gig economy! 🚀🇳🇬**

---

**Total Setup Time**: ~15 minutes
**Cost**: $0 (free tiers)
**Next**: Create your first project-based course!
