# PlanA LMS Implementation Guide

## Overview
Transform DexterHub LMS into a high-speed, zero-theory, project-based learning platform for the Nigerian gig economy with Supabase backend and orange/blue theme.

## Phase 1: Supabase Setup & Migration

### 1.1 Install Supabase Dependencies
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### 1.2 Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Note your project URL and anon key
4. Enable Row Level Security (RLS) on all tables

### 1.3 Database Schema Migration
Create these tables in Supabase SQL Editor:

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('learner', 'instructor', 'admin', 'super-admin')) DEFAULT 'learner',
  active_cohort_id UUID,
  phone_number TEXT,
  location TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  portfolio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cohorts table
CREATE TABLE public.cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('upcoming', 'active', 'completed', 'archived')) DEFAULT 'upcoming',
  performance_threshold INTEGER DEFAULT 70,
  weekly_target INTEGER DEFAULT 20,
  grace_period_days INTEGER DEFAULT 7,
  review_cycle_frequency TEXT DEFAULT 'weekly',
  max_learners INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table (Project-based)
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- e.g., 'Web Development', 'Digital Marketing', 'Graphic Design'
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_hours INTEGER,
  project_brief TEXT, -- Main project description
  deliverables JSONB DEFAULT '[]'::jsonb, -- Expected outputs
  skills_gained JSONB DEFAULT '[]'::jsonb,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules (Project Milestones)
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  milestone_description TEXT, -- What learner should achieve
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons (Action Steps)
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB, -- Rich content with videos, resources
  lesson_type TEXT CHECK (lesson_type IN ('video', 'reading', 'task', 'quiz', 'project')),
  order_index INTEGER NOT NULL,
  estimated_minutes INTEGER,
  resources JSONB DEFAULT '[]'::jsonb, -- Links, files, tools
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learner Progress
CREATE TABLE public.learner_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  completed_lessons UUID[] DEFAULT ARRAY[]::UUID[],
  current_score INTEGER DEFAULT 0,
  learning_hours_this_week INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('on-track', 'at-risk', 'under-review', 'dropped')) DEFAULT 'on-track',
  last_activity_date TIMESTAMPTZ DEFAULT NOW(),
  inactivity_days INTEGER DEFAULT 0,
  last_assessment_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(learner_id, cohort_id, course_id)
);

-- Submissions (Project Work)
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE,
  content TEXT,
  file_urls JSONB DEFAULT '[]'::jsonb, -- Supabase Storage URLs
  status TEXT CHECK (status IN ('draft', 'submitted', 'graded', 'revision-needed')) DEFAULT 'draft',
  grade INTEGER,
  feedback TEXT,
  graded_by UUID REFERENCES public.profiles(id),
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events (Deadlines, Sessions)
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  duration TEXT,
  event_type TEXT CHECK (event_type IN ('deadline', 'session', 'review', 'demo-day')),
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE,
  meeting_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cohort Enrollments
CREATE TABLE public.cohort_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE,
  learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES public.profiles(id),
  status TEXT CHECK (status IN ('pending', 'active', 'completed', 'dropped')) DEFAULT 'pending',
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(cohort_id, learner_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Basic - expand as needed)
-- Profiles: Users can read all, update own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Courses: Everyone can read published courses
CREATE POLICY "Published courses are viewable" ON public.courses FOR SELECT USING (is_published = true OR created_by = auth.uid());

-- Learner Progress: Users can view own progress
CREATE POLICY "Users can view own progress" ON public.learner_progress FOR SELECT USING (learner_id = auth.uid());

-- Submissions: Users can view/create own submissions
CREATE POLICY "Users can view own submissions" ON public.submissions FOR SELECT USING (learner_id = auth.uid());
CREATE POLICY "Users can create own submissions" ON public.submissions FOR INSERT WITH CHECK (learner_id = auth.uid());
```

### 1.4 Storage Buckets
Create these buckets in Supabase Storage:
- `course-materials` - Course videos, PDFs, resources
- `submissions` - Learner project files
- `profiles` - Profile pictures
- `certificates` - Generated certificates

## Phase 2: Theme Customization (Orange & Blue)

### 2.1 Update Color Scheme
Replace `app/globals.css` with PlanA colors:

```css
:root {
  /* PlanA Orange & Blue Theme */
  --plana-orange: 25 95% 53%; /* Primary Orange */
  --plana-blue: 217 91% 60%; /* Primary Blue */
  --plana-orange-light: 25 95% 65%;
  --plana-blue-light: 217 91% 75%;
  --plana-orange-dark: 25 95% 43%;
  --plana-blue-dark: 217 91% 45%;
  
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  
  --primary: var(--plana-orange);
  --primary-foreground: 0 0% 100%;
  
  --secondary: var(--plana-blue);
  --secondary-foreground: 0 0% 100%;
  
  --accent: var(--plana-orange-light);
  --accent-foreground: 0 0% 100%;
  
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  
  --border: 214 32% 91%;
  --input: 214 32% 91%;
  --ring: var(--plana-orange);
}

.dark {
  --background: 222 47% 11%;
  --foreground: 210 40% 98%;
  
  --primary: var(--plana-orange-light);
  --primary-foreground: 222 47% 11%;
  
  --secondary: var(--plana-blue-light);
  --secondary-foreground: 222 47% 11%;
  
  --muted: 217 33% 17%;
  --muted-foreground: 215 20% 65%;
  
  --card: 222 47% 11%;
  --card-foreground: 210 40% 98%;
  
  --border: 217 33% 17%;
  --input: 217 33% 17%;
}
```

## Phase 3: Core Feature Updates

### 3.1 PlanA Philosophy Integration

#### Key Principles:
1. **Zero Theory** - Every lesson leads to building something
2. **High-Speed** - 4-12 week intensive cohorts
3. **Project-Based** - Real portfolio pieces, not exercises
4. **Gig Economy Focus** - Skills for Upwork, Fiverr, Toptal
5. **Nigerian Context** - Local payment methods, data-friendly

#### Content Structure:
```
Course → Project Brief
  ├── Module 1: Setup & Foundation (Week 1)
  │   ├── Lesson: Tool Setup (30 min)
  │   ├── Task: Build Component 1
  │   └── Milestone: Working Prototype
  ├── Module 2: Core Features (Week 2-3)
  │   ├── Task: Feature Implementation
  │   └── Milestone: MVP Complete
  └── Module 3: Polish & Deploy (Week 4)
      ├── Task: Final Touches
      └── Deliverable: Live Project + Case Study
```

### 3.2 New Features to Add

1. **Project Showcase** - Portfolio page for learners
2. **Gig Marketplace Integration** - Connect to Upwork API
3. **Peer Review System** - Learners review each other's work
4. **Speed Metrics** - Track completion velocity
5. **Skills Verification** - Badge system for completed projects
6. **Mobile-First Video Player** - Data-efficient streaming
7. **Offline Mode** - Download lessons for offline access
8. **Payment Integration** - Paystack/Flutterwave for Nigerian users

## Phase 4: Implementation Steps

### Step 1: Environment Setup
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 2: Create Supabase Client
Create `lib/supabase.ts`

### Step 3: Update Auth Context
Migrate `lib/auth-context.tsx` to use Supabase Auth

### Step 4: Update API Client
Migrate `lib/api.ts` to use Supabase client

### Step 5: Update UI Components
- Apply orange/blue theme to all components
- Add PlanA branding
- Update dashboard layouts for project-focus

### Step 6: Create New Pages
- Project showcase
- Skill verification
- Gig marketplace integration
- Mobile-optimized video player

## Phase 5: Testing & Deployment

### Testing Checklist:
- [ ] Authentication flow
- [ ] Course enrollment
- [ ] Project submission
- [ ] File uploads to Supabase Storage
- [ ] Real-time updates
- [ ] Mobile responsiveness
- [ ] Offline functionality

### Deployment:
1. Deploy to Vercel (automatic with Next.js)
2. Configure Supabase production settings
3. Set up custom domain
4. Enable CDN for media files
5. Configure email templates in Supabase

## Next Steps

Would you like me to:
1. Start with Supabase setup and migration?
2. Implement the orange/blue theme first?
3. Create the new Supabase client and auth system?
4. Build specific PlanA features?

Let me know which phase you'd like to tackle first!
