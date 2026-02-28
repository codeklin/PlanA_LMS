'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/lib/supabase-auth-context';
import { supabaseApi } from '@/lib/supabase-api';
import { TopHeader } from '@/components/top-header';
import { CourseCard } from '@/components/course-card';
import { Button } from '@/components/ui/button';
import { BookOpen, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function CoursesPage() {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await supabaseApi.getCourses();
        setCourses(data);
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <TopHeader user={user ? { name: `${user.first_name} ${user.last_name}`, email: user.email } : undefined} />
      
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Projects</h1>
            <p className="text-slate-500 mt-2">Build real projects. Get gig-ready.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search projects..." 
              className="pl-10 w-64"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div 
                key={course.id} 
                onClick={() => router.push(`/dashboard/courses/${course.id}`)}
                className="cursor-pointer"
              >
                <CourseCard
                  title={course.title}
                  subtitle={course.description?.substring(0, 100) + '...'}
                  icon="🚀"
                  progress={0}
                  duration={`${course.estimated_hours || 0}h`}
                  instructor="PlanA Mentor"
                  color="orange"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Projects Yet</h3>
            <p className="text-slate-500 mb-6">Enroll in a cohort to start building your portfolio</p>
            <Button onClick={() => router.push('/dashboard')}>
              Browse Cohorts
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
