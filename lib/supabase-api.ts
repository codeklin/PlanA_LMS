import { supabaseClient } from './supabase/client';
import type { Database } from './supabase/client';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Cohort = Database['public']['Tables']['cohorts']['Row'];
type Course = Database['public']['Tables']['courses']['Row'];
type LearnerProgress = Database['public']['Tables']['learner_progress']['Row'];
type Submission = Database['public']['Tables']['submissions']['Row'];

export interface AuthResponse {
  user: Profile;
  session: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
  role?: 'learner' | 'instructor' | 'admin' | 'super-admin';
}

class SupabaseAPIClient {
  // Auth methods
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { email, password, firstName, lastName, role = 'learner' } = credentials;

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    // 2. Wait a moment for auth to propagate
    await new Promise(resolve => setTimeout(resolve, 500));

    // 3. Create profile (will be created by database trigger or manually)
    try {
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          role,
        })
        .select()
        .single();

      if (profileError) {
        console.warn('Profile creation warning:', profileError);
        // If profile creation fails, return user data from auth
        return {
          user: {
            id: authData.user.id,
            email: authData.user.email || email,
            first_name: firstName,
            last_name: lastName,
            role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any,
          session: authData.session,
        };
      }

      return {
        user: profile,
        session: authData.session,
      };
    } catch (error) {
      console.error('Profile creation error:', error);
      // Return auth user data even if profile creation fails
      return {
        user: {
          id: authData.user.id,
          email: authData.user.email || email,
          first_name: firstName,
          last_name: lastName,
          role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any,
        session: authData.session,
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Login failed');

    // Fetch profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) throw profileError;

    return {
      user: profile,
      session: authData.session,
    };
  }

  async logout() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
  }

  async getMe(): Promise<Profile> {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return profile;
  }

  async updateProfile(id: string, updates: Partial<Profile>) {
    const { data, error } = await supabaseClient
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Cohort methods
  async getCohorts(): Promise<Cohort[]> {
    const { data, error } = await supabaseClient
      .from('cohorts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getCohort(id: string): Promise<Cohort> {
    const { data, error } = await supabaseClient
      .from('cohorts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createCohort(cohort: Partial<Cohort>): Promise<Cohort> {
    const { data, error } = await supabaseClient
      .from('cohorts')
      .insert(cohort)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCohort(id: string, updates: Partial<Cohort>): Promise<Cohort> {
    const { data, error } = await supabaseClient
      .from('cohorts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCohort(id: string) {
    const { error } = await supabaseClient
      .from('cohorts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Course methods
  async getCourses(): Promise<Course[]> {
    const { data, error } = await supabaseClient
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getCourse(id: string): Promise<Course> {
    const { data, error } = await supabaseClient
      .from('courses')
      .select(`
        *,
        modules:modules(
          *,
          lessons:lessons(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createCourse(course: Partial<Course>): Promise<Course> {
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    const { data, error } = await supabaseClient
      .from('courses')
      .insert({ ...course, created_by: user?.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
    const { data, error } = await supabaseClient
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Learner Progress methods
  async getLearnerProgress(learnerId: string): Promise<LearnerProgress[]> {
    const { data, error } = await supabaseClient
      .from('learner_progress')
      .select('*')
      .eq('learner_id', learnerId);

    if (error) throw error;
    return data;
  }

  async updateLearnerProgress(id: string, updates: Partial<LearnerProgress>) {
    const { data, error } = await supabaseClient
      .from('learner_progress')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Submission methods
  async getSubmissions(cohortId: string): Promise<Submission[]> {
    const { data, error } = await supabaseClient
      .from('submissions')
      .select('*')
      .eq('cohort_id', cohortId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getMySubmissions(learnerId: string): Promise<Submission[]> {
    const { data, error } = await supabaseClient
      .from('submissions')
      .select('*')
      .eq('learner_id', learnerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createSubmission(submission: Partial<Submission>): Promise<Submission> {
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    const { data, error } = await supabaseClient
      .from('submissions')
      .insert({ ...submission, learner_id: user?.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSubmission(id: string, updates: Partial<Submission>): Promise<Submission> {
    const { data, error } = await supabaseClient
      .from('submissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // File upload methods
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { path: data.path, url: publicUrl };
  }

  async deleteFile(bucket: string, path: string) {
    const { error } = await supabaseClient.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  }

  // Enrollment methods
  async enrollInCohort(cohortId: string) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    const { data, error } = await supabaseClient
      .from('cohort_enrollments')
      .insert({
        cohort_id: cohortId,
        learner_id: user?.id,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMyEnrollments() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    const { data, error } = await supabaseClient
      .from('cohort_enrollments')
      .select(`
        *,
        cohort:cohorts(*)
      `)
      .eq('learner_id', user?.id);

    if (error) throw error;
    return data;
  }

  // Real-time subscriptions
  subscribeToProgress(learnerId: string, callback: (payload: any) => void) {
    return supabaseClient
      .channel('learner-progress')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'learner_progress',
          filter: `learner_id=eq.${learnerId}`,
        },
        callback
      )
      .subscribe();
  }

  subscribeToSubmissions(cohortId: string, callback: (payload: any) => void) {
    return supabaseClient
      .channel('submissions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'submissions',
          filter: `cohort_id=eq.${cohortId}`,
        },
        callback
      )
      .subscribe();
  }
}

export const supabaseApi = new SupabaseAPIClient();
