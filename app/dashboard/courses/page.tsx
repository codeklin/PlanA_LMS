'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/lib/supabase-auth-context';
import { supabaseApi } from '@/lib/supabase-api';
import { TopHeader } from '@/components/top-header';
import { CourseCard } from '@/components/course-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, Plus, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function CoursesPage() {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const isInstructorOrAdmin = user?.role === 'instructor' || user?.role === 'admin' || user?.role === 'super-admin';

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const data = await supabaseApi.getCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      course.name?.toLowerCase().includes(query) ||
      course.description?.toLowerCase().includes(query) ||
      course.category?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <TopHeader user={user ? { name: `${user.first_name} ${user.last_name}`, email: user.email } : undefined} />
      
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isInstructorOrAdmin ? 'Course Library' : 'Your Projects'}
            </h1>
            <p className="text-slate-500 mt-2">
              {isInstructorOrAdmin ? 'Manage and create courses for your cohorts' : 'Build real projects. Get gig-ready.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search courses..." 
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isInstructorOrAdmin && (
              <Button 
                onClick={() => router.push('/instructor/courses/new')}
                className="rounded-xl font-semibold" 
                style={{ backgroundColor: '#FF6B35' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="relative group">
                <div 
                  onClick={() => router.push(`/dashboard/courses/${course.id}`)}
                  className="cursor-pointer"
                >
                  <CourseCard
                    title={course.name}
                    subtitle={course.description?.substring(0, 100) + '...'}
                    icon={course.icon || '🚀'}
                    progress={0}
                    duration={`${course.estimated_hours || 0}h`}
                    instructor="PlanA Mentor"
                    color="orange"
                  />
                </div>
                {isInstructorOrAdmin && (
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Badge className={course.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/instructor/courses/edit/${course.id}`);
                      }}
                      className="bg-white hover:bg-slate-50"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchQuery ? 'No courses found' : 'No Courses Yet'}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchQuery 
                ? 'Try a different search term' 
                : isInstructorOrAdmin 
                  ? 'Create your first course to get started'
                  : 'Enroll in a cohort to start building your portfolio'
              }
            </p>
            {isInstructorOrAdmin && !searchQuery && (
              <Button 
                onClick={() => router.push('/instructor/courses/new')}
                style={{ backgroundColor: '#FF6B35' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Course
              </Button>
            )}
            {!isInstructorOrAdmin && (
              <Button onClick={() => router.push('/dashboard')}>
                Browse Cohorts
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
