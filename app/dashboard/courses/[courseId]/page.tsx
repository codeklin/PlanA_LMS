'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/lib/supabase-auth-context';
import { supabaseApi } from '@/lib/supabase-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        if (params.courseId) {
          const data = await supabaseApi.getCourse(params.courseId as string);
          setCourse(data);
        }
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourse();
  }, [params.courseId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FF6B35', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Project Not Found</h3>
          <Button onClick={() => router.push('/dashboard/courses')}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard/courses')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>

        <div>
          <h1 className="text-4xl font-bold tracking-tight">{course.title}</h1>
          <p className="text-slate-500 mt-2 text-lg">{course.description}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500">
              Course content viewer is being developed. Check back soon!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
