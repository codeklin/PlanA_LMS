# PlanA LMS 🚀

> High-speed, project-based learning for the Nigerian gig economy

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Powered-green)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)

## 🎯 What is PlanA?

PlanA is a learning platform built for the Nigerian gig economy. We focus on:

- **Zero Theory** - Every lesson builds something real
- **High-Speed** - Get gig-ready in 4-12 weeks
- **Project-Based** - Build portfolio pieces, not exercises
- **Gig-Ready** - Skills for Upwork, Fiverr, Toptal

## ✨ Features

### For Learners
- 📱 Mobile-first, data-efficient design
- 🎨 Build real portfolio projects
- ⚡ Track your speed metrics
- 🏆 Skills verification badges
- 💼 Gig platform integration
- 📊 Real-time progress tracking

### For Instructors
- 🎓 Project-based course builder
- 👥 Cohort management
- 📝 Real-time feedback system
- 📈 Learner analytics
- 🔔 Automated notifications

### For Admins
- 🎛️ Complete platform control
- 📊 Analytics dashboard
- 👤 User management
- 🔐 Role-based access
- 📋 Audit logging

## 🎨 Design

### Theme
- **Primary**: Orange `#FF6B35` - Energy, action, progress
- **Secondary**: Blue `#2E5EFF` - Trust, information, calm
- **Style**: Solid colors, no gradients, clean and fast

### Philosophy
Every design decision serves one goal: **Help learners win their first gig faster.**

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) |
| Backend | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Real-time | Supabase Realtime |
| Deployment | Vercel |

## 🚀 Quick Start

> **Using pnpm + Vercel?** See [QUICK_START_PNPM_VERCEL.md](./QUICK_START_PNPM_VERCEL.md) for a 15-minute setup guide.

### Prerequisites
- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Supabase account (free tier works)
- Vercel account (free tier works)
- Git

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd plana-lms
pnpm install
```

### 2. Set Up Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create new project: "plana-lms"
3. Copy your API keys

### 3. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run Database Migration
1. Open Supabase SQL Editor
2. Copy contents of `supabase-migration.sql`
3. Paste and run
4. Verify tables created in Table Editor

### 5. Create Storage Buckets
In Supabase Dashboard → Storage, create:
- `course-materials` (public)
- `submissions` (private)
- `profiles` (public)
- `certificates` (public)

### 6. Start Development
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [PLANA_TRANSFORMATION_SUMMARY.md](./PLANA_TRANSFORMATION_SUMMARY.md) | Overview of changes |
| [PLANA_IMPLEMENTATION_GUIDE.md](./PLANA_IMPLEMENTATION_GUIDE.md) | Full implementation plan |
| [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) | Database setup guide |
| [PLANA_MIGRATION_CHECKLIST.md](./PLANA_MIGRATION_CHECKLIST.md) | Step-by-step tasks |
| [PLANA_PHILOSOPHY.md](./PLANA_PHILOSOPHY.md) | Design principles |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | Quick reference card |

## 🏗️ Project Structure

```
plana-lms/
├── app/                          # Next.js app directory
│   ├── dashboard/               # Learner dashboard
│   ├── instructor/              # Instructor pages
│   ├── admin/                   # Admin pages
│   ├── login/                   # Authentication
│   └── globals.css              # Theme (Orange/Blue)
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── dashboard/               # Dashboard components
│   └── course/                  # Course components
├── lib/                         # Utilities
│   ├── supabase/               # Supabase clients
│   ├── supabase-api.ts         # API wrapper
│   └── supabase-auth-context.tsx # Auth context
├── supabase-migration.sql       # Database schema
└── .env.example                 # Environment template
```

## 🔐 Authentication

PlanA uses Supabase Auth with email/password:

```typescript
import { useSupabaseAuth } from '@/lib/supabase-auth-context';

function LoginPage() {
  const { login } = useSupabaseAuth();
  
  await login(email, password);
}
```

## 📊 Database Schema

Key tables:
- `profiles` - User profiles with roles
- `cohorts` - Learning cohorts
- `courses` - Project-based courses
- `modules` - Course milestones
- `lessons` - Action steps
- `learner_progress` - Progress tracking
- `submissions` - Project submissions
- `events` - Deadlines & sessions

See `supabase-migration.sql` for complete schema.

## 🎨 Styling

### Using Theme Colors

```tsx
// Orange (Primary)
<Button className="bg-primary text-primary-foreground">
  Start Project
</Button>

// Blue (Secondary)
<Button className="bg-secondary text-secondary-foreground">
  Learn More
</Button>
```

### Custom Colors

```css
/* In your CSS */
.custom-element {
  background: oklch(0.68 0.22 41); /* Orange */
  color: oklch(0.55 0.20 250);     /* Blue */
}
```

## 📤 File Uploads

```typescript
import { supabaseApi } from '@/lib/supabase-api';

// Upload file
const { url } = await supabaseApi.uploadFile(
  'submissions',
  `${userId}/${filename}`,
  file
);

// Use URL in your app
<img src={url} alt="Submission" />
```

## 🔴 Real-time Updates

```typescript
import { supabaseApi } from '@/lib/supabase-api';

// Subscribe to progress updates
useEffect(() => {
  const subscription = supabaseApi.subscribeToProgress(
    userId,
    (payload) => {
      console.log('Progress updated:', payload);
      // Update UI
    }
  );

  return () => subscription.unsubscribe();
}, [userId]);
```

## 🧪 Testing

```bash
# Run linter
pnpm lint

# Build for production (tests build)
pnpm build

# Test Supabase connection
pnpm exec tsx test-supabase.ts
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

PlanA is optimized for Vercel deployment with automatic CI/CD.

#### Option 1: Deploy via Vercel Dashboard (Easiest)

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
   - Vercel auto-detects Next.js settings

3. **Add Environment Variables**
   In Vercel project settings → Environment Variables, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live! 🎉

#### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Vercel Configuration

Create `vercel.json` (optional, for custom settings):
```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["fra1"]
}
```

### Vercel Deployment Checklist

- [ ] Push code to GitHub
- [ ] Import project to Vercel
- [ ] Add environment variables
- [ ] Deploy
- [ ] Test authentication
- [ ] Test file uploads
- [ ] Configure custom domain (optional)
- [ ] Enable Vercel Analytics (optional)

### Post-Deployment

1. **Update Supabase Settings**
   - Go to Supabase → Authentication → URL Configuration
   - Add your Vercel URL to "Site URL"
   - Add to "Redirect URLs": `https://your-app.vercel.app/**`

2. **Test Production**
   - Create test account
   - Upload test file
   - Check real-time updates
   - Test on mobile

3. **Monitor**
   - Check Vercel Analytics
   - Review Supabase logs
   - Monitor error rates

## 📱 Mobile Optimization

PlanA is mobile-first:
- Touch-friendly buttons (min 44px)
- Data-efficient video streaming
- Offline mode support
- Bottom navigation
- Swipe gestures

Test on mobile:
```bash
# Get your local IP
ipconfig getifaddr en0  # Mac

# Access from mobile
http://YOUR_IP:3000
```

## 🌍 Nigerian Context

### Payment Integration
- Paystack (recommended)
- Flutterwave
- Bank transfer

### Data Efficiency
- Optimized video streaming
- Offline mode
- Progressive image loading
- Lazy loading

### Local Examples
- Nigerian businesses
- Local success stories
- Naira pricing
- Nigerian English

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

### Documentation
- Check the docs in the project root
- Review Supabase logs
- Check browser console

### Common Issues

**Supabase connection fails**
- Verify API keys in `.env.local`
- Check project is active (not paused)
- Review network settings

**RLS policy errors**
- Check user is authenticated
- Review policy conditions
- Test with service_role key

**File upload fails**
- Verify bucket exists
- Check storage policies
- Confirm file size limits

### Resources
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🎯 Roadmap

### Phase 1: Core Platform ✅
- [x] Orange/Blue theme
- [x] Supabase integration
- [x] Authentication system
- [ ] Project-based courses
- [ ] Portfolio showcase

### Phase 2: Gig Features
- [ ] Skills verification
- [ ] Gig platform integration
- [ ] Client simulation
- [ ] Earnings tracker

### Phase 3: Community
- [ ] Peer review system
- [ ] Mentor matching
- [ ] Success stories
- [ ] Job board

### Phase 4: Scale
- [ ] AI assistance
- [ ] Advanced analytics
- [ ] Corporate partnerships
- [ ] International expansion

## 💡 Philosophy

> "If it doesn't help someone win their first gig faster, it doesn't belong in PlanA."

Every feature, every word, every design choice serves one mission: **Launch Nigerian tech talent into the global gig economy.**

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- UI by [shadcn/ui](https://ui.shadcn.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## 📞 Contact

For questions or support, check the documentation files or open an issue.

---

**Built for the Nigerian gig economy 🇳🇬**

**Get gig-ready. Build real projects. Start earning. 🚀**
