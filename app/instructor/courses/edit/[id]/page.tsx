'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/lib/supabase-auth-context';
import { supabaseApi } from '@/lib/supabase-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { CourseForm } from '@/components/instructor/course-builder/course-form';
import { ModuleManager } from '@/components/instructor/course-builder/module-manager';
import { toast } from 'sonner';

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<'details' | 'modules'>('details');

  useEffect(() => {
    loadCourse();
  }, [params.id]);

  const loadCourse = async () => {
    try {
      if (params.id) {
        const data = await supabaseApi.getCourse(params.id as string);
        setCourse(data);
        // If course has modules, go directly to module management
        if (data.modules && data.modules.length > 0) {
          setStep('modules');
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
      toast.error('Failed to load course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseUpdate = (updatedCourse: any) => {
    setCourse(updatedCourse);
    setStep('modules');
  };

  const handleComplete = async () => {
    try {
      await supabaseApi.updateCourse(course.id, { is_published: true });
      toast.success('Course published successfully!');
      router.push('/dashboard/courses');
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish course');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: '#FF6B35' }} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Course Not Found</h3>
          <Button onClick={() => router.push('/dashboard/courses')}>
            Back to Courses
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
          Back to Courses
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
          <p className="text-slate-500 mt-2">Update your course content and curriculum</p>
        </div>

        {step === 'details' ? (
          <CourseForm 
            initialData={course}
            onSuccess={handleCourseUpdate}
          />
        ) : (
          <ModuleManager
            courseId={course.id}
            initialModules={course.modules}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}

              <Edit className="h-6 w-6 text-blue-600" />
              <CardTitle>Coming Soon</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500">
              Course editing features are being developed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
