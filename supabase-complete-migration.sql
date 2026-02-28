-- ============================================
-- PlanA LMS - Complete Supabase Migration
-- Based on existing MongoDB backend
-- ============================================
-- This schema includes ALL features from your current backend:
-- - Users (learners, instructors, admins)
-- - Cohorts with enrollment management
-- - Courses with modules and lessons
-- - Tasks and assignments
-- - Submissions and grading
-- - Progress tracking
-- - Events and calendar
-- - Instructor notes
-- - Drop recommendations and appeals
-- - Grace periods
-- - Audit logs
-- - Enrollment requests
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Users/Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('learner', 'instructor', 'admin', 'super-admin')) DEFAULT 'learner',
  status TEXT CHECK (status IN ('active', 'inactive', 'dropped')) DEFAULT 'active',
  active_cohort_id UUID,
  avatar_url TEXT,
  phone_number TEXT,
  location TEXT,
  bio TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  portfolio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cohorts table
CREATE TABLE IF NOT EXISTS public.cohorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('upcoming', 'active', 'completed', 'archived')) DEFAULT 'upcoming',
  performance_threshold INTEGER DEFAULT 70,
  weekly_target INTEGER DEFAULT 10,
  grace_period_days INTEGER DEFAULT 3,
  review_cycle_frequency TEXT CHECK (review_cycle_frequency IN ('weekly', 'bi-weekly', 'monthly')) DEFAULT 'weekly',
  max_learners INTEGER DEFAULT 30,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER, -- in hours
  icon TEXT DEFAULT '📚',
  color TEXT DEFAULT 'lavender',
  learner_status TEXT DEFAULT 'available',
  instructor_id UUID REFERENCES public.profiles(id),
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_hours INTEGER,
  project_brief TEXT,
  deliverables JSONB DEFAULT '[]'::jsonb,
  skills_gained JSONB DEFAULT '[]'::jsonb,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules table
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  duration INTEGER, -- in minutes
  milestone_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  order_index INTEGER NOT NULL,
  lesson_type TEXT CHECK (lesson_type IN ('video', 'reading', 'task', 'quiz', 'project')) DEFAULT 'task',
  estimated_minutes INTEGER,
  resources JSONB DEFAULT '[]'::jsonb,
  -- Assignment/Quiz data
  assignment JSONB, -- {title, description, type, questions, maxScore}
  max_score INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENROLLMENT & PROGRESS TABLES
-- ============================================

-- Cohort Enrollments (many-to-many: cohorts <-> learners)
CREATE TABLE IF NOT EXISTS public.cohort_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  instructor_id UUID REFERENCES public.profiles(id),
  status TEXT CHECK (status IN ('pending', 'active', 'completed', 'dropped')) DEFAULT 'pending',
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(cohort_id, learner_id)
);

-- Cohort Instructors (many-to-many: cohorts <-> instructors)
CREATE TABLE IF NOT EXISTS public.cohort_instructors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cohort_id, instructor_id)
);

-- Cohort Courses (many-to-many: cohorts <-> courses)
CREATE TABLE IF NOT EXISTS public.cohort_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cohort_id, course_id)
);

-- Course Registrations (learners interested in courses)
CREATE TABLE IF NOT EXISTS public.course_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, learner_id)
);

-- Enrollment Requests
CREATE TABLE IF NOT EXISTS public.enrollment_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learner Progress
CREATE TABLE IF NOT EXISTS public.learner_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  completed_lessons UUID[] DEFAULT ARRAY[]::UUID[],
  module_progress JSONB DEFAULT '[]'::jsonb, -- [{moduleId, scores, averageScore, isGraduated}]
  current_score INTEGER DEFAULT 0,
  learning_hours_this_week INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('on-track', 'at-risk', 'under-review', 'dropped', 'failed')) DEFAULT 'on-track',
  last_activity_date TIMESTAMPTZ DEFAULT NOW(),
  inactivity_days INTEGER DEFAULT 0,
  last_assessment_date TIMESTAMPTZ,
  last_assessment_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(learner_id, cohort_id, course_id)
);

-- ============================================
-- TASKS & SUBMISSIONS
-- ============================================

-- Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT CHECK (task_type IN ('assignment', 'quiz', 'video', 'task', 'exam', 'project')) DEFAULT 'task',
  status TEXT CHECK (status IN ('pending', 'in-progress', 'completed', 'overdue')) DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE,
  related_id UUID, -- ID of lesson, event, submission etc.
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL, -- URL or text content
  file_urls JSONB DEFAULT '[]'::jsonb,
  grade INTEGER,
  feedback TEXT,
  status TEXT CHECK (status IN ('pending', 'graded', 'revision-needed')) DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  graded_at TIMESTAMPTZ,
  graded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EVENTS & CALENDAR
-- ============================================

-- Events
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  duration TEXT, -- e.g., "45 Minutes", "2 Hours"
  event_type TEXT CHECK (event_type IN ('exam', 'assignment', 'test', 'lecture', 'deadline', 'session', 'review', 'demo-day')) DEFAULT 'assignment',
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  icon TEXT DEFAULT '📝',
  meeting_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INSTRUCTOR & ADMIN FEATURES
-- ============================================

-- Instructor Notes
CREATE TABLE IF NOT EXISTS public.instructor_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  note TEXT NOT NULL,
  note_type TEXT CHECK (note_type IN ('mentoring', 'warning', 'recommendation', 'general', 'observation', 'concern', 'praise', 'intervention')) DEFAULT 'general',
  action_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop Recommendations
CREATE TABLE IF NOT EXISTS public.drop_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  evidence TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'appealed')) DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT
);

-- Appeals
CREATE TABLE IF NOT EXISTS public.appeals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  drop_recommendation_id UUID REFERENCES public.drop_recommendations(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT
);

-- Grace Periods
CREATE TABLE IF NOT EXISTS public.grace_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  granted_by UUID REFERENCES public.profiles(id) NOT NULL,
  reason TEXT,
  extension_days INTEGER DEFAULT 3,
  original_deadline TIMESTAMPTZ,
  new_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_user UUID REFERENCES public.profiles(id),
  target_cohort UUID REFERENCES public.cohorts(id),
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_active_cohort ON public.profiles(active_cohort_id);

CREATE INDEX IF NOT EXISTS idx_cohorts_status ON public.cohorts(status);
CREATE INDEX IF NOT EXISTS idx_cohorts_dates ON public.cohorts(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);

CREATE INDEX IF NOT EXISTS idx_modules_course ON public.modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON public.lessons(module_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_cohort ON public.cohort_enrollments(cohort_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_learner ON public.cohort_enrollments(learner_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.cohort_enrollments(status);

CREATE INDEX IF NOT EXISTS idx_progress_learner ON public.learner_progress(learner_id);
CREATE INDEX IF NOT EXISTS idx_progress_cohort ON public.learner_progress(cohort_id);
CREATE INDEX IF NOT EXISTS idx_progress_course ON public.learner_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_progress_status ON public.learner_progress(status);

CREATE INDEX IF NOT EXISTS idx_tasks_learner ON public.tasks(learner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_cohort ON public.tasks(cohort_id);

CREATE INDEX IF NOT EXISTS idx_submissions_learner ON public.submissions(learner_id);
CREATE INDEX IF NOT EXISTS idx_submissions_lesson ON public.submissions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_cohort ON public.submissions(cohort_id);

CREATE INDEX IF NOT EXISTS idx_events_cohort ON public.events(cohort_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(event_type);

CREATE INDEX IF NOT EXISTS idx_notes_instructor ON public.instructor_notes(instructor_id);
CREATE INDEX IF NOT EXISTS idx_notes_learner ON public.instructor_notes(learner_id);
CREATE INDEX IF NOT EXISTS idx_notes_cohort ON public.instructor_notes(cohort_id);

CREATE INDEX IF NOT EXISTS idx_drop_recs_status ON public.drop_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_drop_recs_learner ON public.drop_recommendations(learner_id);

CREATE INDEX IF NOT EXISTS idx_appeals_status ON public.appeals(status);
CREATE INDEX IF NOT EXISTS idx_appeals_learner ON public.appeals(learner_id);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_logs(actor);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drop_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grace_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Cohorts Policies
CREATE POLICY "Cohorts are viewable by everyone" 
  ON public.cohorts FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage cohorts" 
  ON public.cohorts FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
    )
  );

-- Courses Policies
CREATE POLICY "Published courses are viewable" 
  ON public.courses FOR SELECT 
  USING (
    is_published = true 
    OR created_by = auth.uid()
    OR instructor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
    )
  );

CREATE POLICY "Instructors and admins can create courses" 
  ON public.courses FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('instructor', 'admin', 'super-admin')
    )
  );

CREATE POLICY "Course creators can update their courses" 
  ON public.courses FOR UPDATE 
  USING (
    created_by = auth.uid() 
    OR instructor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
    )
  );

-- Modules Policies
CREATE POLICY "Modules viewable with courses" 
  ON public.modules FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id AND (
        is_published = true 
        OR created_by = auth.uid()
        OR instructor_id = auth.uid()
      )
    )
  );

CREATE POLICY "Course owners can manage modules" 
  ON public.modules FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id AND (
        created_by = auth.uid() 
        OR instructor_id = auth.uid()
      )
    )
  );

-- Lessons Policies
CREATE POLICY "Lessons viewable with modules" 
  ON public.lessons FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE m.id = module_id AND (
        c.is_published = true 
        OR c.created_by = auth.uid()
        OR c.instructor_id = auth.uid()
      )
    )
  );

CREATE POLICY "Course owners can manage lessons" 
  ON public.lessons FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE m.id = module_id AND (
        c.created_by = auth.uid() 
        OR c.instructor_id = auth.uid()
      )
    )
  );

-- Enrollment Policies
CREATE POLICY "Users can view own enrollments" 
  ON public.cohort_enrollments FOR SELECT 
  USING (
    learner_id = auth.uid() 
    OR instructor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
    )
  );

CREATE POLICY "Learners can enroll themselves" 
  ON public.cohort_enrollments FOR INSERT 
  WITH CHECK (learner_id = auth.uid());

CREATE POLICY "Admins and instructors can manage enrollments" 
  ON public.cohort_enrollments FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('instructor', 'admin', 'super-admin')
    )
  );

-- Progress Policies
CREATE POLICY "Users can view own progress" 
  ON public.learner_progress FOR SELECT 
  USING (
    learner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.cohort_instructors 
      WHERE cohort_id = learner_progress.cohort_id AND instructor_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
    )
  );

CREATE POLICY "Users can update own progress" 
  ON public.learner_progress FOR UPDATE 
  USING (learner_id = auth.uid());

CREATE POLICY "Users can insert own progress" 
  ON public.learner_progress FOR INSERT 
  WITH CHECK (learner_id = auth.uid());

-- Tasks Policies
CREATE POLICY "Users can view own tasks" 
  ON public.tasks FOR SELECT 
  USING (
    learner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.cohort_instructors 
      WHERE cohort_id = tasks.cohort_id AND instructor_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own tasks" 
  ON public.tasks FOR ALL 
  USING (learner_id = auth.uid());

-- Submissions Policies
CREATE POLICY "Users can view own submissions" 
  ON public.submissions FOR SELECT 
  USING (
    learner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.cohort_instructors 
      WHERE cohort_id = submissions.cohort_id AND instructor_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
    )
  );

CREATE POLICY "Learners can create own submissions" 
  ON public.submissions FOR INSERT 
  WITH CHECK (learner_id = auth.uid());

CREATE POLICY "Learners can update own submissions" 
  ON public.submissions FOR UPDATE 
  USING (learner_id = auth.uid() AND status = 'pending');

CREATE POLICY "Instructors can grade submissions" 
  ON public.submissions FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.cohort_instructors 
      WHERE cohort_id = submissions.cohort_id AND instructor_id = auth.uid()
    )
  );

-- Events Policies
CREATE POLICY "Enrolled users can view cohort events" 
  ON public.events FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.cohort_enrollments 
      WHERE cohort_id = events.cohort_id AND learner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.cohort_instructors 
      WHERE cohort_id = events.cohort_id AND instructor_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
    )
  );

CREATE POLICY "Instructors and admins can manage events" 
  ON public.events FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.cohort_instructors 
      WHERE cohort_id = events.cohort_id AND instructor_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
    )
  );

-- Instructor Notes Policies
CREATE POLICY "Instructors can view own notes" 
  ON public.instructor_notes FOR SELECT 
  USING (
    instructor_id = auth.uid()
    OR learner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
    )
  );

CREATE POLICY "Instructors can create notes" 
  ON public.instructor_notes FOR INSERT 
  WITH CHECK (
    instructor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('instructor', 'admin', 'super-admin')
    )
  );

-- Drop Recommendations Policies
CREATE POLICY "Relevant users can view drop recommendations" 
  ON public.drop_recommendations FOR SELECT 
  USING (
    learner_id = auth.uid()
    OR instructor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
    )
  );

CREATE POLICY "Instructors can create drop recommendations" 
  ON public.drop_recommendations FOR INSERT 
  WITH CHECK (
    instructor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('instructor', 'admin', 'super-admin')
    )
  );

CREATE POLICY "Admins can update drop recommendations" 
  ON public.drop_recommendations FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
    )
  );

-- Appeals Policies
CREATE POLICY "Relevant users can view appeals" 
  ON public.appeals FOR SELECT 
  USING (
    learner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
    )
  );

CREATE POLICY "Learners can create appeals" 
  ON public.appeals FOR INSERT 
  WITH CHECK (learner_id = auth.uid());

CREATE POLICY "Admins can update appeals" 
  ON public.appeals FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
    )
  );

-- Grace Periods Policies
CREATE POLICY "Relevant users can view grace periods" 
  ON public.grace_periods FOR SELECT 
  USING (
    learner_id = auth.uid()
    OR granted_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
    )
  );

CREATE POLICY "Admins can grant grace periods" 
  ON public.grace_periods FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
    )
  );

-- Audit Logs Policies (Super Admin only)
CREATE POLICY "Super admins can view audit logs" 
  ON public.audit_logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super-admin'
    )
  );

CREATE POLICY "System can create audit logs" 
  ON public.audit_logs FOR INSERT 
  WITH CHECK (true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'firstName'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', NEW.raw_user_meta_data->>'lastName'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'learner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.cohorts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.learner_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to create audit log
CREATE OR REPLACE FUNCTION public.create_audit_log(
  p_action TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_target_user UUID DEFAULT NULL,
  p_target_cohort UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    actor,
    action,
    entity_type,
    entity_id,
    target_user,
    target_cohort,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_target_user,
    p_target_cohort,
    p_details
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate learner progress percentage
CREATE OR REPLACE FUNCTION public.calculate_progress_percentage(
  p_learner_id UUID,
  p_course_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_total_lessons INTEGER;
  v_completed_lessons INTEGER;
  v_percentage INTEGER;
BEGIN
  -- Count total lessons in course
  SELECT COUNT(l.id) INTO v_total_lessons
  FROM public.lessons l
  JOIN public.modules m ON m.id = l.module_id
  WHERE m.course_id = p_course_id;
  
  -- Count completed lessons
  SELECT array_length(completed_lessons, 1) INTO v_completed_lessons
  FROM public.learner_progress
  WHERE learner_id = p_learner_id AND course_id = p_course_id;
  
  -- Calculate percentage
  IF v_total_lessons > 0 THEN
    v_percentage := (COALESCE(v_completed_lessons, 0) * 100) / v_total_lessons;
  ELSE
    v_percentage := 0;
  END IF;
  
  RETURN v_percentage;
END;
$$ LANGUAGE plpgsql;

-- Function to check if learner is at risk
CREATE OR REPLACE FUNCTION public.check_learner_at_risk(
  p_learner_id UUID,
  p_cohort_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_inactivity_days INTEGER;
  v_current_score INTEGER;
  v_threshold INTEGER;
  v_is_at_risk BOOLEAN := false;
BEGIN
  -- Get learner progress data
  SELECT 
    lp.inactivity_days,
    lp.current_score,
    c.performance_threshold
  INTO 
    v_inactivity_days,
    v_current_score,
    v_threshold
  FROM public.learner_progress lp
  JOIN public.cohorts c ON c.id = lp.cohort_id
  WHERE lp.learner_id = p_learner_id 
    AND lp.cohort_id = p_cohort_id
  LIMIT 1;
  
  -- Check risk conditions
  IF v_inactivity_days > 7 OR v_current_score < v_threshold THEN
    v_is_at_risk := true;
  END IF;
  
  RETURN v_is_at_risk;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Cohort with enrollment counts
CREATE OR REPLACE VIEW public.cohort_stats AS
SELECT 
  c.*,
  COUNT(DISTINCT ce.learner_id) FILTER (WHERE ce.status = 'active') as active_learners,
  COUNT(DISTINCT ci.instructor_id) as instructor_count,
  COUNT(DISTINCT cc.course_id) as course_count
FROM public.cohorts c
LEFT JOIN public.cohort_enrollments ce ON ce.cohort_id = c.id
LEFT JOIN public.cohort_instructors ci ON ci.cohort_id = c.id
LEFT JOIN public.cohort_courses cc ON cc.cohort_id = c.id
GROUP BY c.id;

-- View: Course with module and lesson counts
CREATE OR REPLACE VIEW public.course_stats AS
SELECT 
  c.*,
  COUNT(DISTINCT m.id) as module_count,
  COUNT(DISTINCT l.id) as lesson_count,
  SUM(l.estimated_minutes) as total_minutes
FROM public.courses c
LEFT JOIN public.modules m ON m.course_id = c.id
LEFT JOIN public.lessons l ON l.module_id = m.id
GROUP BY c.id;

-- View: Learner dashboard data
CREATE OR REPLACE VIEW public.learner_dashboard AS
SELECT 
  p.id as learner_id,
  p.first_name,
  p.last_name,
  p.email,
  ce.cohort_id,
  c.name as cohort_name,
  lp.status,
  lp.current_score,
  lp.learning_hours_this_week,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'pending') as pending_tasks,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'pending') as pending_submissions
FROM public.profiles p
LEFT JOIN public.cohort_enrollments ce ON ce.learner_id = p.id AND ce.status = 'active'
LEFT JOIN public.cohorts c ON c.id = ce.cohort_id
LEFT JOIN public.learner_progress lp ON lp.learner_id = p.id AND lp.cohort_id = ce.cohort_id
LEFT JOIN public.tasks t ON t.learner_id = p.id
LEFT JOIN public.submissions s ON s.learner_id = p.id
WHERE p.role = 'learner'
GROUP BY p.id, ce.cohort_id, c.name, lp.status, lp.current_score, lp.learning_hours_this_week;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment to insert sample data

/*
-- Sample Admin User (create via Supabase Auth first, then update role)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@plana.ng';

-- Sample Cohort
INSERT INTO public.cohorts (name, description, start_date, end_date, status)
VALUES (
  'Web Development Cohort 2026',
  'Learn to build modern web applications',
  NOW(),
  NOW() + INTERVAL '12 weeks',
  'active'
);

-- Sample Course
INSERT INTO public.courses (name, description, duration, category, difficulty, is_published)
VALUES (
  'Build a Landing Page in 7 Days',
  'Create a professional landing page for Nigerian businesses',
  7,
  'Web Development',
  'beginner',
  true
);
*/

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'PlanA LMS Complete Database Schema Created!';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables Created:';
  RAISE NOTICE '  ✓ profiles (users)';
  RAISE NOTICE '  ✓ cohorts';
  RAISE NOTICE '  ✓ courses, modules, lessons';
  RAISE NOTICE '  ✓ cohort_enrollments, cohort_instructors, cohort_courses';
  RAISE NOTICE '  ✓ course_registrations, enrollment_requests';
  RAISE NOTICE '  ✓ learner_progress';
  RAISE NOTICE '  ✓ tasks, submissions';
  RAISE NOTICE '  ✓ events';
  RAISE NOTICE '  ✓ instructor_notes';
  RAISE NOTICE '  ✓ drop_recommendations, appeals';
  RAISE NOTICE '  ✓ grace_periods';
  RAISE NOTICE '  ✓ audit_logs';
  RAISE NOTICE '';
  RAISE NOTICE 'Features Included:';
  RAISE NOTICE '  ✓ Row Level Security (RLS) enabled';
  RAISE NOTICE '  ✓ Indexes for performance';
  RAISE NOTICE '  ✓ Triggers for auto-updates';
  RAISE NOTICE '  ✓ Helper functions';
  RAISE NOTICE '  ✓ Dashboard views';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Create storage buckets:';
  RAISE NOTICE '     - course-materials (public)';
  RAISE NOTICE '     - submissions (private)';
  RAISE NOTICE '     - profiles (public)';
  RAISE NOTICE '     - certificates (public)';
  RAISE NOTICE '  2. Configure storage policies';
  RAISE NOTICE '  3. Test authentication flow';
  RAISE NOTICE '  4. Create your first admin user';
  RAISE NOTICE '  5. Start building!';
  RAISE NOTICE '';
  RAISE NOTICE 'Happy coding! 🚀🇳🇬';
  RAISE NOTICE '============================================';
END $$;
