import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client for use in React components
export const supabase = createClientComponentClient();

// Alternative: Direct client (use when auth-helpers not needed)
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Database types (will be auto-generated later with: npx supabase gen types typescript)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          role: 'learner' | 'instructor' | 'admin' | 'super-admin';
          active_cohort_id: string | null;
          phone_number: string | null;
          location: string | null;
          skills: any;
          portfolio_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          role?: 'learner' | 'instructor' | 'admin' | 'super-admin';
          active_cohort_id?: string | null;
          phone_number?: string | null;
          location?: string | null;
          skills?: any;
          portfolio_url?: string | null;
        };
        Update: {
          first_name?: string | null;
          last_name?: string | null;
          role?: 'learner' | 'instructor' | 'admin' | 'super-admin';
          active_cohort_id?: string | null;
          phone_number?: string | null;
          location?: string | null;
          skills?: any;
          portfolio_url?: string | null;
        };
      };
      cohorts: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          start_date: string;
          end_date: string;
          status: 'upcoming' | 'active' | 'completed' | 'archived';
          performance_threshold: number;
          weekly_target: number;
          grace_period_days: number;
          review_cycle_frequency: string;
          max_learners: number;
          created_at: string;
          updated_at: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string | null;
          difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
          estimated_hours: number | null;
          project_brief: string | null;
          deliverables: any;
          skills_gained: any;
          thumbnail_url: string | null;
          is_published: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      learner_progress: {
        Row: {
          id: string;
          learner_id: string;
          cohort_id: string;
          course_id: string;
          completed_lessons: string[];
          current_score: number;
          learning_hours_this_week: number;
          status: 'on-track' | 'at-risk' | 'under-review' | 'dropped';
          last_activity_date: string;
          inactivity_days: number;
          last_assessment_score: number | null;
          created_at: string;
          updated_at: string;
        };
      };
      submissions: {
        Row: {
          id: string;
          learner_id: string;
          lesson_id: string;
          cohort_id: string;
          content: string | null;
          file_urls: any;
          status: 'draft' | 'submitted' | 'graded' | 'revision-needed';
          grade: number | null;
          feedback: string | null;
          graded_by: string | null;
          submitted_at: string | null;
          graded_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
