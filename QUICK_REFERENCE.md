# PlanA LMS - Quick Reference Card

## 🎨 Theme Colors

```css
/* Primary Orange */
#FF6B35 or oklch(0.68 0.22 41)

/* Primary Blue */
#2E5EFF or oklch(0.55 0.20 250)

/* Usage */
Orange: Primary actions, progress, success, CTAs
Blue: Secondary actions, information, links, navigation
```

## 🔑 Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Optional
PAYSTACK_SECRET_KEY=sk_xxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_xxx
```

## 📦 Key Files

| File | Purpose |
|------|---------|
| `lib/supabase/client.ts` | Client-side Supabase |
| `lib/supabase-api.ts` | API wrapper |
| `lib/supabase-auth-context.tsx` | Auth context |
| `supabase-migration.sql` | Database schema |
| `app/globals.css` | Theme colors |

## 🔄 API Migration

### Old (MongoDB)
```typescript
import { api } from '@/lib/api';
const courses = await api.getCourses();
```

### New (Supabase)
```typescript
import { supabaseApi } from '@/lib/supabase-api';
const courses = await supabaseApi.getCourses();
```

## 🔐 Auth Migration

### Old
```typescript
import { useAuth } from '@/lib/auth-context';
```

### New
```typescript
import { useSupabaseAuth as useAuth } from '@/lib/supabase-auth-context';
```

## 📤 File Upload

```typescript
// Upload file
const { url } = await supabaseApi.uploadFile(
  'submissions',
  `${userId}/${filename}`,
  file
);

// Delete file
await supabaseApi.deleteFile('submissions', path);
```

## 🔴 Real-time Subscriptions

```typescript
// Subscribe to progress updates
const subscription = supabaseApi.subscribeToProgress(
  userId,
  (payload) => {
    console.log('Update:', payload);
  }
);

// Cleanup
subscription.unsubscribe();
```

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles |
| `cohorts` | Learning cohorts |
| `courses` | Project-based courses |
| `modules` | Course milestones |
| `lessons` | Action steps |
| `learner_progress` | Progress tracking |
| `submissions` | Project submissions |
| `events` | Deadlines & sessions |
| `cohort_enrollments` | Enrollment status |

## 🎯 PlanA Terminology

| Old | New |
|-----|-----|
| Course | Project |
| Lesson | Task/Step |
| Assignment | Deliverable |
| Grade | Client Rating |
| Certificate | Portfolio Piece |
| Instructor | Mentor |

## 🚀 Common Commands

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Build for production
pnpm build

# Deploy to Vercel
vercel --prod

# Generate Supabase types
pnpm exec supabase gen types typescript --project-id XXX
```

## 📊 Storage Buckets

| Bucket | Public | Size Limit | Purpose |
|--------|--------|------------|---------|
| `course-materials` | Yes | 100MB | Videos, PDFs |
| `submissions` | No | 50MB | Student work |
| `profiles` | Yes | 5MB | Avatars |
| `certificates` | Yes | 2MB | Certificates |

## 🔒 RLS Quick Check

```sql
-- Test as authenticated user
SELECT * FROM profiles WHERE id = auth.uid();

-- Test course access
SELECT * FROM courses WHERE is_published = true;

-- Test submission access
SELECT * FROM submissions WHERE learner_id = auth.uid();
```

## 🐛 Debug Checklist

- [ ] Check .env.local has correct keys
- [ ] Verify Supabase project is active
- [ ] Check browser console for errors
- [ ] Review Supabase logs in dashboard
- [ ] Test with service_role key (bypasses RLS)
- [ ] Clear browser cache and rebuild
- [ ] Check network tab for failed requests

## 📱 Mobile Testing

```bash
# Get local IP
ipconfig getifaddr en0  # Mac
hostname -I             # Linux
ipconfig                # Windows

# Access from mobile
http://YOUR_IP:3000
```

## 🎨 Component Colors

```typescript
// Button variants
<Button className="bg-primary">Orange</Button>
<Button className="bg-secondary">Blue</Button>

// Status colors
on-track: text-primary (orange)
at-risk: text-destructive (red)
completed: text-secondary (blue)
```

## 📧 Email Templates

Customize in Supabase Dashboard:
- Authentication → Email Templates
- Update with PlanA branding
- Use orange/blue colors
- Add Nigerian context

## 💳 Payment Integration

```typescript
// Paystack (Nigerian)
import { PaystackButton } from 'react-paystack';

// Flutterwave (Nigerian)
import { FlutterWaveButton } from 'flutterwave-react-v3';
```

## 🔗 Useful Links

- Supabase Dashboard: https://app.supabase.com
- Vercel Dashboard: https://vercel.com/dashboard
- Paystack Docs: https://paystack.com/docs
- Flutterwave Docs: https://developer.flutterwave.com

## 📞 Support Resources

- `PLANA_TRANSFORMATION_SUMMARY.md` - Overview
- `PLANA_IMPLEMENTATION_GUIDE.md` - Full guide
- `SUPABASE_SETUP.md` - Database setup
- `PLANA_MIGRATION_CHECKLIST.md` - Task list
- `PLANA_PHILOSOPHY.md` - Design principles

## ⚡ Performance Tips

1. Use Supabase CDN for media files
2. Enable image optimization in Next.js
3. Implement lazy loading for videos
4. Use skeleton loaders
5. Cache API responses
6. Optimize images before upload
7. Use WebP format for images
8. Enable Vercel Edge Functions

## 🎯 Success Metrics

Track in dashboard:
- Time to first portfolio piece
- Projects completed per week
- First gig secured (days)
- Monthly active users
- Course completion rate
- Portfolio pieces created

## 🔄 Migration Status

- [x] Theme updated (Orange/Blue)
- [x] Supabase files created
- [x] Documentation complete
- [ ] Supabase project created
- [ ] Database migrated
- [ ] Auth flow updated
- [ ] API calls migrated
- [ ] Testing complete
- [ ] Production deployed

---

**Keep this file handy during development!**

Print it out or keep it open in a second monitor for quick reference.
