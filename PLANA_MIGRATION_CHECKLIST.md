# PlanA Migration Checklist

## ✅ Completed

### Theme Updates
- [x] Updated color scheme to Orange (#FF6B35) and Blue (#2E5EFF)
- [x] Removed gradients, using solid colors only
- [x] Updated light and dark mode themes
- [x] Applied PlanA branding colors to all CSS variables

### Supabase Setup Files Created
- [x] `lib/supabase/client.ts` - Client-side Supabase client
- [x] `lib/supabase/server.ts` - Server-side Supabase client
- [x] `lib/supabase/middleware.ts` - Auth middleware
- [x] `lib/supabase-api.ts` - Supabase API wrapper
- [x] `lib/supabase-auth-context.tsx` - Auth context with Supabase
- [x] `.env.example` - Environment variables template
- [x] `SUPABASE_SETUP.md` - Complete setup guide
- [x] `PLANA_IMPLEMENTATION_GUIDE.md` - Full implementation plan

## 🔄 Next Steps (In Order)

### 1. Supabase Project Setup (15 minutes)
- [ ] Create Supabase project at https://supabase.com
- [ ] Copy API keys to `.env.local`
- [ ] Run SQL migration from `PLANA_IMPLEMENTATION_GUIDE.md`
- [ ] Create storage buckets (course-materials, submissions, profiles, certificates)
- [ ] Configure RLS policies
- [ ] Test connection

### 2. Install Dependencies (2 minutes)
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### 3. Update Root Layout (5 minutes)
- [ ] Replace `AuthProvider` with `SupabaseAuthProvider` in `app/layout.tsx`
- [ ] Add Supabase middleware to `middleware.ts` (create if doesn't exist)

### 4. Update Authentication Pages (10 minutes)
- [ ] Update `app/login/page.tsx` to use `useSupabaseAuth`
- [ ] Update `app/register/page.tsx` to use `useSupabaseAuth`
- [ ] Test login/register flow

### 5. Update Dashboard Pages (20 minutes)
- [ ] Update `app/dashboard/page.tsx` to use Supabase API
- [ ] Update `app/dashboard/courses/page.tsx`
- [ ] Update `app/dashboard/progress/page.tsx`
- [ ] Update instructor pages
- [ ] Update admin pages

### 6. Update Components (15 minutes)
- [ ] Update `components/dashboard-sidebar.tsx` with PlanA branding
- [ ] Update `components/course-card.tsx` with orange/blue theme
- [ ] Update `components/stat-card.tsx` colors
- [ ] Add PlanA logo to `components/top-header.tsx`

### 7. PlanA-Specific Features (30 minutes)
- [ ] Create project showcase page
- [ ] Add speed metrics to dashboard
- [ ] Create skills verification badges
- [ ] Add gig economy focus messaging
- [ ] Update course structure to be project-based

### 8. Mobile Optimization (20 minutes)
- [ ] Test all pages on mobile
- [ ] Optimize video player for data efficiency
- [ ] Add offline mode indicators
- [ ] Test touch interactions

### 9. Testing (30 minutes)
- [ ] Test authentication flow
- [ ] Test course enrollment
- [ ] Test file uploads
- [ ] Test real-time updates
- [ ] Test on mobile devices
- [ ] Test dark mode

### 10. Deployment (15 minutes)
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Configure production environment variables
- [ ] Test production deployment
- [ ] Set up custom domain (optional)

## 📋 Detailed Migration Tasks

### A. Replace API Calls

Find and replace in all files:
```typescript
// Old
import { api } from '@/lib/api';
const data = await api.getCourses();

// New
import { supabaseApi } from '@/lib/supabase-api';
const data = await supabaseApi.getCourses();
```

### B. Replace Auth Context

Find and replace in all files:
```typescript
// Old
import { useAuth } from '@/lib/auth-context';

// New
import { useSupabaseAuth as useAuth } from '@/lib/supabase-auth-context';
```

### C. Update File Uploads

```typescript
// Old (Express/MongoDB)
const formData = new FormData();
formData.append('file', file);
await fetch('/api/upload', { method: 'POST', body: formData });

// New (Supabase)
const { url } = await supabaseApi.uploadFile(
  'submissions',
  `${userId}/${Date.now()}-${file.name}`,
  file
);
```

### D. Add Real-time Features

```typescript
// Subscribe to progress updates
useEffect(() => {
  const subscription = supabaseApi.subscribeToProgress(
    userId,
    (payload) => {
      console.log('Progress updated:', payload);
      // Update UI
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}, [userId]);
```

## 🎨 PlanA Branding Updates

### Colors to Use
- Primary Orange: `#FF6B35` or `oklch(0.68 0.22 41)`
- Primary Blue: `#2E5EFF` or `oklch(0.55 0.20 250)`
- Use for: Buttons, links, highlights, progress bars

### Messaging Updates
Replace academic language with gig economy focus:
- "Course" → "Project"
- "Lesson" → "Task" or "Step"
- "Assignment" → "Deliverable"
- "Grade" → "Client Rating"
- "Certificate" → "Portfolio Piece"

### Content Structure
Update course pages to show:
1. Project Brief (what you'll build)
2. Skills You'll Gain (for gig platforms)
3. Time to Complete (4-12 weeks)
4. Portfolio Outcome (what clients will see)

## 🚀 Quick Commands

```bash
# Start development
npm run dev

# Test Supabase connection
npx tsx test-supabase.ts

# Generate Supabase types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

## 📞 Support

If you encounter issues:
1. Check `SUPABASE_SETUP.md` for troubleshooting
2. Review Supabase logs in dashboard
3. Check browser console for errors
4. Verify environment variables are set

## 🎯 Success Criteria

Migration is complete when:
- [ ] All pages load without errors
- [ ] Authentication works (login/register/logout)
- [ ] Courses display correctly
- [ ] File uploads work
- [ ] Real-time updates function
- [ ] Mobile experience is smooth
- [ ] Orange/blue theme is consistent
- [ ] PlanA messaging is clear

## 📈 Post-Migration

After successful migration:
1. Remove old MongoDB backend code
2. Archive `lib/api.ts` and `lib/auth-context.tsx`
3. Update documentation
4. Train team on Supabase
5. Monitor performance and errors
6. Gather user feedback

---

**Current Status**: Theme updated ✅, Supabase files created ✅
**Next Action**: Create Supabase project and run SQL migration
**Estimated Time to Complete**: 2-3 hours
