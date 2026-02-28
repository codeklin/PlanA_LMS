# Vercel Deployment Guide for PlanA LMS

## 🚀 Quick Deploy (5 minutes)

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Supabase project set up
- Code pushed to GitHub

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial PlanA LMS setup"

# Add remote and push
git remote add origin https://github.com/yourusername/plana-lms.git
git branch -M main
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select "Import Git Repository"
4. Choose your GitHub repository
5. Vercel will auto-detect Next.js settings ✅

### Step 3: Configure Environment Variables

In the Vercel import screen, add these environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find these:**
- Go to your Supabase project
- Settings → API
- Copy the values

### Step 4: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes ⏱️
3. Your app is live! 🎉

Your URL will be: `https://your-project.vercel.app`

## 🔧 Advanced Configuration

### Custom Domain

1. Go to Vercel project → Settings → Domains
2. Add your domain (e.g., `plana.ng`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-60 minutes)

### Vercel CLI Deployment

```bash
# Install Vercel CLI globally
pnpm add -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls
```

### Environment Variables via CLI

```bash
# Add environment variable
vercel env add NEXT_PUBLIC_SUPABASE_URL

# List environment variables
vercel env ls

# Pull environment variables to local
vercel env pull .env.local
```

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

### Production Deployments
- Push to `main` branch → Automatic production deployment
- Every commit triggers a new deployment

### Preview Deployments
- Push to any other branch → Preview deployment
- Pull requests get unique preview URLs
- Perfect for testing before merging

### Deployment Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/new-feature

# Vercel creates preview deployment automatically
# Check preview URL in GitHub PR or Vercel dashboard

# After testing, merge to main
git checkout main
git merge feature/new-feature
git push origin main

# Vercel deploys to production automatically
```

## 🔐 Supabase Configuration for Vercel

After deploying, update Supabase settings:

### 1. Update Site URL

1. Go to Supabase → Authentication → URL Configuration
2. Set "Site URL" to: `https://your-app.vercel.app`

### 2. Add Redirect URLs

Add these to "Redirect URLs":
```
https://your-app.vercel.app/**
https://your-app.vercel.app/auth/callback
https://*.vercel.app/**  (for preview deployments)
```

### 3. Configure CORS (if needed)

In Supabase → Settings → API:
- Add your Vercel domain to allowed origins
- Usually not needed for same-origin requests

## 📊 Vercel Analytics

Enable analytics to track performance:

1. Go to Vercel project → Analytics
2. Click "Enable Analytics"
3. Free tier includes:
   - Page views
   - Top pages
   - Top referrers
   - Devices & browsers

Add to your app:
```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

Install package:
```bash
pnpm add @vercel/analytics
```

## 🚀 Performance Optimization

### Edge Functions

Vercel automatically uses Edge Functions for:
- API routes
- Middleware
- Server components

No configuration needed! ✅

### Image Optimization

Next.js Image component is automatically optimized on Vercel:

```tsx
import Image from 'next/image';

<Image
  src="/course-thumbnail.jpg"
  alt="Course"
  width={800}
  height={600}
  priority // for above-fold images
/>
```

### Caching

Vercel automatically caches:
- Static pages
- API responses (with proper headers)
- Images

Configure in `next.config.mjs`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-project.supabase.co'],
  },
  // Enable SWC minification
  swcMinify: true,
};

export default nextConfig;
```

## 🔍 Monitoring & Debugging

### View Logs

1. Go to Vercel project → Deployments
2. Click on a deployment
3. View "Build Logs" or "Function Logs"

### Real-time Logs (CLI)

```bash
# Stream production logs
vercel logs --follow

# Stream logs for specific deployment
vercel logs [deployment-url] --follow
```

### Error Tracking

Vercel shows errors in:
- Dashboard → Functions → Errors
- Real-time error notifications
- Integration with Sentry (optional)

## 🌍 Regional Deployment

PlanA is configured for Frankfurt region (closest to Nigeria):

```json
// vercel.json
{
  "regions": ["fra1"]
}
```

Available regions:
- `fra1` - Frankfurt (recommended for Nigeria)
- `lhr1` - London
- `iad1` - Washington DC
- `sfo1` - San Francisco

## 💰 Pricing

### Hobby Plan (Free)
- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS
- Perfect for development & small projects

### Pro Plan ($20/month)
- 1TB bandwidth/month
- Advanced analytics
- Team collaboration
- Password protection
- Recommended for production

## 🔒 Security

### Environment Variables

- Never commit `.env.local` to git
- Use Vercel dashboard or CLI to set production variables
- Different variables for preview vs production

### Authentication

Supabase handles auth, but ensure:
- RLS policies are enabled
- Service role key is kept secret
- CORS is properly configured

### HTTPS

- Automatic HTTPS on all Vercel deployments
- Free SSL certificates
- Automatic renewal

## 🐛 Troubleshooting

### Build Fails

**Error: "Module not found"**
```bash
# Clear cache and rebuild
vercel --force

# Or in dashboard: Redeploy → Clear cache
```

**Error: "pnpm not found"**
- Vercel auto-detects pnpm from `pnpm-lock.yaml`
- Ensure `pnpm-lock.yaml` is committed to git

### Environment Variables Not Working

1. Check variable names (case-sensitive)
2. Ensure `NEXT_PUBLIC_` prefix for client-side variables
3. Redeploy after adding variables
4. Check variable scope (Production/Preview/Development)

### Supabase Connection Issues

1. Verify environment variables are set
2. Check Supabase project is active
3. Verify redirect URLs in Supabase
4. Check CORS settings

### Slow Performance

1. Enable Vercel Analytics to identify bottlenecks
2. Optimize images with Next.js Image component
3. Use dynamic imports for large components
4. Enable SWC minification

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] Supabase project created
- [ ] Database migrated
- [ ] Storage buckets created
- [ ] Environment variables ready
- [ ] Build succeeds locally (`pnpm build`)

### Deployment
- [ ] Import project to Vercel
- [ ] Add environment variables
- [ ] Deploy
- [ ] Check deployment logs

### Post-Deployment
- [ ] Update Supabase Site URL
- [ ] Add Vercel URL to Supabase redirects
- [ ] Test authentication
- [ ] Test file uploads
- [ ] Test on mobile
- [ ] Configure custom domain (optional)
- [ ] Enable analytics (optional)

### Production Checklist
- [ ] All features tested
- [ ] Error tracking set up
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Team access configured
- [ ] Documentation updated

## 🔄 Rollback

If something goes wrong:

### Via Dashboard
1. Go to Vercel project → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Via CLI
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

## 🎯 Best Practices

1. **Use Preview Deployments**
   - Test features before production
   - Share preview URLs with team

2. **Environment Variables**
   - Use different values for preview vs production
   - Never expose service role keys

3. **Monitoring**
   - Enable Vercel Analytics
   - Check logs regularly
   - Set up error notifications

4. **Performance**
   - Optimize images
   - Use dynamic imports
   - Enable caching

5. **Security**
   - Keep dependencies updated
   - Review Supabase RLS policies
   - Use HTTPS only

## 📞 Support

### Vercel Resources
- [Vercel Docs](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

### PlanA Resources
- Check `README.md` for general setup
- Review `SUPABASE_SETUP.md` for database issues
- See `QUICK_REFERENCE.md` for common commands

## 🎉 Success!

Your PlanA LMS is now live on Vercel! 🚀

**Next Steps:**
1. Share your URL with team
2. Create first test user
3. Upload first course
4. Monitor analytics
5. Gather feedback

---

**Deployed with ❤️ on Vercel**

**Built for the Nigerian gig economy 🇳🇬**
